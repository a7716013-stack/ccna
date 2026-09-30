import { fundamentals } from './fundamentals.js';
import { access, connectivity } from './networking.js';
import { services, security, automation } from './services.js';
export const sources=[
 {name:'Cisco CCNA v1.1 Exam Topics',url:'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf'},
 {name:'Cisco：2027 年考試更新時程',url:'https://blogs.cisco.com/learning/ai-updates-ccna-ccie-automation'},
 {name:'Cisco IOS XE：802.1Q Inter-VLAN Routing',url:'https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/lan-wan/b-lan-wan/m_lnsw-conf-vlan-ieee.html'},
 {name:'Cisco IOS Interface Command Reference',url:'https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/interface/command/ir-cr-book/ir-s7.html'}
];
export const domains=[
 {id:'fundamentals',name:'網路基礎',en:'Network Fundamentals',weight:20,color:'#338878',icon:'network',description:'從封包旅程開始，理解位址、模型與網路設備。'},
 {id:'access',name:'網路存取',en:'Network Access',weight:20,color:'#518cc4',icon:'layers',description:'掌握 VLAN、交換技術與無線網路的連接方式。'},
 {id:'connectivity',name:'IP 連線',en:'IP Connectivity',weight:25,color:'#9372b3',icon:'route',description:'讀懂路由表，決定每一個封包的下一站。'},
 {id:'services',name:'IP 服務',en:'IP Services',weight:10,color:'#c38d43',icon:'server',description:'認識讓網路運作順暢的基礎服務與管理工具。'},
 {id:'security',name:'安全基礎',en:'Security Fundamentals',weight:15,color:'#bf717b',icon:'shield',description:'從存取控制到無線防護，建立安全的網路邊界。'},
 {id:'automation',name:'自動化與程式化',en:'Automation & Programmability',weight:10,color:'#5a98a4',icon:'code',description:'理解控制器、API 與可重複的網路管理。'}
];
// Each source row: id | English | 中文 | 概念 | 考點 | 陷阱 | 案例 | command id
export const topics=Object.entries({fundamentals,access,connectivity,services,security,automation}).flatMap(([domain,rows])=>rows.trim().split('\n').map((line,index)=>{
 const [id,en,name,concept,key,trap,example,command]=line.split('|');
 return {id,domain,en,name,concept,key,trap,example,commands:[command],order:index+1,difficulty:index<7?'初級':'中級',minutes:5+index%4,tags:[en,name],diagram:domain==='access'?'PC1 → SW1 → SW2 → R1':domain==='connectivity'?'來源主機 → 預設閘道 → 最佳路由 → 目的網路':domain==='automation'?'應用 / 政策 → 控制器 / API → 網路設備':'用戶端 → 交換器 → 路由器 → 服務端'};
}));
export const getTopic=id=>topics.find(t=>t.id===id);
export const getDomain=id=>domains.find(d=>d.id===id);
export const glossary=topics.map(t=>({id:t.id,en:t.en,name:t.name,definition:t.concept,example:t.example,topic:t.id})).concat([
 {id:'gateway',en:'Default Gateway',name:'預設閘道',definition:'主機送往其他子網時使用的第一個路由器位址。',example:'192.168.1.10/24 使用 192.168.1.1 為閘道。',topic:'routing-basic'},
 {id:'broadcast-domain',en:'Broadcast Domain',name:'廣播網域',definition:'L2 廣播可到達的邏輯範圍；VLAN 可分隔廣播網域。',example:'VLAN 10 的 L2 廣播不會由 L2 switch 送入 VLAN 20。',topic:'vlan'},
 {id:'collision-domain',en:'Collision Domain',name:'碰撞網域',definition:'半雙工共享媒介中可能發生訊框碰撞的範圍。',example:'全雙工交換鏈路不發生傳統半雙工碰撞。',topic:'duplex'},
 {id:'wildcard',en:'Wildcard Mask',name:'萬用遮罩',definition:'0 bit 必須相同，1 bit 可以忽略。連續子網遮罩的反碼可用來比對子網。',example:'192.168.1.0 0.0.0.255 比對 192.168.1.0/24。',topic:'acl'}
]);
