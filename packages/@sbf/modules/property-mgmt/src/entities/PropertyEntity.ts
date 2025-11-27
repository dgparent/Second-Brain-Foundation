import { Entity } from '@sbf/shared';

export interface PropertyMetadata {
  address: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land';
  status: 'occupied' | 'vacant' | 'maintenance' | 'listed';
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  tenants?: string[]; // Tenant UIDs
  units?: number;
  description?: string;
}

export interface PropertyEntity extends Entity {
  type: 'property.asset';
  metadata: PropertyMetadata;
}

export function createProperty(data: {
  uid: string;
  title: string;
  address: string;
  propertyType: PropertyMetadata['propertyType'];
  status?: PropertyMetadata['status'];
  purchaseDate?: string;
  purchasePrice?: number;
  description?: string;
}): PropertyEntity {
  return {
    uid: data.uid,
    type: 'property.asset',
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
      address: data.address,
      propertyType: data.propertyType,
      status: data.status || 'vacant',
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      description: data.description,
      tenants: [],
    },
  };
}
