"""Local, resumable PDF translation. No document text leaves this machine."""
import sys,json,re,hashlib,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'artifacts/translation-python'))
import ctranslate2,sentencepiece
WORK=ROOT/'artifacts/pdf-import'
base=ROOT/'artifacts/argos-model/translate-en_zh-1_9'
sp=sentencepiece.SentencePieceProcessor(model_file=str(base/'sentencepiece.model'))
model=ctranslate2.Translator(str(base/'model'),device='cpu',compute_type='int8',intra_threads=4)
TERMS={
 'network address':'網路位址','broadcast address':'廣播位址','subnet mask':'子網路遮罩','wildcard mask':'萬用遮罩',
 'default gateway':'預設閘道','default route':'預設路由','routing table':'路由表','routing tables':'路由表',
 'administrative distance':'管理距離','longest prefix match':'最長前綴比對','designated router':'指定路由器',
 'backup designated router':'備援指定路由器','root bridge':'根橋接器','root port':'根連接埠','designated port':'指定連接埠',
 'access control list':'存取控制清單','access control lists':'存取控制清單','control plane':'控制平面','data plane':'資料平面',
 'management plane':'管理平面','network interface':'網路介面','network interfaces':'網路介面','MAC address':'MAC 位址',
 'MAC addresses':'MAC 位址','IP address':'IP 位址','IP addresses':'IP 位址','source address':'來源位址',
 'destination address':'目的位址','local area network':'區域網路','wide area network':'廣域網路',
 'access point':'無線存取點','access points':'無線存取點','subnetting':'子網路切割','subnets':'子網路','subnet':'子網路',
 'switches':'交換器','switch':'交換器','routers':'路由器','router':'路由器','clients':'用戶端','client':'用戶端',
 'servers':'伺服器','server':'伺服器','hosts':'主機','host':'主機','packets':'封包','packet':'封包',
 'frames':'訊框','frame':'訊框','firewalls':'防火牆','firewall':'防火牆','interfaces':'介面','interface':'介面',
 'bandwidth':'頻寬','throughput':'傳輸量','latency':'延遲','encapsulation':'封裝','decapsulation':'解封裝',
 'broadcast':'廣播','multicast':'多點傳送','unicast':'單點傳送','full-duplex':'全雙工','half-duplex':'半雙工',
 'collision domain':'碰撞網域','broadcast domain':'廣播網域','next hop':'下一跳','next-hop':'下一跳',
 'trunk port':'Trunk 連接埠','access port':'Access 連接埠','native VLAN':'原生 VLAN','voice VLAN':'語音 VLAN',
 'link aggregation':'鏈路聚合','load balancing':'負載平衡','routing':'路由','switching':'交換',
 'authentication':'驗證','authorization':'授權','encryption':'加密','network traffic':'網路流量',
 'destination':'目的端','source':'來源','port number':'連接埠號碼','sequence number':'序號',
 'acknowledgment':'確認','acknowledgement':'確認','priority':'優先權','header':'標頭','payload':'酬載',
 'configuration':'設定','configure':'設定','enabled':'啟用','disabled':'停用','default':'預設',
 'virtual machine':'虛擬機器','virtual machines':'虛擬機器','container':'容器','containers':'容器'
}
term_pattern='|'.join(re.escape(k) for k in sorted(TERMS,key=len,reverse=True))
protect=re.compile(r'https?://[^\s]+|(?:[0-9A-Fa-f]{1,4}:){2,}[0-9A-Fa-f:/]*|\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b|\b(?:[A-Za-z]+\d+(?:/\d+)+)\b|\b(?:'+term_pattern+r')\b|\b[A-Z][A-Z0-9-]{1,9}\b|\d+(?:[.:/]\d+)*(?:%|\^\d+)?',re.I if False else 0)
# Terms are case-insensitive, but acronym recognition must remain case-sensitive.
protect=re.compile(r'https?://[^\s]+|(?:[0-9A-Fa-f]{1,4}:){2,}[0-9A-Fa-f:/]*|\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b|\b(?:[A-Za-z]+\d+(?:/\d+)+)\b|\b(?i:'+term_pattern+r')\b|\b[A-Z][A-Z0-9-]{1,9}\b|\d+(?:[.:/]\d+)*(?:%|\^\d+)?')
CLI=re.compile(r'^(?:[\w.-]+\s*(?:\([^)]*\))?\s*[#>]|(?:show|switchport|hostname|configure terminal|access-list|spanning-tree|channel-group|ping|traceroute)\s+|(?:ip|ipv6) (?:route|address|access-list|dhcp|nat)\s+[\dA-Z]|interface (?:[GgFfSsEe]\S*\d)|router (?:ospf|eigrp|rip)\b|network \d)',re.M)
def keep(text):
    letters=len(re.findall('[a-zA-Z]',text))
    return not letters or bool(CLI.match(text)) and (len(text.split())<18 or '#' in text or '>' in text) or letters/max(1,len(text))<.28
