/**
 * @sbf/privacy-engine - SensitivityFilter Middleware
 *
 * Filters content based on sensitivity before sending to AI or export.
 * Used by RAG chat, transformations, and export operations.
 */

import {
  ContentWithSensitivity,
  FilteredContent,
  SensitivityLevel,
} from '../types';
import { SensitivityService } from '../services/SensitivityService';
import { PermissionChecker } from '../services/PermissionChecker';

/**
 * SensitivityFilter - Filters content based on sensitivity.
 *
 * Provides filtering for:
 * - AI context building (cloud and local)
 * - Export operations
 * - Share operations
 * - Search indexing
 */
export class SensitivityFilter {
  private permissionChecker: PermissionChecker;

  constructor(private sensitivityService: SensitivityService) {
    this.permissionChecker = new PermissionChecker();
  }

  /**
   * Filter content items before sending to AI.
   * Used by RAG chat and transformations.
   */
  async filterForAI(
    items: ContentWithSensitivity[],
    tenantId: string,
    aiType: 'cloud' | 'local'
  ): Promise<FilteredContent> {
    const allowed: ContentWithSensitivity[] = [];
    const blocked: ContentWithSensitivity[] = [];

    for (const item of items) {
      // Get sensitivity if not already known
      const sensitivity =
        item.sensitivity ??
        (await this.getSensitivityLevel(item.entityUid, tenantId));

      const result = this.permissionChecker.canAccessAI(sensitivity, aiType);

      if (result.allowed) {
        allowed.push(item);
      } else {
        blocked.push(item);
      }
    }

    let warning: string | undefined;
    if (blocked.length > 0) {
      warning =
        `${blocked.length} item(s) excluded due to privacy settings. ` +
        `They are marked as too sensitive for ${aiType} AI processing.`;
    }

    return { allowed, blocked, warning };
  }

  /**
   * Filter for cloud AI specifically.
   */
  async filterForCloudAI(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<FilteredContent> {
    return this.filterForAI(items, tenantId, 'cloud');
  }

  /**
   * Filter for local AI specifically.
   */
  async filterForLocalAI(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<FilteredContent> {
    return this.filterForAI(items, tenantId, 'local');
  }

  /**
   * Filter for export operations.
   */
  async filterForExport(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<FilteredContent> {
    const allowed: ContentWithSensitivity[] = [];
    const blocked: ContentWithSensitivity[] = [];

    for (const item of items) {
      const sensitivity =
        item.sensitivity ??
        (await this.getSensitivityLevel(item.entityUid, tenantId));

      const result = this.permissionChecker.canExport(sensitivity);

      if (result.allowed) {
        allowed.push(item);
      } else {
        blocked.push(item);
      }
    }

    let warning: string | undefined;
    if (blocked.length > 0) {
      warning =
        `${blocked.length} item(s) excluded from export due to privacy settings.`;
    }

    return { allowed, blocked, warning };
  }

  /**
   * Filter for share operations.
   */
  async filterForShare(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<FilteredContent> {
    const allowed: ContentWithSensitivity[] = [];
    const blocked: ContentWithSensitivity[] = [];

    for (const item of items) {
      const sensitivity =
        item.sensitivity ??
        (await this.getSensitivityLevel(item.entityUid, tenantId));

      const result = this.permissionChecker.canShare(sensitivity);

      if (result.allowed) {
        allowed.push(item);
      } else {
        blocked.push(item);
      }
    }

    let warning: string | undefined;
    if (blocked.length > 0) {
      warning =
        `${blocked.length} item(s) cannot be shared due to privacy settings.`;
    }

    return { allowed, blocked, warning };
  }

  /**
   * Filter for search indexing.
   */
  async filterForIndexing(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<FilteredContent> {
    const allowed: ContentWithSensitivity[] = [];
    const blocked: ContentWithSensitivity[] = [];

    for (const item of items) {
      const sensitivity =
        item.sensitivity ??
        (await this.getSensitivityLevel(item.entityUid, tenantId));

      const result = this.permissionChecker.canIndex(sensitivity);

      if (result.allowed) {
        allowed.push(item);
      } else {
        blocked.push(item);
      }
    }

    let warning: string | undefined;
    if (blocked.length > 0) {
      warning =
        `${blocked.length} item(s) excluded from search index due to privacy settings.`;
    }

    return { allowed, blocked, warning };
  }

  /**
   * Strip sensitivity metadata from content before sending to cloud AI.
   * This ensures that sensitivity information is not exposed to external services.
   *
   * SECURITY CRITICAL: Per NFR10, sensitivity metadata must not be exposed to cloud AI.
   */
  stripSensitivityMetadata(
    items: ContentWithSensitivity[]
  ): Omit<ContentWithSensitivity, 'sensitivity'>[] {
    return items.map(({ sensitivity, ...rest }) => rest);
  }

  /**
   * Prepare content for cloud AI by filtering and stripping metadata.
   */
  async prepareForCloudAI(
    items: ContentWithSensitivity[],
    tenantId: string
  ): Promise<{
    content: Omit<ContentWithSensitivity, 'sensitivity'>[];
    warning?: string;
    blockedCount: number;
  }> {
    const filtered = await this.filterForCloudAI(items, tenantId);
    const content = this.stripSensitivityMetadata(filtered.allowed);

    return {
      content,
      warning: filtered.warning,
      blockedCount: filtered.blocked.length,
    };
  }

  /**
   * Get sensitivity level for an entity.
   */
  private async getSensitivityLevel(
    entityUid: string,
    tenantId: string
  ): Promise<SensitivityLevel> {
    const config = await this.sensitivityService.getEffectiveSensitivity(
      entityUid,
      tenantId
    );
    return config.level;
  }

  /**
   * Check if any items will be blocked for a given operation.
   */
  async willAnyBeBlocked(
    items: ContentWithSensitivity[],
    tenantId: string,
    operation: 'cloud_ai' | 'local_ai' | 'export' | 'share' | 'index'
  ): Promise<boolean> {
    let result: FilteredContent;

    switch (operation) {
      case 'cloud_ai':
        result = await this.filterForCloudAI(items, tenantId);
        break;
      case 'local_ai':
        result = await this.filterForLocalAI(items, tenantId);
        break;
      case 'export':
        result = await this.filterForExport(items, tenantId);
        break;
      case 'share':
        result = await this.filterForShare(items, tenantId);
        break;
      case 'index':
        result = await this.filterForIndexing(items, tenantId);
        break;
    }

    return result.blocked.length > 0;
  }
}
