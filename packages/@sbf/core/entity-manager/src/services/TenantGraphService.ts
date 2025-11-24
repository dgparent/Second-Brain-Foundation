// Tenant Graph Service
// Manages per-tenant knowledge graph nodes and relationships

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

export interface GraphNode {
  uid: string;
  type: string;
  properties: Record<string, any>;
  labels?: string[];
  tenant_id?: string;  // Injected automatically
  created_at?: Date;
  updated_at?: Date;
}

export interface GraphRelationship {
  id?: string;
  type: string;
  from_uid: string;
  to_uid: string;
  properties?: Record<string, any>;
  tenant_id?: string;  // Injected automatically
  created_at?: Date;
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface GraphPathResult {
  path: Array<GraphNode | GraphRelationship>;
  length: number;
}

@Injectable()
export class TenantGraphService {
  private readonly graphDB: any;  // Replace with actual graph DB client (Neo4j, etc.)

  constructor() {
    // Initialize graph DB connection
    // this.graphDB = new Neo4jDriver(process.env.NEO4J_URL);
  }

  /**
   * Create a node with automatic tenant isolation
   * SECURITY: Always injects tenant_id
   */
  async createNode(
    tenantId: string,
    nodeData: Partial<GraphNode>
  ): Promise<GraphNode> {
    this.validateTenantId(tenantId);

    // SECURITY: Inject tenant_id into node
    const secureNode: GraphNode = {
      ...nodeData,
      uid: nodeData.uid || this.generateUid(nodeData.type),
      type: nodeData.type || 'entity',
      properties: nodeData.properties || {},
      tenant_id: tenantId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const query = `
      CREATE (n:Node {
        uid: $uid,
        type: $type,
        tenant_id: $tenant_id,
        created_at: $created_at,
        updated_at: $updated_at
      })
      SET n += $properties
      RETURN n
    `;

    const result = await this.graphDB.run(query, secureNode);
    return result.records[0]?.get('n').properties;
  }

  /**
   * Get node by UID within tenant boundary
   * SECURITY: Filters by tenant_id
   */
  async getNode(tenantId: string, uid: string): Promise<GraphNode | null> {
    this.validateTenantId(tenantId);

    const query = `
      MATCH (n {uid: $uid, tenant_id: $tenant_id})
      RETURN n
    `;

    const result = await this.graphDB.run(query, { uid, tenant_id: tenantId });
    
    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('n').properties;
  }

  /**
   * Update node within tenant
   * SECURITY: Verifies tenant ownership before update
   */
  async updateNode(
    tenantId: string,
    uid: string,
    updates: Partial<GraphNode>
  ): Promise<GraphNode> {
    this.validateTenantId(tenantId);

    // Verify node exists and belongs to tenant
    const existingNode = await this.getNode(tenantId, uid);
    if (!existingNode) {
      throw new NotFoundException(`Node ${uid} not found in tenant ${tenantId}`);
    }

    const query = `
      MATCH (n {uid: $uid, tenant_id: $tenant_id})
      SET n += $updates, n.updated_at = $updated_at
      RETURN n
    `;

    const result = await this.graphDB.run(query, {
      uid,
      tenant_id: tenantId,
      updates: updates.properties || {},
      updated_at: new Date()
    });

    return result.records[0].get('n').properties;
  }

  /**
   * Delete node within tenant
   * Also deletes all relationships involving this node
   */
  async deleteNode(tenantId: string, uid: string): Promise<void> {
    this.validateTenantId(tenantId);

    const query = `
      MATCH (n {uid: $uid, tenant_id: $tenant_id})
      DETACH DELETE n
    `;

    await this.graphDB.run(query, { uid, tenant_id: tenantId });
  }

  /**
   * Create relationship between nodes
   * SECURITY: Verifies both nodes belong to tenant
   */
  async createRelationship(
    tenantId: string,
    relationship: GraphRelationship
  ): Promise<GraphRelationship> {
    this.validateTenantId(tenantId);

    // Verify both nodes exist and belong to tenant
    const fromNode = await this.getNode(tenantId, relationship.from_uid);
    const toNode = await this.getNode(tenantId, relationship.to_uid);

    if (!fromNode || !toNode) {
      throw new BadRequestException(
        `Both nodes must exist and belong to tenant ${tenantId}`
      );
    }

    const query = `
      MATCH (from {uid: $from_uid, tenant_id: $tenant_id})
      MATCH (to {uid: $to_uid, tenant_id: $tenant_id})
      CREATE (from)-[r:${relationship.type} {
        tenant_id: $tenant_id,
        created_at: $created_at
      }]->(to)
      SET r += $properties
      RETURN r, id(r) as rel_id
    `;

    const result = await this.graphDB.run(query, {
      from_uid: relationship.from_uid,
      to_uid: relationship.to_uid,
      tenant_id: tenantId,
      properties: relationship.properties || {},
      created_at: new Date()
    });

    const record = result.records[0];
    const rel = record.get('r').properties;
    
    return {
      ...relationship,
      id: record.get('rel_id').toString(),
      ...rel
    };
  }

  /**
   * Get relationships for a node
   */
  async getNodeRelationships(
    tenantId: string,
    uid: string,
    direction: 'in' | 'out' | 'both' = 'both'
  ): Promise<GraphRelationship[]> {
    this.validateTenantId(tenantId);

    let pattern: string;
    switch (direction) {
      case 'in':
        pattern = '(other)-[r]->(n)';
        break;
      case 'out':
        pattern = '(n)-[r]->(other)';
        break;
      case 'both':
      default:
        pattern = '(n)-[r]-(other)';
        break;
    }

    const query = `
      MATCH (n {uid: $uid, tenant_id: $tenant_id})
      MATCH ${pattern}
      WHERE other.tenant_id = $tenant_id
      RETURN r, id(r) as rel_id, startNode(r).uid as from_uid, endNode(r).uid as to_uid
    `;

    const result = await this.graphDB.run(query, { uid, tenant_id: tenantId });

    return result.records.map(record => {
      const rel = record.get('r');
      return {
        id: record.get('rel_id').toString(),
        type: rel.type,
        from_uid: record.get('from_uid'),
        to_uid: record.get('to_uid'),
        properties: rel.properties,
        tenant_id: tenantId
      };
    });
  }

  /**
   * Delete relationship
   */
  async deleteRelationship(
    tenantId: string,
    relationshipId: string
  ): Promise<void> {
    this.validateTenantId(tenantId);

    const query = `
      MATCH ()-[r]->()
      WHERE id(r) = $rel_id AND r.tenant_id = $tenant_id
      DELETE r
    `;

    await this.graphDB.run(query, {
      rel_id: parseInt(relationshipId),
      tenant_id: tenantId
    });
  }

  /**
   * Query graph with Cypher within tenant boundary
   * SECURITY: Automatically wraps query with tenant filter
   */
  async query(
    tenantId: string,
    cypherQuery: string,
    params: Record<string, any> = {}
  ): Promise<GraphQueryResult> {
    this.validateTenantId(tenantId);

    // SECURITY: Wrap user query with tenant filter
    const secureQuery = `
      MATCH (n)
      WHERE n.tenant_id = $tenant_id
      WITH n
      ${cypherQuery}
    `;

    const result = await this.graphDB.run(secureQuery, {
      ...params,
      tenant_id: tenantId
    });

    // Parse results into nodes and relationships
    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];

    for (const record of result.records) {
      // Extract nodes and relationships from record
      record.keys.forEach(key => {
        const value = record.get(key);
        
        if (value && value.labels) {
          // It's a node
          nodes.push(value.properties);
        } else if (value && value.type) {
          // It's a relationship
          relationships.push({
            id: value.identity?.toString(),
            type: value.type,
            from_uid: value.start?.properties?.uid,
            to_uid: value.end?.properties?.uid,
            properties: value.properties,
            tenant_id: tenantId
          });
        }
      });
    }

    return { nodes, relationships };
  }

