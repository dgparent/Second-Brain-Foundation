/**
 * Search Command - Search knowledge base
 */

import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { api } from '../utils/api.js';
import { formatTable, error, truncate } from '../utils/output.js';

export const searchCommand = new Command('search')
  .description('Search your knowledge base')
  .argument('[query]', 'Search query')
  .option('-t, --type <type>', 'Filter by entity type')
  .option('-l, --limit <limit>', 'Limit results', '10')
  .option('--hybrid', 'Use hybrid search (vector + text)')
  .option('--json', 'Output as JSON')
  .action(async (queryArg, options) => {
    // Get query from argument or prompt
    const query =
      queryArg ||
      (await input({
        message: 'Search query:',
        validate: (v) => (v.length > 0 ? true : 'Query is required'),
      }));

    console.log(chalk.blue(`Searching for "${query}"...\n`));

    try {
      const response = await api.search({
        query,
        type: options.type,
        limit: parseInt(options.limit),
        hybrid: options.hybrid,
      });

      if (response.results.length === 0) {
        console.log(chalk.yellow('No results found.'));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(response, null, 2));
        return;
      }

      // Format results
      const tableData = response.results.map((r) => ({
        score: `${Math.round(r.score * 100)}%`,
        type: r.entity.type,
        title: r.entity.title,
        uid: r.entity.uid,
        preview: truncate(r.entity.content.replace(/\n/g, ' '), 50),
      }));

      const table = formatTable(tableData, [
        { key: 'score', header: 'Score', width: 6, align: 'right' },
        { key: 'type', header: 'Type', width: 10 },
        { key: 'title', header: 'Title', width: 35 },
        { key: 'preview', header: 'Preview', width: 50 },
      ]);

      console.log(table);

      // Show highlights if available
      const hasHighlights = response.results.some((r) => r.highlights?.length);
      if (hasHighlights) {
        console.log(chalk.gray('\n📚 Matches:'));
        for (const r of response.results) {
          if (r.highlights?.length) {
            console.log(chalk.bold(`\n${r.entity.title}`));
            for (const h of r.highlights.slice(0, 2)) {
              console.log(chalk.gray(`  ...${h}...`));
            }
          }
        }
      }

      console.log(chalk.gray(`\n${response.results.length} results for "${query}"`));
    } catch (e) {
      error(`Search failed: ${(e as Error).message}`);
    }
  });