ACRONYMS=set('CCNA CCNP IT CLI OSI TCP UDP IP IPv4 IPv6 LAN WAN VLAN WLAN VPN MAC ARP ICMP IGMP DNS DHCP NTP SNMP SSH SSL TLS HTTP HTTPS FTP TFTP SMTP POP IMAP REST API JSON XML YAML OSPF EIGRP RIP IS-IS BGP STP RSTP MSTP PVST BPDU BPDUs LACP PAgP DTP VTP CDP LLDP HSRP VRRP GLBP NAT PAT ACL ACLs ACE QoS DSCP ECN CoS TCP/IP IEEE RFC IANA OUI FCS CRC MTU MSS TTL ToS DR BDR RID LSA LSU LSR LSP LSDB ABR ASBR AS AD ECMP SVI PDU SDU CSMA CD CDMA OFDM DSSS FHSS PoE UTP STP MMF SMF SFP GBIC RJ RAM ROM NVRAM CPU ASIC IOS IOS-XE AAA RADIUS TACACS TACACS+ WPA WPA2 WPA3 WEP TKIP AES CCMP MIC PSK EAP PEAP SAE SSID BSSID ESSID BSS ESS AP APs WLC CAPWAP DTLS GUI USB PC PCs PDU PDUs SYN ACK FIN RST PSH URG RSA DSA SHA MD5 HMAC DAI DDoS DoS IPS IDS NGFW DMZ NMS MIB OID GET POST PUT PATCH DELETE CRUD SDN SDA ACI DNA VXLAN MPLS GRE IPsec VSS VPC vPC VRF VTEP VM VMs NIC VMXNET ESXi VMM SAN NAS iSCSI FC FCoE RAID LUN AWS GCP AZ CIDR VLSM EUI SLAAC DAD NS NA RS RA NDP EUI-64 NTPv4 OSPFv2 OSPFv3 IPv4 IPv6 SPF COST MTU FIB RIB CAM TCAM VTY AUX EXEC RX TX G0 F0 R1 R2 R3 R4 R5 SW1 SW2 SW3 SW4 PC1 PC2 PC3 PC4 SW SWs'.split())
def normalize_emphasis(text):
    return re.sub(r'\b[A-Z][A-Z0-9-]{1,}\b',lambda m:m[0] if m[0] in ACRONYMS else m[0].lower(),text)
def chunks(text):
    # Preserve list and table line boundaries; join visually wrapped prose.
    lines=[x.strip() for x in text.splitlines() if x.strip()]
    merged=[]
    for line in lines:
        if merged and not re.search(r'[.!?:;]$',merged[-1]) and not keep(merged[-1]) and not re.match(r'^[•●▪o\-]|^\d+[.)]|^[A-Z\d /_-]{5,}:?$',line) and not keep(line) and len(merged[-1])>45:
            merged[-1]+=' '+line
        else: merged.append(line)
    result=[]
    for line in merged:
        if keep(line):result.append(line);continue
        parts=re.split(r'(?<=[.!?])\s+(?=[A-Z])',line)
        for part in parts:
            words=part.split();current=[]
            for word in words:
                if len(sp.encode(' '.join(current+[word])))>170 and current:
                    result.append(' '.join(current));current=[]
                current.append(word)
            if current:result.append(' '.join(current))
    return result
def infer(texts):
    if not texts:return []
    output=model.translate_batch([sp.encode(t,out_type=str) for t in texts],beam_size=2,max_batch_size=32,max_decoding_length=320,no_repeat_ngram_size=4)
    return [sp.decode(o.hypotheses[0]).replace('▁',' ').strip() for o in output]