  /**
   * Get entity relationships up to certain depth
   * Used for Knowledge Graph visualization
   */
  async getEntityGraph(
    tenantId: string,
    entityUid: string,
    depth: number = 2
  ): Promise<GraphQueryResult> {
    this.validateTenantId(tenantId);

    if (depth < 1 || depth > 5) {
      throw new BadRequestException('Depth must be between 1 and 5');
    }

    const query = `
      MATCH path = (n {uid: $entityUid, tenant_id: $tenant_id})-[*1..${depth}]-(related)
      WHERE related.tenant_id = $tenant_id
      RETURN nodes(path) as nodes, relationships(path) as rels
    `;

    const result = await this.graphDB.run(query, {
      entityUid,
      tenant_id: tenantId
    });

    const allNodes = new Map<string, GraphNode>();
    const allRelationships = new Map<string, GraphRelationship>();

    for (const record of result.records) {
      const nodes = record.get('nodes');
      const rels = record.get('rels');

      nodes.forEach((node: any) => {
        allNodes.set(node.properties.uid, node.properties);
      });

      rels.forEach((rel: any) => {
        const relId = rel.identity.toString();
        allRelationships.set(relId, {
          id: relId,
          type: rel.type,
          from_uid: rel.start.properties.uid,
          to_uid: rel.end.properties.uid,
          properties: rel.properties,
          tenant_id: tenantId
        });
      });
    }

    return {
      nodes: Array.from(allNodes.values()),
      relationships: Array.from(allRelationships.values())
    };
  }

  /**
   * Find shortest path between two nodes
   */
  async findShortestPath(
    tenantId: string,
    fromUid: string,
    toUid: string,
    maxDepth: number = 5
  ): Promise<GraphPathResult | null> {
    this.validateTenantId(tenantId);

    const query = `
      MATCH (from {uid: $fromUid, tenant_id: $tenant_id})
      MATCH (to {uid: $toUid, tenant_id: $tenant_id})
      MATCH path = shortestPath((from)-[*1..${maxDepth}]-(to))
      WHERE all(node in nodes(path) WHERE node.tenant_id = $tenant_id)
      RETURN path
      LIMIT 1
    `;

    const result = await this.graphDB.run(query, {
      fromUid,
      toUid,
      tenant_id: tenantId
    });

    if (result.records.length === 0) {
      return null;
    }

    const path = result.records[0].get('path');
    const pathElements = [];

    // Alternate between nodes and relationships
    for (let i = 0; i < path.length; i++) {
      const segment = path.segments[i];
      pathElements.push(segment.start.properties);
      pathElements.push({
        type: segment.relationship.type,
        properties: segment.relationship.properties
      });
    }
    pathElements.push(path.end.properties);

    return {
      path: pathElements,
      length: path.length
    };
  }

