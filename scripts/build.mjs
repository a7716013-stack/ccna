import { mkdir, cp, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {topics,domains}=await import('../data/catalog.js');
if(!topics.length || domains.length!==6) throw Error('Invalid content catalog');
for(const name of ['src/app.js','src/pdf-library.js','src/learning-ui.js','data/lessons.js','data/lessons-fundamentals.js','data/lessons-networking.js','data/lessons-services.js','data/pdf-catalog.js','src/core/engine.js','src/core/store.js','src/core/network.js']) {
  await readFile(new URL('../'+name,import.meta.url)); execFileSync(process.execPath,['--check',root+name]);
}
await mkdir(new URL('../dist',import.meta.url),{recursive:true});
for(const name of ['index.html','favicon.svg','src','data']) await cp(new URL('../'+name,import.meta.url),new URL('../dist/'+name,import.meta.url),{recursive:true});
console.log(`Build OK: ${domains.length} domains / ${topics.length} topics. Static output: dist/`);
