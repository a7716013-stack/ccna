# 家教與章節教材核對紀錄

日期：2026-09-30。來源為使用者提供的 Jeremy’s IT Lab 2024 PDF，454 頁、66 章。SHA-256：`54ad2155d85dc5f86e506c946cc45cc5218df355d9810b561037810ea4f53e6f`。

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
| OSI Model / OSI 七層模型 | 3（p. 10–14） | — |
| TCP/IP Model / TCP/IP 模型 | 3（p. 10–14） | — |
| LAN / 區域網路 | 52（p. 355–360） | — |
| WAN / 廣域網路 | 53（p. 361–369） | — |
| Ethernet / 乙太網路 | 5（p. 21–25） | — |
| MAC Address / 媒體存取控制位址 | 6（p. 26–29） | — |
| IPv4 / 第四版網際網路協定 | 7（p. 30–37）、8（p. 38–40）、10（p. 47–49）、13（p. 67–70）、14（p. 71–71）、15（p. 72–75） | p. 74 |
| IPv6 / 第六版網際網路協定 | 31（p. 205–211）、33（p. 219–225） | p. 207 |
| TCP / 傳輸控制協定 | 30（p. 197–204） | — |
| UDP / 使用者資料包協定 | 30（p. 197–204） | — |
| ARP / 位址解析協定 | 6（p. 26–29）、12（p. 59–66） | p. 59 |
| ICMP / 網際網路控制訊息協定 | 10（p. 47–49）、12（p. 59–66）、33（p. 219–225） | p. 59 |
| Switching / 交換基礎 | 5（p. 21–25） | — |
| Routing / 路由基礎 | 10（p. 47–49）、12（p. 59–66） | p. 59 |
| Wireless Principles / 無線網路基礎 | 55（p. 382–390） | — |
| Network Topology / 網路拓樸 | 52（p. 355–360） | — |
| Physical Interface / 實體介面 | 2（p. 4–9）、9（p. 41–46） | p. 41 |
| Cabling / 網路佈線 | 2（p. 4–9） | — |
| Private IPv4 / 私有 IPv4 位址 | 7（p. 30–37）、44（p. 302–306） | — |
| Virtualization / VRF / 虛擬化與 VRF | 54a（p. 370–375）、54b（p. 376–378）、54c（p. 379–381） | — |
| Power over Ethernet / 乙太網路供電 | 2（p. 4–9） | — |
| IPv6 Address Types / IPv6 位址類型 | 32（p. 212–218） | — |
| Modified EUI-64 / 修正式 EUI-64 | 32（p. 212–218） | — |
| Client IP Verification / 用戶端 IP 檢查 | 38（p. 258–264）、39（p. 265–276） | — |
| Network Components / 網路元件角色 | 1（p. 3–3） | — |
| Duplex and Interface Errors / 雙工與介面錯誤 | 9（p. 41–46） | p. 41 |
| VLAN / 虛擬區域網路 | 16（p. 76–83） | — |
| Access Port / 存取埠 | 16（p. 76–83） | — |
| Trunk Port / 中繼埠 | 17（p. 84–96）、19（p. 105–108） | p. 105 |
| 802.1Q / VLAN 標記 | 17（p. 84–96） | — |
| Native VLAN / 原生 VLAN | 17（p. 84–96） | — |
| Inter-VLAN Routing / 跨 VLAN 路由 | 18（p. 97–104） | p. 97 |
| Router-on-a-Stick / 單臂路由 | 18（p. 97–104） | p. 97 |
| STP / 生成樹協定 | 20（p. 109–119）、21（p. 120–126） | — |
| RSTP / Rapid PVST+ / 快速生成樹 | 22（p. 127–135） | — |
| Root Bridge / 根橋接器 | 20（p. 109–119） | — |
| Root Port / 根連接埠 | 20（p. 109–119） | — |
| Designated Port / 指定連接埠 | 20（p. 109–119） | — |
| EtherChannel / 鏈路聚合 | 23（p. 136–148） | — |
| LACP / 鏈路聚合控制協定 | 23（p. 136–148） | — |
| CDP / Cisco 探索協定 | 36（p. 240–247） | — |
| LLDP / 鏈路層探索協定 | 36（p. 240–247） | — |
| Wireless Architecture / 無線網路架構 | 56（p. 391–400）、58（p. 407–427） | — |
| STP Protection / 生成樹防護 | 21（p. 120–126） | — |
| Voice VLAN / 語音 VLAN | 46（p. 315–320） | — |
| WLAN Configuration / 無線 LAN 設定 | 58（p. 407–427） | — |
| Device Management / 設備管理方式 | 4（p. 15–20）、42（p. 288–293） | — |
| Routing Table / 路由表 | 11a（p. 50–52） | — |
| Static Route / 靜態路由 | 11b（p. 53–58） | — |
| Default Route / 預設路由 | 11b（p. 53–58） | — |
| IPv4 Forwarding / IPv4 轉送 | 10（p. 47–49）、11a（p. 50–52）、12（p. 59–66） | p. 59 |
| IPv6 Routing / IPv6 路由 | 33（p. 219–225） | — |
| Administrative Distance / 管理距離 | 24（p. 149–159）、25（p. 160–168） | p. 160 |
| Metric / 路由度量 | 24（p. 149–159）、25（p. 160–168）、27（p. 175–182） | p. 160 |
| Longest Prefix Match / 最長前綴匹配 | 11a（p. 50–52）、24（p. 149–159） | — |
| OSPF / 開放最短路徑優先 | 26（p. 169–174） | — |
| OSPF Neighbor / OSPF 鄰居 | 27（p. 175–182）、28（p. 183–189） | — |
| OSPF Router ID / OSPF 路由器識別碼 | 26（p. 169–174） | — |
| DR / BDR / 指定與備援指定路由器 | 28（p. 183–189） | — |
| First Hop Redundancy / 第一跳備援 | 29（p. 190–196） | — |
| Floating Static Route / 浮動靜態路由 | 24（p. 149–159）、33（p. 219–225） | — |
| DHCP / 動態主機設定協定 | 39（p. 265–276） | — |
| DNS / 網域名稱系統 | 38（p. 258–264） | — |
| NAT / 網路位址轉換 | 44（p. 302–306）、45（p. 307–314） | — |
| PAT / NAT Overload / 連接埠位址轉換 | 45（p. 307–314） | — |
| NTP / 網路時間協定 | 37（p. 248–257） | — |
| SNMP / 簡易網路管理協定 | 40（p. 277–283） | — |
| Syslog / 系統日誌 | 41（p. 284–287） | — |
| QoS / 服務品質 | 46（p. 315–320）、47（p. 321–328） | — |
| SSH / 安全殼層 | 42（p. 288–293） | — |
| TFTP / 簡易檔案傳輸協定 | 43（p. 294–301） | — |
| FTP / 檔案傳輸協定 | 43（p. 294–301） | — |
| ACL / 存取控制清單 | 34（p. 226–231） | — |
| Standard ACL / 標準 ACL | 34（p. 226–231） | — |
| Extended ACL / 延伸 ACL | 35（p. 232–239） | p. 233 |
| Named ACL / 具名 ACL | 35（p. 232–239） | p. 233 |
| Port Security / 交換埠安全 | 49（p. 335–342） | — |
| DHCP Snooping / DHCP 監聽防護 | 50（p. 343–348） | — |
| Dynamic ARP Inspection / 動態 ARP 檢查 | 51（p. 349–354） | — |
| AAA / 驗證、授權與稽核 | 48（p. 329–334） | — |
| Authentication / 身分驗證 | 48（p. 329–334）、57（p. 401–406） | — |
| Authorization / 授權 | 48（p. 329–334） | — |
| Accounting / 活動稽核 | 48（p. 329–334） | — |
| VPN / 虛擬私人網路 | 48（p. 329–334）、53（p. 361–369） | — |
| Wireless Security / 無線網路安全 | 57（p. 401–406） | — |
| WPA2 / 第二代 Wi-Fi 保護存取 | 57（p. 401–406） | — |
| WPA3 / 第三代 Wi-Fi 保護存取 | 57（p. 401–406） | — |
| Threats and Mitigation / 威脅與緩解 | 48（p. 329–334） | — |
| Password Policy / 密碼與設備存取 | 48（p. 329–334） | — |
| Security Awareness / 資安意識與實體存取 | 48（p. 329–334） | — |
| Controller-based Networking / 控制器式網路 | 59（p. 428–434） | — |
| SDN / 軟體定義網路 | 62（p. 444–449） | — |
| Cisco Catalyst Center / Cisco 校園管理平台 | 62（p. 444–449） | — |
| REST API / REST 應用程式介面 | 61（p. 440–443） | — |
| HTTP / 超文字傳輸協定 | 61（p. 440–443） | — |
| JSON / JavaScript 物件表示法 | 60（p. 435–439） | — |
| XML / 可延伸標記語言 | 60（p. 435–439） | — |
| YAML / YAML 資料序列化 | 60（p. 435–439） | — |
| Ansible / Ansible 設定管理 | 63（p. 450–454） | p. 450 |
| Configuration Management / 設定管理 | 63（p. 450–454） | p. 450 |
| Traditional vs Controller / 傳統與控制器式管理 | 59（p. 428–434） | — |
| AI and Machine Learning / AI 與機器學習 | 官方補充：2024 PDF 未完整涵蓋 | — |
| Terraform / 基礎設施宣告管理 | 官方補充：2024 PDF 未完整涵蓋 | — |
| API Authentication / API 驗證 | 61（p. 440–443） | — |
