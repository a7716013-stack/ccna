import sys,time
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'artifacts/translation-python'))
import ctranslate2,sentencepiece
base=root/'artifacts/argos-model/translate-en_zh-1_9'
sp=sentencepiece.SentencePieceProcessor(model_file=str(base/'sentencepiece.model'))
model=ctranslate2.Translator(str(base/'model'),device='cpu',compute_type='int8',intra_threads=4)
texts=['A client accesses a service made available by a server.','Switches forward frames based on destination MAC addresses.','The router with the highest OSPF priority becomes the designated router.','The network address is 192.168.1.192/27 and the broadcast address is 192.168.1.223.','The network address is [A] and the broadcast address is [B].','An access control list checks packets against entries in order.']
t=time.time()
out=model.translate_batch([sp.encode(x,out_type=str) for x in texts],beam_size=2,max_decoding_length=256)
for en,result in zip(texts,out): print(en,'=>',sp.decode(result.hypotheses[0]),flush=True)
print('Seconds',time.time()-t)
