export function ipToInt(ip){
 const parts=String(ip).trim().split('.');
 if(parts.length!==4 || parts.some(p=>!/^\d{1,3}$/.test(p)||Number(p)>255)) throw Error('請輸入有效 IPv4 位址，例如 192.168.10.70。');
 return parts.reduce((n,p)=>n*256+Number(p),0);
}
export const intToIp=n=>{if(!Number.isInteger(n)||n<0||n>4294967295)throw Error('IPv4 超出範圍'); return [24,16,8,0].map(s=>(n>>>s)&255).join('.');};
export function subnet(ip,prefix){
 prefix=Number(prefix); if(!Number.isInteger(prefix)||prefix<0||prefix>32) throw Error('Prefix 必須介於 0 到 32。');
 const value=ipToInt(ip),size=2**(32-prefix),network=Math.floor(value/size)*size,last=network+size-1,mask=4294967296-size;
 return {ip:intToIp(value),prefix,size,network:intToIp(network),broadcast:prefix<31?intToIp(last):'不適用',mask:intToIp(mask),wildcard:intToIp(size-1),first:intToIp(network+(prefix<31?1:0)),last:intToIp(last-(prefix<31?1:0)),hosts:prefix<31?size-2:size,networkInt:network,lastInt:last};
}
export function contains(cidr,ip){const [base,p]=cidr.split('/');const s=subnet(base,p),n=ipToInt(ip);return n>=s.networkInt&&n<=s.lastInt;}
export function allocateVlsm(cidr,requirements){
 const [base,p]=cidr.split('/'),parent=subnet(base,p);
 if(!requirements.length||requirements.some(n=>!Number.isInteger(n)||n<1||n>2**30))throw Error('主機需求需為正整數。');
 let cursor=parent.networkInt;
 return requirements.map((hosts,index)=>({hosts,index})).sort((a,b)=>b.hosts-a.hosts).map(({hosts,index})=>{
  const bits=Math.ceil(Math.log2(hosts+2)),prefix=32-bits,size=2**bits;
  cursor=Math.ceil(cursor/size)*size;
  if(cursor+size-1>parent.lastInt)throw Error('母網段容量不足，無法配置所有子網。');
  const result={...subnet(intToIp(cursor),prefix),required:hosts,index};cursor+=size;return result;
 });
}
export const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
export function newSubnet(level='初級'){
 const prefix=level==='中級'?rand(16,23):rand(24,30);
 const ip=level==='中級'?`172.${rand(16,31)}.${rand(0,255)}.${rand(1,254)}`:`192.168.${rand(0,255)}.${rand(1,254)}`;
 return subnet(ip,prefix);
}
export function subnetExplanation(s){
 const octet=Math.floor(s.prefix/8),remainder=s.prefix%8,block=remainder?2**(8-remainder):256;
 return [`主機位元：32 − ${s.prefix} = ${32-s.prefix}。`,`位址總數：2^${32-s.prefix} = ${s.size}；可用主機：${s.hosts}。${s.prefix>=31?'此例為 /31 點對點或 /32 單一位址用途，不套一般扣 2 公式。':'一般 LAN 扣除 network 與 broadcast。'}`,`Subnet mask：${s.mask}；wildcard 為逐位反碼：${s.wildcard}。`,`在第 ${Math.min(octet+1,4)} 個 octet 觀察區塊；區塊步長 ${block}。將 IP 以 ${s.size} 個位址一組向下對齊。`,`Network：${s.network}；Broadcast：${s.broadcast}。`,`可用範圍：${s.first} ～ ${s.last}。`];
}
export function newRoutingQuestion(){
 const second=rand(1,200),third=rand(1,220),destination=`10.${second}.${third}.${rand(1,254)}`;
 const routes=[{prefix:'0.0.0.0/0',code:'S*',ad:1,metric:0,nextHop:'192.0.2.1'},{prefix:'10.0.0.0/8',code:'S',ad:1,metric:0,nextHop:'192.0.2.2'},{prefix:`10.${second}.0.0/16`,code:'O',ad:110,metric:20,nextHop:'192.0.2.3'},{prefix:`10.${second}.${third}.0/24`,code:'O',ad:110,metric:50,nextHop:'192.0.2.4'}];
 if(rand(0,1))routes[3].prefix=`10.${second}.${third+1}.0/24`;
 const matching=routes.filter(r=>contains(r.prefix,destination)).sort((a,b)=>Number(b.prefix.split('/')[1])-Number(a.prefix.split('/')[1]));
 const winner=matching[0],index=routes.indexOf(winner);
 return {id:`route-${destination}-${index}`,domain:'connectivity',topic:'lpm',difficulty:'中級',questionType:'Routing Table Question',question:`以下都是已安裝且可用的路由。前往 ${destination} 的封包會選哪一條？`,routes,destination,options:routes.map((r,i)=>({id:String(i),text:`${r.prefix} → ${r.nextHop}`})),correctAnswer:[String(index)],explanation:`符合的最長前綴為 ${winner.prefix}，因此送到 next hop ${winner.nextHop}。Prefix 是目的網段與遮罩長度；AD 用於同前綴不同來源的路由選擇，metric 比較相同協定路徑。轉送時不會因 /8 的 AD 較小而略過更長匹配。`,wrongAnswerExplanation:Object.fromEntries(routes.map((r,i)=>[String(i),contains(r.prefix,destination)?`${r.prefix} 雖符合，但需比較最長前綴。`:`${r.prefix} 不包含 ${destination}。`])),commands:['route'],tags:['LPM','Routing Table']};
}
export function newAclQuestion(){
 const subnetId=rand(1,240),host=rand(1,200),port=[22,80,443][rand(0,2)],action=rand(0,1)?'permit':'deny';
 const source=`192.168.${subnetId}.0`,destination=`10.0.0.${host}`;
 const correct=`${action} tcp ${source} 0.0.0.255 host ${destination} eq ${port}`;
 const texts=[correct,`${action==='permit'?'deny':'permit'} tcp ${source} 0.0.0.255 host ${destination} eq ${port}`,`${action} tcp ${source} 255.255.255.0 host ${destination} eq ${port}`,`${action} udp ${source} 0.0.0.255 host ${destination} eq ${port}`];
 return {id:`acl-${subnetId}-${host}-${port}-${action}`,domain:'security',topic:'extended-acl',difficulty:'中級',questionType:'CLI Question',question:`${action==='permit'?'允許':'拒絕'}來源 ${source}/24 到 ${destination} 的 TCP 目的 port ${port}。請選擇正確的 extended ACL 條目。`,options:texts.map((text,i)=>({id:String(i),text})),correctAnswer:['0'],explanation:`${action} 決定${action==='permit'?'放行':'拒絕'}；tcp 是傳輸協定；${source} 0.0.0.255 比對來源 /24；host ${destination} 限定單一目的；eq ${port} 比對目的 port。ACL 由上到下第一個匹配生效，尾端 implicit deny，另需規劃介面與方向。`,wrongAnswerExplanation:{'1':'permit / deny 動作相反。','2':'此處需要 wildcard 0.0.0.255，而非 subnet mask。','3':'需求是 TCP，此條目卻比對 UDP。'},commands:['acl'],tags:['ACL','wildcard']};
}
