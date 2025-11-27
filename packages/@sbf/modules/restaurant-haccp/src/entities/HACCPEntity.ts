import { Entity } from '@sbf/shared';

export interface HACCPLogMetadata {
  logType: 'temperature' | 'cleaning' | 'receiving' | 'calibration';
  item: string; // e.g., "Walk-in Cooler", "Chicken Breast"
  value: string | number; // e.g., "38F", "Pass"
  unit?: string;
  location?: string;
  performedBy: string;
  verifiedBy?: string;
  isCriticalControlPoint: boolean;
  correctiveAction?: string;
  notes?: string;
}

export interface HACCPLogEntity extends Entity {
  type: 'haccp.log';
  metadata: HACCPLogMetadata;
}

export function createHACCPLog(data: {
  uid: string;
  title: string;
  logType: HACCPLogMetadata['logType'];
  item: string;
  value: string | number;
  performedBy: string;
  isCriticalControlPoint?: boolean;
  correctiveAction?: string;
}): HACCPLogEntity {
  return {
    uid: data.uid,
    type: 'haccp.log',
    title: data.title,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      logType: data.logType,
      item: data.item,
      value: data.value,
      performedBy: data.performedBy,
      isCriticalControlPoint: data.isCriticalControlPoint || false,
      correctiveAction: data.correctiveAction,
    },
  };
}
