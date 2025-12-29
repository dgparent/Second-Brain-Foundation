"""
Multi-tenant PostgreSQL checkpointer for LangGraph.

Provides conversation persistence with tenant isolation via RLS.
"""

import json
import logging
import uuid
from typing import Any, Dict, Iterator, Optional, Tuple, List
from datetime import datetime

from langgraph.checkpoint.base import (
    BaseCheckpointSaver,
    Checkpoint,
    CheckpointMetadata,
    CheckpointTuple,
)

logger = logging.getLogger(__name__)


class PostgresCheckpointer(BaseCheckpointSaver):
    """
    Multi-tenant PostgreSQL checkpointer for LangGraph.
    
    Isolates chat state by tenant_id using PostgreSQL RLS policies.
    Each thread can have multiple checkpoints, enabling conversation branching.
    
    Usage:
        pool = await asyncpg.create_pool(dsn)
        checkpointer = PostgresCheckpointer(pool, tenant_id)
        await checkpointer.setup()  # Creates table if needed
        
        graph = create_chat_graph(checkpointer)
        result = await graph.ainvoke(state, config={"thread_id": "abc"})
    """
    
    TABLE_NAME = "langgraph_checkpoints"
    
    def __init__(
        self, 
        connection_pool: Any,  # asyncpg.Pool
        tenant_id: str,
        serde: Optional[Any] = None
    ):
        """
        Initialize PostgresCheckpointer.
        
        Args:
            connection_pool: asyncpg connection pool
            tenant_id: UUID string for tenant isolation
            serde: Optional custom serializer (uses JSON by default)
        """
        super().__init__(serde=serde)
        self.pool = connection_pool
        self.tenant_id = tenant_id
    
    async def setup(self) -> None:
        """
        Create checkpoint table and RLS policies if they don't exist.
        
        Should be called once at application startup.
        """
        async with self.pool.acquire() as conn:
            await conn.execute(f"""
                CREATE TABLE IF NOT EXISTS {self.TABLE_NAME} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL,
                    thread_id TEXT NOT NULL,
                    checkpoint_id TEXT NOT NULL,
                    parent_checkpoint_id TEXT,
                    checkpoint JSONB NOT NULL,
                    metadata JSONB DEFAULT '{{}}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(tenant_id, thread_id, checkpoint_id)
                );
                
                -- Index for efficient lookups
                CREATE INDEX IF NOT EXISTS idx_checkpoints_tenant_thread 
                ON {self.TABLE_NAME}(tenant_id, thread_id, created_at DESC);
                
                -- Enable RLS for multi-tenant isolation
                ALTER TABLE {self.TABLE_NAME} ENABLE ROW LEVEL SECURITY;
                
                -- Drop and recreate policy to avoid conflicts
                DROP POLICY IF EXISTS tenant_isolation ON {self.TABLE_NAME};
                
                CREATE POLICY tenant_isolation ON {self.TABLE_NAME}
                FOR ALL
                USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
            """)
            
            logger.info(f"Checkpoint table {self.TABLE_NAME} ready")
    
    async def aget(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
        """
        Get the latest checkpoint for a thread.
        
        Args:
            config: Configuration dict with thread_id in configurable key
            
        Returns:
            CheckpointTuple if found, None otherwise
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        if not thread_id:
            return None
        
        async with self.pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute(
                "SELECT set_config('app.current_tenant_id', $1, true)",
                str(self.tenant_id)
            )
            
            row = await conn.fetchrow(f"""
                SELECT 
                    checkpoint_id,
                    parent_checkpoint_id,
                    checkpoint,
                    metadata,
                    created_at
                FROM {self.TABLE_NAME}
                WHERE tenant_id = $1 AND thread_id = $2
                ORDER BY created_at DESC 
                LIMIT 1
            """, uuid.UUID(self.tenant_id), thread_id)
            
            if not row:
                return None
            
            checkpoint_data = row["checkpoint"]
            if isinstance(checkpoint_data, str):
                checkpoint_data = json.loads(checkpoint_data)
            
            metadata_data = row["metadata"] or {}
            if isinstance(metadata_data, str):
                metadata_data = json.loads(metadata_data)
            
            return CheckpointTuple(
                config={
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_id": row["checkpoint_id"],
                    }
                },
                checkpoint=checkpoint_data,
                metadata=metadata_data,
                parent_config={
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_id": row["parent_checkpoint_id"],
                    }
                } if row["parent_checkpoint_id"] else None,
            )
    
    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Save a checkpoint for a thread.
        
        Args:
            config: Configuration dict with thread_id
            checkpoint: The checkpoint data to save
            metadata: Metadata about the checkpoint
            new_versions: Channel versions (optional)
            
        Returns:
            Updated config with checkpoint_id
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        if not thread_id:
            raise ValueError("thread_id is required in config.configurable")
        
        checkpoint_id = checkpoint.get("id", str(uuid.uuid4()))
        parent_checkpoint_id = config.get("configurable", {}).get("checkpoint_id")
        
        async with self.pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute(
                "SELECT set_config('app.current_tenant_id', $1, true)",
                str(self.tenant_id)
            )
            
            await conn.execute(f"""
                INSERT INTO {self.TABLE_NAME} 
                (tenant_id, thread_id, checkpoint_id, parent_checkpoint_id, checkpoint, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (tenant_id, thread_id, checkpoint_id) 
                DO UPDATE SET 
                    checkpoint = $5, 
                    metadata = $6,
                    created_at = NOW()
            """, 
                uuid.UUID(self.tenant_id),
                thread_id,
                checkpoint_id,
                parent_checkpoint_id,
                json.dumps(checkpoint),
                json.dumps(metadata) if metadata else "{}",
            )
            
            logger.debug(f"Saved checkpoint {checkpoint_id} for thread {thread_id}")
        
        return {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_id": checkpoint_id,
            }
        }
    
    async def alist(
        self,
        config: Optional[Dict[str, Any]] = None,
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        """
        List checkpoints for a thread.
        
        Args:
            config: Configuration with thread_id
            filter: Optional filter criteria
            before: Optional cursor for pagination
            limit: Maximum number of checkpoints to return
            
        Yields:
            CheckpointTuple for each matching checkpoint
        """
        thread_id = config.get("configurable", {}).get("thread_id") if config else None
        
        async with self.pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute(
                "SELECT set_config('app.current_tenant_id', $1, true)",
                str(self.tenant_id)
            )
            
            query = f"""
                SELECT 
                    thread_id,
                    checkpoint_id,
                    parent_checkpoint_id,
                    checkpoint,
                    metadata,
                    created_at
                FROM {self.TABLE_NAME}
                WHERE tenant_id = $1
            """
            params: List[Any] = [uuid.UUID(self.tenant_id)]
            
            if thread_id:
                query += " AND thread_id = $2"
                params.append(thread_id)
            
            query += " ORDER BY created_at DESC"
            
            if limit:
                query += f" LIMIT {limit}"
            
            rows = await conn.fetch(query, *params)
            
            for row in rows:
                checkpoint_data = row["checkpoint"]
                if isinstance(checkpoint_data, str):
                    checkpoint_data = json.loads(checkpoint_data)
                
                metadata_data = row["metadata"] or {}
                if isinstance(metadata_data, str):
                    metadata_data = json.loads(metadata_data)
                
                yield CheckpointTuple(
                    config={
                        "configurable": {
                            "thread_id": row["thread_id"],
                            "checkpoint_id": row["checkpoint_id"],
                        }
                    },
                    checkpoint=checkpoint_data,
                    metadata=metadata_data,
                    parent_config={
                        "configurable": {
                            "thread_id": row["thread_id"],
                            "checkpoint_id": row["parent_checkpoint_id"],
                        }
                    } if row["parent_checkpoint_id"] else None,
                )
    
    async def adelete(
        self,
        config: Dict[str, Any],
    ) -> None:
        """
        Delete checkpoints for a thread.
        
        Args:
            config: Configuration with thread_id to delete
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        if not thread_id:
            raise ValueError("thread_id is required")
        
        async with self.pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute(
                "SELECT set_config('app.current_tenant_id', $1, true)",
                str(self.tenant_id)
            )
            
            result = await conn.execute(f"""
                DELETE FROM {self.TABLE_NAME}
                WHERE tenant_id = $1 AND thread_id = $2
            """, uuid.UUID(self.tenant_id), thread_id)
            
            logger.info(f"Deleted checkpoints for thread {thread_id}")
    
    async def prune_old_checkpoints(
        self,
        thread_id: str,
        keep_count: int = 10
    ) -> int:
        """
        Prune old checkpoints for a thread, keeping only the most recent N.
        
        Helps manage checkpoint table size for long-running conversations.
        
        Args:
            thread_id: Thread to prune checkpoints for
            keep_count: Number of most recent checkpoints to keep
            
        Returns:
            Number of checkpoints deleted
        """
        async with self.pool.acquire() as conn:
            # Set tenant context for RLS
            await conn.execute(
                "SELECT set_config('app.current_tenant_id', $1, true)",
                str(self.tenant_id)
            )
            
            result = await conn.execute(f"""
                DELETE FROM {self.TABLE_NAME}
                WHERE tenant_id = $1 
                  AND thread_id = $2
                  AND id NOT IN (
                      SELECT id 
                      FROM {self.TABLE_NAME}
                      WHERE tenant_id = $1 AND thread_id = $2
                      ORDER BY created_at DESC
                      LIMIT $3
                  )
            """, uuid.UUID(self.tenant_id), thread_id, keep_count)
            
            # Parse "DELETE N" result
            deleted_count = int(result.split()[-1]) if result else 0
            
            if deleted_count > 0:
                logger.info(f"Pruned {deleted_count} old checkpoints for thread {thread_id}")
            
            return deleted_count
    
    # Synchronous versions for LangGraph compatibility
    def get(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
        """Synchronous get - wraps aget for non-async contexts."""
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(self.aget(config)))
                return future.result()
        except RuntimeError:
            return asyncio.run(self.aget(config))
    
    def put(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Synchronous put - wraps aput for non-async contexts."""
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    lambda: asyncio.run(self.aput(config, checkpoint, metadata, new_versions))
                )
                return future.result()
        except RuntimeError:
            return asyncio.run(self.aput(config, checkpoint, metadata, new_versions))
    
    def list(
        self,
        config: Optional[Dict[str, Any]] = None,
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        """Synchronous list - wraps alist for non-async contexts."""
        import asyncio
        
        async def collect():
            results = []
            async for item in self.alist(config, filter=filter, before=before, limit=limit):
                results.append(item)
            return results
        
        try:
            loop = asyncio.get_running_loop()
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(lambda: asyncio.run(collect()))
                return iter(future.result())
        except RuntimeError:
            return iter(asyncio.run(collect()))


class InMemoryCheckpointer(BaseCheckpointSaver):
    """
    In-memory checkpointer for testing and development.
    
    Does not persist data across restarts.
    """
    
    def __init__(self, tenant_id: str):
        super().__init__()
        self.tenant_id = tenant_id
        self._storage: Dict[str, Dict[str, CheckpointTuple]] = {}
    
    async def aget(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
        thread_id = config.get("configurable", {}).get("thread_id")
        if not thread_id:
            return None
        
        tenant_storage = self._storage.get(self.tenant_id, {})
        return tenant_storage.get(thread_id)
    
    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        thread_id = config.get("configurable", {}).get("thread_id")
        if not thread_id:
            raise ValueError("thread_id is required")
        
        checkpoint_id = checkpoint.get("id", str(uuid.uuid4()))
        
        if self.tenant_id not in self._storage:
            self._storage[self.tenant_id] = {}
        
        self._storage[self.tenant_id][thread_id] = CheckpointTuple(
            config={"configurable": {"thread_id": thread_id, "checkpoint_id": checkpoint_id}},
            checkpoint=checkpoint,
            metadata=metadata,
            parent_config=config.get("configurable", {}).get("checkpoint_id"),
        )
        
        return {"configurable": {"thread_id": thread_id, "checkpoint_id": checkpoint_id}}
    
    async def alist(
        self,
        config: Optional[Dict[str, Any]] = None,
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        thread_id = config.get("configurable", {}).get("thread_id") if config else None
        tenant_storage = self._storage.get(self.tenant_id, {})
        
        if thread_id:
            if thread_id in tenant_storage:
                yield tenant_storage[thread_id]
        else:
            for cp in tenant_storage.values():
                yield cp
    
    def get(self, config: Dict[str, Any]) -> Optional[CheckpointTuple]:
        import asyncio
        return asyncio.run(self.aget(config))
    
    def put(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        import asyncio
        return asyncio.run(self.aput(config, checkpoint, metadata, new_versions))
    
    def list(
        self,
        config: Optional[Dict[str, Any]] = None,
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        import asyncio
        
        async def collect():
            results = []
            async for item in self.alist(config, filter=filter, before=before, limit=limit):
                results.append(item)
            return results
        
        return iter(asyncio.run(collect()))
