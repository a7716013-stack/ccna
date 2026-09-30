import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const source=JSON.parse(await readFile(new URL('artifacts/pdf-import/source.json',root),'utf8'));
const baseline={sourceSha256:source.sha256,pages:source.pages.map(p=>({page:p.page,sha256:createHash('sha256').update(JSON.stringify(p.native.map(b=>b.text))).digest('hex')}))};
await mkdir(new URL('tests/fixtures/',root),{recursive:true});
await writeFile(new URL('tests/fixtures/pdf-native-sha256.json',root),JSON.stringify(baseline,null,2)+'\n');
console.log(`Recorded ${baseline.pages.length} original-page hashes for standalone tests.`);
