import {topics} from './catalog.js';
import {pdfChapters,pdfNotes} from './pdf-catalog.js';
import {fundamentalsLessons} from './lessons-fundamentals.js';
import {networkingLessons} from './lessons-networking.js';
import {servicesLessons} from './lessons-services.js';

export const lessonReferences={
 ipv6:{name:'RFC 4291：IPv6 位址架構',url:'https://www.rfc-editor.org/rfc/rfc4291'},
 format:{name:'RFC 5952：IPv6 建議文字格式',url:'https://www.rfc-editor.org/rfc/rfc5952'},
 exam:{name:'Cisco CCNA 200-301 v1.1 官方範圍',url:'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf'},
 terraform:{name:'HashiCorp：Terraform plan',url:'https://developer.hashicorp.com/terraform/cli/commands/plan'},
 ospf:{name:'Cisco：OSPF 介面與選舉說明',url:'https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13689-17.html'},
 ansible:{name:'Ansible：Inventory',url:'https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_inventory.html'}
};
const extraChapters={icmp:['10','12','33'],'client-ip':['38','39'],'ipv4-routing':['10','11a','12'],floating:['24','33'],authentication:['48','57'],authorization:['48'],accounting:['48'],awareness:['48'],management:['4']};
const relatedCommands={
 ipv4:['ipbrief','route'],ipv6:['ipv6','ipv6route'],arp:['arp','route'],switching:['mac','vlan'],
 physical:['ipbrief','interfaces'],duplex:['interfaces'],vlan:['vlan','access'],trunk:['trunk','vlan','stp'],
 'inter-vlan':['svi','roas','route'],roas:['roas','trunk'],stp:['stp','bpdu'],rstp:['stp','bpdu'],etherchannel:['etherchannel','lacp'],lacp:['lacp','etherchannel'],
 management:['running','ssh'],static:['static','route'],floating:['floating','route'],ospf:['ospfconfig','ospf','neighbor'],
 'ospf-neighbor':['neighbor','ospf'],dhcp:['dhcp-pool','dhcp'],nat:['nat'],pat:['pat','nat'],
 'dhcp-snooping':['snooping','snoopingbinding'],dai:['dai','snoopingbinding'],configuration:['running']
};
// These subjects have no single IOS command that implements the concept.
const conceptual=new Set(['osi','tcpip','tcp','udp','wireless-basic','topology','virtualization','ipv6-types','eui64','client-ip','components','wireless-arch','wlan-gui','fhrp','aaa','authentication','authorization','accounting','vpn','wireless-security','wpa2','wpa3','security-concepts','passwords','awareness','controller','sdn','catalyst','rest','http','json','xml','yaml','ansible','traditional','ai','terraform','api-auth']);
const raw=[fundamentalsLessons,networkingLessons,servicesLessons].flatMap(s=>s.trim().split('\n'));
export const lessons=Object.fromEntries(raw.map(line=>{
 const [id,explanation,flow,worked,question,answer]=line.split('|');
 const topic=topics.find(t=>t.id===id);
 if(!topic||!answer)throw Error(`Invalid expanded lesson ${id}`);
 const stages=flow.split('~').map(s=>{const i=s.indexOf('：');return {label:s.slice(0,i),text:s.slice(i+1)};});
 if(stages.length!==4)throw Error(`Expected four stages: ${id}`);
 const chapters=pdfChapters.filter(c=>c.topics.includes(id)||(extraChapters[id]||[]).includes(c.number));
 const corrections=Object.entries(pdfNotes).filter(([page])=>chapters.some(c=>Number(page)>=c.start&&Number(page)<=c.end)).flatMap(([page,notes])=>notes.map(n=>({...n,page:Number(page)})));
 const official=[...(id==='ipv6'?[lessonReferences.ipv6,lessonReferences.format]:[]),...(['router-id','dr-bdr','ospf-neighbor'].includes(id)?[lessonReferences.ospf]:[]),...(id==='ansible'?[lessonReferences.ansible]:[]),...(['ai','terraform'].includes(id)?[lessonReferences.exam]:[]),...(id==='terraform'?[lessonReferences.terraform]:[])];
 return [id,{id,explanation,stages,worked,recall:{question,answer},chapters,corrections,official,
  basis:chapters.length?'pdf-aligned':'official-supplement',commandIds:conceptual.has(id)?[]:(relatedCommands[id]||topic.commands),
  verification:conceptual.has(id)?'本主題沒有單一 Cisco IOS 指令可完整驗證；請依上述流程辨識資料、角色與預期結果，再用下方自我檢核確認理解。':'先在對應設備與模式執行檢查，將輸出與本章案例逐項比對。設定片段需配合實際介面、位址與前置條件，最後驗證連通與保存狀態。'}];
}));
if(Object.keys(lessons).length!==topics.length||raw.length!==topics.length)throw Error('Expanded lesson coverage mismatch');
export const getLesson=id=>lessons[id];
