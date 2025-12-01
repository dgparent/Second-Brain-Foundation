import { MemoryEngine } from '@sbf/memory-engine';
import { ExamplePlugin } from '@sbf/plugin-example';
import { createVaultAgent } from '@sbf/aei/dist/graph/vaultAgent';
import * as path from 'path';
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  console.log('Initializing Memory Engine...');
  
  const engine = new MemoryEngine({
    vaultRoot: path.join(process.cwd(), 'vault'),
    autoComputeAeiCode: false
  });

  console.log('Registering Example Plugin...');
  await engine.registerPlugin(ExamplePlugin);

  console.log('Getting Tools...');
  const tools = engine.getPluginTools();
  console.log(`Found ${tools.length} tools.`);

  console.log('Initializing Vault Agent with Tools...');
  const agent = createVaultAgent(tools);

  console.log('Agent initialized successfully.');
  
  // We won't invoke the agent because we don't have a real AI provider configured
  // and it would fail at the embedding step.
  // But reaching this point proves the integration wiring is correct.
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
