import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {appVersion} from '../data/version.js';
test('Application version matches release metadata',async()=>{
 const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(appVersion,pkg.version);assert.equal(pkg.version,'1.0.2');
});
