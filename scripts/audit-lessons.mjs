import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {topics} from '../data/catalog.js';
import {lessons} from '../data/lessons.js';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('data/pdf/manifest.json',root),'utf8'));
const source=await readFile(process.argv[2]||new URL('data/pdf/source.pdf',root));
const hash=createHash('sha256').update(source).digest('hex');
if(hash!==manifest.sourceSha256)throw Error('PDF differs from the imported source');
const lines=topics.map(t=>{const l=lessons[t.id];return `| ${t.en} / ${t.name} | ${l.chapters.map(c=>`${c.number}（p. ${c.start}–${c.end}）`).join('、')||'官方補充：2024 PDF 未完整涵蓋'} | ${l.corrections.map(n=>`p. ${n.page}`).join('、')||'—'} |`;});
const report=`# 家教與章節教材核對紀錄

日期：2026-09-30。來源為使用者提供的 Jeremy’s IT Lab 2024 PDF，454 頁、66 章。SHA-256：\`${hash}\`。

## 核對方式與範圍

檢視現有 104 個主題摘要、CLI 範例及家教渲染方式，對照原書英文文字、章節重點與相關技術段落，整理原創擴充教材。102 個主題建立 PDF 章節對照；AI／Terraform 使用官方 v1.1 範圍與產品文件補充。映射表表示相關參考章節，不表示其中每句擴充案例均逐字出自 PDF。

這次是網站教學內容核對與擴充，不是 454 頁機器翻譯的逐句人工校對；原頁與英文仍保留。資料完整性測試也不能替代語意審查或實機 CLI 驗證。

## 發現與處理

- 舊家教與章節共用 PC1 → SW1 → SW2 → R1 圖解，不能正確描述不同協定。改為 104 套各自的四步流程與案例；家教與章節使用同一資料層。
- 舊教材多為單句摘要。補入 104 段原理、104 個案例推導、104 組回想問題／參考解答，以及來源頁碼與適用限制。
- 概念型主題原先常顯示無直接關聯的 show version 或 CDP。現在區分概念驗證與 Cisco CLI，新增 SVI、DHCP pool、Snooping binding 範例；SSH 補 configure terminal 模式切換。
- 家教測驗原本僅能完成當前題，補上下一題入口，可持續練習既有及 PDF 新題。
- 原書 p. 41 將 Status／Protocol 層級對調；p. 59 將 IP 位址寫成 TCP 標頭欄位；p. 74 的 /27 廣播有一處誤植。保留既有勘誤並在相關課程顯示。
- 新增原書 p. 207 勘誤：128 bits = 16 bytes，不是 8 bytes；依 RFC 4291 核對。
- 新增 p. 97 適用限制：native frame 少 tag 不能推論實際設備必然更快；native tagging 視平台配置。
- 新增 p. 233 適用限制：numbered ACL 的個別規則編輯能力須依模式與 IOS 版本，不一概判定不能編輯。
- DTP／VTP、RIP／EIGRP 與部分 Puppet／Chef 內容保留延伸閱讀標記；AI／Terraform 不冒稱出自舊 PDF。

## 官方核對資料

- [Cisco CCNA v1.1 範圍](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf)
- [RFC 4291：IPv6 位址](https://www.rfc-editor.org/rfc/rfc4291)
- [RFC 5952：IPv6 建議表示](https://www.rfc-editor.org/rfc/rfc5952)
- [Cisco：OSPF 介面](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13689-17.html)
- [Cisco：ACL sequence 編輯](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/sec_data_acl/configuration/15-sy/sec-data-acl-15-sy-book/sec-refine-ip-al.html)
- [Cisco：DHCP server](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/ip-addressing/b-ip-addressing/m_config-dhcp-server-xe.html)
- [HashiCorp：Terraform plan](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [Ansible：Inventory](https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_inventory.html)

## 主題與 PDF 對照

| 網站主題 | 原書章號與頁碼 | 顯示的勘誤／補充頁 |
| --- | --- | --- |
${lines.join('\n')}
`;
await writeFile(new URL('docs/content-audit.md',root),report);
console.log(JSON.stringify({topics:topics.length,pdfAligned:Object.values(lessons).filter(l=>l.chapters.length).length,officialSupplement:2,sourceHashMatches:true}));
