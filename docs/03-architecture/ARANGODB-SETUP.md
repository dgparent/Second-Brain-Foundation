# ArangoDB Setup Guide for SBF

## Quick Start with Docker

### 1. Install ArangoDB
```bash
# Pull the latest ArangoDB image
docker pull arangodb/arangodb:latest

# Run ArangoDB container
docker run -e ARANGO_ROOT_PASSWORD=sbf_development -p 8529:8529 -d --name sbf-arangodb arangodb/arangodb:latest
```

### 2. Access Web Interface
- URL: http://localhost:8529
- Username: `root`
- Password: `sbf_development`

### 3. Create SBF Database
```javascript
// In ArangoDB web interface > DB > Add Database
Database name: sbf_knowledge
```

### 4. Update SBF Configuration
Create a config file or set environment variables:

```typescript
// .env or config file
ARANGO_URL=http://localhost:8529
ARANGO_DATABASE=sbf_knowledge
ARANGO_USERNAME=root
ARANGO_PASSWORD=sbf_development
```

### 5. Test Connection
```typescript
// Test script: scripts/test-arango-connection.ts
import { Database } from 'arangojs';

const db = new Database({
  url: 'http://localhost:8529',
  auth: { username: 'root', password: 'sbf_development' },
});

db.useDatabase('sbf_knowledge');

async function test() {
  const version = await db.version();
  console.log('✅ Connected to ArangoDB:', version);
}

test().catch(console.error);
```

## Schema Setup

The ArangoDBAdapter will automatically create:
- **Collection: `entities`** - Stores all knowledge entities
- **Edge Collection: `relationships`** - Stores typed relationships
- **Indexes:**
  - `uid` - Unique identifier index
  - `type` - Entity type index
  - `title` - Entity title index (for search)
  - `lifecycle.state` - Lifecycle state index
  - `sensitivity.level` - Privacy level index

## Development vs Production

### Development
- Single container, local storage
- Root password acceptable
- No SSL required

### Production
- Cluster mode (3+ nodes recommended)
- Separate user accounts with limited privileges
- SSL/TLS encryption
- Regular backups
- Monitoring setup

## Useful Docker Commands

```bash
# Start container
docker start sbf-arangodb

# Stop container
docker stop sbf-arangodb

# View logs
docker logs sbf-arangodb

# Restart container
docker restart sbf-arangodb

# Remove container (WARNING: deletes all data)
docker rm -f sbf-arangodb

# Backup database
docker exec sbf-arangodb arangodump --output-directory /backup

# Shell access
docker exec -it sbf-arangodb /bin/bash
```

## Alternative: Cloud ArangoDB

### ArangoDB Oasis (Managed Cloud)
1. Sign up at https://cloud.arangodb.com/
2. Create a free tier deployment
3. Get connection details
4. Update SBF config with cloud credentials

**Pros:**
- No local setup required
- Automatic backups
- High availability

**Cons:**
- Requires internet connection
- Free tier limitations

## Troubleshooting

### Issue: Container won't start
```bash
# Check if port 8529 is already in use
netstat -ano | findstr :8529

# Use different port
docker run -e ARANGO_ROOT_PASSWORD=sbf_development -p 9529:8529 -d --name sbf-arangodb arangodb/arangodb:latest
```

### Issue: Can't connect from SBF
- Verify container is running: `docker ps`
- Check firewall settings
- Ensure correct credentials in config

### Issue: Database not found
```bash
# List all databases
docker exec sbf-arangodb arangosh --server.password sbf_development --server.database _system --javascript.execute-string "db._databases()"
```

## Next Steps After Setup

1. ✅ Verify ArangoDB is running
2. ✅ Test connection from SBF
3. ✅ Run Memory Engine initialization
4. ✅ Create first test entity
5. ✅ Query entity from graph

---

**Setup Time:** ~5 minutes
**Required:** Docker Desktop or Docker Engine
**Alternative:** Native installation (see ArangoDB docs)
