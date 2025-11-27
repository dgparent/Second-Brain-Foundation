const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '../packages/@sbf/modules');
const modules = fs.readdirSync(modulesDir);

modules.forEach(mod => {
  const tsconfigPath = path.join(modulesDir, mod, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    tsconfig.compilerOptions.types = ["node"];
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log(`Updated ${mod}/tsconfig.json`);
  }
});
