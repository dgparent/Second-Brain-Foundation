import { KnowledgeNodeEntity } from '../entities/KnowledgeNodeEntity.js';

export class KnowledgeGraphWorkflow {
  /**
   * Find related nodes by following relationship links
   */
  async findRelatedNodes(
    nodes: KnowledgeNodeEntity[],
    nodeUid: string,
    maxDepth: number = 2
  ): Promise<KnowledgeNodeEntity[]> {
    const visited = new Set<string>();
    const related: KnowledgeNodeEntity[] = [];
    
    const traverse = (uid: string, depth: number) => {
      if (depth > maxDepth || visited.has(uid)) return;
      visited.add(uid);
      
      const node = nodes.find(n => n.uid === uid);
      if (!node) return;
      
      if (uid !== nodeUid) {
        related.push(node);
      }
      
      // Traverse related nodes
      node.metadata.related_node_uids?.forEach(relUid => traverse(relUid, depth + 1));
      node.metadata.child_node_uids?.forEach(childUid => traverse(childUid, depth + 1));
    };
    
    traverse(nodeUid, 0);
    return related;
  }

  /**
   * Build learning path by following prerequisites
   */
  async buildLearningPath(
    nodes: KnowledgeNodeEntity[],
    targetNodeUid: string
  ): Promise<KnowledgeNodeEntity[]> {
    const path: KnowledgeNodeEntity[] = [];
    const visited = new Set<string>();
    
    const buildPath = (uid: string) => {
      if (visited.has(uid)) return;
      visited.add(uid);
      
      const node = nodes.find(n => n.uid === uid);
      if (!node) return;
      
      // First add prerequisites
      node.metadata.prerequisite_uids?.forEach(prereqUid => buildPath(prereqUid));
      
      // Then add this node
      path.push(node);
    };
    
    buildPath(targetNodeUid);
    return path;
  }

  /**
   * Find nodes by topic/tag
   */
  async findNodesByTopic(
    nodes: KnowledgeNodeEntity[],
    topic: string
  ): Promise<KnowledgeNodeEntity[]> {
    const lowerTopic = topic.toLowerCase();
    return nodes.filter(node =>
      node.metadata.tags.some(tag => tag.toLowerCase().includes(lowerTopic)) ||
      node.metadata.category?.toLowerCase().includes(lowerTopic) ||
      node.title.toLowerCase().includes(lowerTopic)
    );
  }

  /**
   * Identify knowledge gaps (nodes that are prerequisites but not mastered)
   */
  async findKnowledgeGaps(
    nodes: KnowledgeNodeEntity[],
    topicTag: string
  ): Promise<{ missing: string[]; weak: KnowledgeNodeEntity[] }> {
    const topicNodes = await this.findNodesByTopic(nodes, topicTag);
    const allPrerequisites = new Set<string>();
    
    // Collect all prerequisites
    topicNodes.forEach(node => {
      node.metadata.prerequisite_uids?.forEach(uid => allPrerequisites.add(uid));
    });
    
    // Find missing and weak nodes
    const missing: string[] = [];
    const weak: KnowledgeNodeEntity[] = [];
    
    allPrerequisites.forEach(uid => {
      const node = nodes.find(n => n.uid === uid);
      if (!node) {
        missing.push(uid);
      } else if ((node.metadata.mastery_level || 0) < 70) {
        weak.push(node);
      }
    });
    
    return { missing, weak };
  }

  /**
   * Get node statistics
   */
  getNodeStats(nodes: KnowledgeNodeEntity[]): {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    average_mastery: number;
  } {
    const by_status: Record<string, number> = {};
    const by_type: Record<string, number> = {};
    let totalMastery = 0;
    let masteryCount = 0;
    
    nodes.forEach(node => {
      // Count by status
      by_status[node.metadata.status] = (by_status[node.metadata.status] || 0) + 1;
      
      // Count by type
      by_type[node.metadata.content_type] = (by_type[node.metadata.content_type] || 0) + 1;
      
      // Average mastery
      if (node.metadata.mastery_level !== undefined) {
        totalMastery += node.metadata.mastery_level;
        masteryCount++;
      }
    });
    
    return {
      total: nodes.length,
      by_status,
      by_type,
      average_mastery: masteryCount > 0 ? totalMastery / masteryCount : 0
    };
  }
}
