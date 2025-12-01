import { MemoryEngine } from '@sbf/memory-engine';
import { ExamplePlugin } from '@sbf/plugin-example';
import * as path from 'path';

async function main() {
  console.log('Initializing Memory Engine...');
  
  const engine = new MemoryEngine({
    vaultRoot: path.join(process.cwd(), 'vault'),
    autoComputeAeiCode: false
  });

  console.log('Registering Example Plugin...');
  await engine.registerPlugin(ExamplePlugin);

  console.log('Checking Tools...');
  const tools = engine.getPluginTools();
  console.log('Tools:', tools);

  if (tools.length > 0 && tools[0].name === 'example_tool') {
    console.log('SUCCESS: Plugin loaded and tools registered.');
  } else {
    console.error('FAILURE: Plugin tools not found.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
