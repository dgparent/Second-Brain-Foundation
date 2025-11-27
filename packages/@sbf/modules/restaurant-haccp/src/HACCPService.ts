import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { HACCPLogEntity, createHACCPLog, HACCPLogMetadata } from './entities/HACCPEntity';

export class HACCPService {
  constructor(
    private entityManager: EntityManager,
    private aiProvider: BaseAIProvider
  ) {}

  async logEntry(
    item: string,
    logType: HACCPLogMetadata['logType'],
    value: string | number,
    performedBy: string,
    isCCP: boolean = false,
    correctiveAction?: string
  ): Promise<HACCPLogEntity> {
    const uid = `haccp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const title = `${logType.toUpperCase()}: ${item} - ${value}`;
    
    const log = createHACCPLog({
      uid,
      title,
      logType,
      item,
      value,
      performedBy,
      isCriticalControlPoint: isCCP,
      correctiveAction
    });

    await this.entityManager.create(log);
    return log;
  }

  async getLogs(startDate?: string, endDate?: string): Promise<HACCPLogEntity[]> {
    const entities = await this.entityManager.getAll();
    let logs = entities.filter(e => e.type === 'haccp.log') as HACCPLogEntity[];
    
    if (startDate) {
      logs = logs.filter(l => l.created >= startDate);
    }
    
    if (endDate) {
      logs = logs.filter(l => l.created <= endDate);
    }
    
    return logs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }
}
