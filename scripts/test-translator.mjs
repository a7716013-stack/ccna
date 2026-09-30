import {pipeline,env} from '../artifacts/translation-tools/node_modules/@huggingface/transformers/dist/transformers.node.mjs';
import {Converter} from '../artifacts/translation-tools/node_modules/opencc-js/dist/esm/full.js';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
env.cacheDir=fileURLToPath(new URL('../artifacts/translation-models',import.meta.url));
const model=process.argv[2]||'Xenova/opus-mt-en-zh';
const translator=await pipeline('translation',model,{dtype:'q8',device:'cpu',session_options:{intraOpNumThreads:4}});
if(model.includes('opus')&&process.argv.includes('--native')){
 const require=createRequire(import.meta.url);
 const {SentencePieceProcessor}=require('../artifacts/translation-tools/node_modules/@sctg/sentencepiece-js');
 const sp=new SentencePieceProcessor();await sp.load(fileURLToPath(new URL('../artifacts/translation-models/source.spm',import.meta.url)));
 translator.tokenizer._encode_text=text=>text===null?null:sp.encodePieces(text);
}
const convert=Converter({from:'cn',to:'twp'});
const texts=[
 'A client is a device that accesses a service made available by a server.',
 'Switches provide connectivity to hosts within the same LAN. Routers are used to provide connectivity between LANs.',
 'OSPF elects a designated router on a broadcast network. The router with the highest priority wins.',
 'When a router checks a packet against the ACL, it processes the entries in order, from top to bottom. If the packet matches an entry, the router takes the action and stops processing the ACL.',
 'The network address is 192.168.1.192/27 and the broadcast address is 192.168.1.223.'
];
for(const text of texts){const start=Date.now();const result=await translator(text,{max_new_tokens:256,num_beams:1,no_repeat_ngram_size:4,...(model.includes('nllb')?{src_lang:'eng_Latn',tgt_lang:'zho_Hant'}:{})});console.log(JSON.stringify({en:text,zh:convert(result[0].translation_text),ms:Date.now()-start}));}
