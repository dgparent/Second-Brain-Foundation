import { logger } from '@sbf/logging';
import { VaultWatcher } from '@sbf/core-vault-connector';
import path from 'path';
import fs from 'fs/promises';

export class LifecycleService {
  private static readonly DAILY_NOTE_RETENTION_HOURS = 48;

  /**
   * Checks daily notes and archives them if they are older than 48 hours
   */
  async processDailyNotes(vaultPath: string) {
    const dailyPath = path.join(vaultPath, 'Daily');
    const archivePath = path.join(vaultPath, '08_Archive/Daily');

    try {
      // Ensure archive directory exists
      await fs.mkdir(archivePath, { recursive: true });

      const files = await fs.readdir(dailyPath);
      const now = new Date();

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(dailyPath, file);
        const stats = await fs.stat(filePath);
        
        // Calculate age in hours
        const ageHours = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60);

        if (ageHours > LifecycleService.DAILY_NOTE_RETENTION_HOURS) {
          logger.info(`Archiving daily note: ${file} (Age: ${ageHours.toFixed(1)}h)`);
          
          const targetPath = path.join(archivePath, file);
          await fs.rename(filePath, targetPath);
        }
      }
    } catch (error) {
      logger.error('Error processing lifecycle for daily notes', error);
    }
  }
}

export const lifecycleService = new LifecycleService();