def mask(text):
    text=normalize_emphasis(text)
    vals=[]
    def sub(m):
        vals.append(TERMS.get(m[0].lower(),m[0]));i=len(vals)-1
        return '['+chr(65+i//26)+chr(65+i%26)+']'
    return protect.sub(sub,text),vals
def restore(zh,vals):
    tokens=['['+chr(65+i//26)+chr(65+i%26)+']' for i in range(len(vals))]
    zh=zh.replace('［','[').replace('］',']')
    if any(zh.count(t)!=1 for t in tokens) or len(re.findall(r'\[[A-Z]{2}\]',zh))!=len(tokens):return None
    for t,v in zip(tokens,vals):zh=zh.replace(t,v)
    return zh
def fallback(text):
    # If the model loses a placeholder, translate between immutable spans.
    text=normalize_emphasis(text)
    pieces=[];last=0
    for m in protect.finditer(text):
        pieces.append((False,text[last:m.start()]));pieces.append((True,TERMS.get(m[0].lower(),m[0])));last=m.end()
    pieces.append((False,text[last:]))
    pending=[t for fixed,t in pieces if not fixed and re.search('[A-Za-z]{2}',t)]
    results=iter(infer(pending))
    return ''.join(t if fixed or not re.search('[A-Za-z]{2}',t) else next(results) for fixed,t in pieces)
def inside(x,y,b):return b[0]<=x<=b[2] and b[1]<=y<=b[3]
source=json.loads((WORK/'source.json').read_text(encoding='utf-8'))
pages=[]
for page in source['pages']:
    blocks=[{'en':b['text'],'source':'text','y':b['bbox'][1]} for b in page['native']]
    ocr=json.loads((WORK/'ocr-output'/f"{page['page']:04}.json").read_text(encoding='utf-8-sig'))
    for line in ocr['lines']:
        words=[w for w in line['words'] if any(inside((w['x']+w['width']/2)/2,(w['y']+w['height']/2)/2,b) for b in page['images']) and not any(inside((w['x']+w['width']/2)/2,(w['y']+w['height']/2)/2,b['bbox']) for b in page['native'])]
        if words:blocks.append({'en':' '.join(w['text'] for w in words),'source':'image-ocr','y':min(w['y'] for w in words)/2})
    blocks.sort(key=lambda b:b['y'])
    for i,b in enumerate(blocks):b['id']=f"p{page['page']}-b{i+1}";b['parts']=chunks(b['en']);b.pop('y')
    pages.append({'page':page['page'],'image':f"/data/pdf/pages/{page['page']:04}.jpg",'blocks':blocks})
cache_path=WORK/'translation-cache.jsonl';cache={}
if cache_path.exists():
    for line in cache_path.read_text(encoding='utf-8').splitlines():
        item=json.loads(line)
        if item.get('version')==2 or normalize_emphasis(item['en'])==item['en'] or keep(item['en']):cache[item['en']]=item
pending=list(dict.fromkeys(s for p in pages for b in p['blocks'] for s in b['parts'] if s not in cache))
print(f"Pages {len(pages)}, blocks {sum(len(p['blocks']) for p in pages)}, segments {len(pending)} pending",flush=True)
start=time.time()
with cache_path.open('a',encoding='utf-8') as log:
    for offset in range(0,len(pending),32):
        batch=pending[offset:offset+32];translations={};inputs=[];info=[]
        for text in batch:
            if keep(text):translations[text]={'en':text,'zh':text,'method':'verbatim'};continue
            masked,vals=mask(text);inputs.append(masked);info.append((text,vals))
        for (text,vals),zh in zip(info,infer(inputs)):
            restored=restore(zh,vals);method='local-mt'
            if restored is None:restored=fallback(text);method='local-mt-protected-fragments'
            translations[text]={'en':text,'zh':restored,'method':method}
        for text in batch:
            cache[text]=translations[text];cache[text]['version']=2;log.write(json.dumps(cache[text],ensure_ascii=False)+'\n')
        log.flush()
        if offset%320==0:print(f"Translated {min(offset+32,len(pending))}/{len(pending)} in {time.time()-start:.1f}s",flush=True)
for p in pages:
    for b in p['blocks']:
        b['segments']=[cache[s] for s in b.pop('parts')]
        b['zh']='\n'.join(s['zh'] for s in b['segments'])
        b['kind']='code' if all(s['method']=='verbatim' for s in b['segments']) else 'prose'
out={'sourceSha256':source['sha256'],'model':'Argos en_zh 1.9 / CTranslate2 int8','pages':pages}
(WORK/'translated.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('All pages translated. Run scripts/package-pdf.mjs to convert to Traditional Chinese and package.',flush=True)
