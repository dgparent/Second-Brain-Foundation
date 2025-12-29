/**
 * Chat Command - Interactive chat with knowledge base
 */

import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { api } from '../utils/api.js';
import { error } from '../utils/output.js';

export const chatCommand = new Command('chat')
  .description('Chat with your knowledge base')
  .option('-s, --sources <uids>', 'Comma-separated source UIDs to use')
  .option('-m, --message <message>', 'Single message (non-interactive)')
  .option('--model <model>', 'Model override')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    console.log(chalk.blue('🧠 SBF Chat\n'));

    // Get sources
    let sourceUids: string[] = [];
    if (options.sources) {
      sourceUids = options.sources.split(',').map((s: string) => s.trim());
      console.log(chalk.gray(`Using ${sourceUids.length} source(s)\n`));
    }

    // Non-interactive mode
    if (options.message) {
      await sendMessage(options.message, sourceUids, options);
      return;
    }

    // Interactive mode
    console.log(chalk.gray('Type your questions. Type "exit" or "quit" to quit.\n'));

    while (true) {
      let message: string;
      
      try {
        message = await input({
          message: chalk.cyan('You:'),
        });
      } catch {
        // User pressed Ctrl+C
        console.log(chalk.gray('\nGoodbye! 👋'));
        break;
      }

      const lowerMessage = message.toLowerCase().trim();
      if (lowerMessage === 'exit' || lowerMessage === 'quit') {
        console.log(chalk.gray('\nGoodbye! 👋'));
        break;
      }

      if (lowerMessage === '') {
        continue;
      }

      // Handle special commands
      if (lowerMessage.startsWith('/')) {
        handleCommand(lowerMessage, sourceUids);
        continue;
      }

      await sendMessage(message, sourceUids, options);
    }
  });

/**
 * Send a message and display response
 */
async function sendMessage(
  message: string,
  sourceUids: string[],
  options: { model?: string; json?: boolean }
): Promise<void> {
  const spinner = ora('Thinking...').start();

  try {
    const response = await api.chat({
      message,
      sourceUids: sourceUids.length > 0 ? sourceUids : undefined,
      includeContext: true,
      modelOverride: options.model,
    });

    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
      return;
    }

    console.log(chalk.green('\n🤖 SBF:'));
    console.log(response.answer);

    if (response.citations?.length) {
      console.log(chalk.gray('\n📚 Sources:'));
      for (const citation of response.citations) {
        console.log(chalk.gray(`  • ${citation.title} (${citation.uid})`));
      }
    }

    if (response.tokensUsed) {
      console.log(chalk.gray(`\n[${response.tokensUsed} tokens]`));
    }

    console.log('');
  } catch (e) {
    spinner.stop();
    error(`Chat failed: ${(e as Error).message}`);
  }
}

/**
 * Handle special chat commands
 */
function handleCommand(command: string, sourceUids: string[]): void {
  const [cmd, ...args] = command.slice(1).split(' ');

  switch (cmd) {
    case 'help':
      console.log(chalk.gray('\nAvailable commands:'));
      console.log(chalk.gray('  /help          Show this help'));
      console.log(chalk.gray('  /sources       Show current sources'));
      console.log(chalk.gray('  /add <uid>     Add source UID'));
      console.log(chalk.gray('  /clear         Clear sources'));
      console.log(chalk.gray('  /exit          Exit chat\n'));
      break;

    case 'sources':
      if (sourceUids.length === 0) {
        console.log(chalk.gray('\nNo sources configured. Using full knowledge base.\n'));
      } else {
        console.log(chalk.gray('\nCurrent sources:'));
        for (const uid of sourceUids) {
          console.log(chalk.gray(`  • ${uid}`));
        }
        console.log('');
      }
      break;

    case 'add':
      if (args.length === 0) {
        console.log(chalk.yellow('Usage: /add <uid>\n'));
      } else {
        sourceUids.push(args[0]);
        console.log(chalk.gray(`Added source: ${args[0]}\n`));
      }
      break;

    case 'clear':
      sourceUids.length = 0;
      console.log(chalk.gray('Sources cleared.\n'));
      break;

    default:
      console.log(chalk.yellow(`Unknown command: ${cmd}. Type /help for available commands.\n`));
  }
}