  /**
   * Search nodes by properties within tenant
   */
  async searchNodes(
    tenantId: string,
    searchCriteria: Record<string, any>
  ): Promise<GraphNode[]> {
    this.validateTenantId(tenantId);

    // Build WHERE clause from search criteria
    const whereClauses = Object.keys(searchCriteria)
      .map(key => `n.properties.${key} = $${key}`)
      .join(' AND ');

    const query = `
      MATCH (n {tenant_id: $tenant_id})
      WHERE ${whereClauses || '1=1'}
      RETURN n
      LIMIT 100
    `;

    const result = await this.graphDB.run(query, {
      ...searchCriteria,
      tenant_id: tenantId
    });

    return result.records.map(record => record.get('n').properties);
  }

  /**
   * Get tenant graph statistics
   */
  async getTenantGraphStats(tenantId: string): Promise<{
    nodeCount: number;
    relationshipCount: number;
    nodeTypes: Array<{ type: string; count: number }>;
    relationshipTypes: Array<{ type: string; count: number }>;
  }> {
    this.validateTenantId(tenantId);

    const queries = {
      nodeCount: `
        MATCH (n {tenant_id: $tenant_id})
        RETURN count(n) as count
      `,
      relationshipCount: `
        MATCH ()-[r {tenant_id: $tenant_id}]->()
        RETURN count(r) as count
      `,
      nodeTypes: `
        MATCH (n {tenant_id: $tenant_id})
        RETURN n.type as type, count(n) as count
        ORDER BY count DESC
      `,
      relationshipTypes: `
        MATCH ()-[r {tenant_id: $tenant_id}]->()
        RETURN type(r) as type, count(r) as count
        ORDER BY count DESC
      `
    };

    const [nodeCount, relationshipCount, nodeTypes, relationshipTypes] = await Promise.all([
      this.graphDB.run(queries.nodeCount, { tenant_id: tenantId }),
      this.graphDB.run(queries.relationshipCount, { tenant_id: tenantId }),
      this.graphDB.run(queries.nodeTypes, { tenant_id: tenantId }),
      this.graphDB.run(queries.relationshipTypes, { tenant_id: tenantId })
    ]);

    return {
      nodeCount: nodeCount.records[0]?.get('count')?.toNumber() || 0,
      relationshipCount: relationshipCount.records[0]?.get('count')?.toNumber() || 0,
      nodeTypes: nodeTypes.records.map(r => ({
        type: r.get('type'),
        count: r.get('count').toNumber()
      })),
      relationshipTypes: relationshipTypes.records.map(r => ({
        type: r.get('type'),
        count: r.get('count').toNumber()
      }))
    };
  }

  /**
   * Delete all graph data for tenant (offboarding)
   * DANGER: This is destructive!
   */
  async deleteTenantGraph(tenantId: string): Promise<void> {
    this.validateTenantId(tenantId);

    const query = `
      MATCH (n {tenant_id: $tenant_id})
      DETACH DELETE n
    `;

    await this.graphDB.run(query, { tenant_id: tenantId });
  }

  /**
   * Export tenant graph for backup/migration
   */
  async exportTenantGraph(tenantId: string): Promise<{
    tenant_id: string;
    exported_at: string;
    nodes: GraphNode[];
    relationships: GraphRelationship[];
  }> {
    this.validateTenantId(tenantId);

    const nodesQuery = `
      MATCH (n {tenant_id: $tenant_id})
      RETURN n
    `;

    const relsQuery = `
      MATCH (from {tenant_id: $tenant_id})-[r]->(to {tenant_id: $tenant_id})
      RETURN r, from.uid as from_uid, to.uid as to_uid, type(r) as type
    `;

    const [nodesResult, relsResult] = await Promise.all([
      this.graphDB.run(nodesQuery, { tenant_id: tenantId }),
      this.graphDB.run(relsQuery, { tenant_id: tenantId })
    ]);

    const nodes = nodesResult.records.map(r => r.get('n').properties);
    const relationships = relsResult.records.map(r => ({
      type: r.get('type'),
      from_uid: r.get('from_uid'),
      to_uid: r.get('to_uid'),
      properties: r.get('r').properties,
      tenant_id: tenantId
    }));

    return {
      tenant_id: tenantId,
      exported_at: new Date().toISOString(),
      nodes,
      relationships
    };
  }

  /**
   * Validate tenant ID format
   */
  private validateTenantId(tenantId: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException(`Invalid tenant_id format: ${tenantId}`);
    }
  }

  /**
   * Generate UID for new node
   */
  private generateUid(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}-${timestamp}-${random}`;
  }
}
