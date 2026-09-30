export const services=`
dhcp|DHCP|動態主機設定協定|自動分配 IP、mask、gateway、DNS 等設定。|典型 DORA 為 Discover、Offer、Request、ACK；server UDP 67、client UDP 68。|跨子網的廣播通常需要 DHCP relay。|用戶端 VLAN 的 L3 介面設定 ip helper-address。|dhcp
dns|DNS|網域名稱系統|查詢名稱與 IP 等資源紀錄的對應。|DNS 同時使用 UDP 53 與 TCP 53。|IP 能連通不表示名稱解析一定正常。|能 ping IP 但網址無法解析時，檢查 DNS。|dns
nat|NAT|網路位址轉換|在邊界轉換 IP，可使用 static 或動態 pool。|分辨 inside local/global，確認 inside/outside 介面。|NAT 不等於防火牆或加密。|10.0.0.10 映射到文件範例位址 203.0.113.10。|nat
pat|PAT / NAT Overload|連接埠位址轉換|利用 port 等資訊讓多個連線共享外部位址。|Cisco 常使用 overload 啟用多對一轉換。|不是每個內部主機都獲得獨立公網 IP。|數十台 PC 共用一個 ISP 位址上網。|pat
ntp|NTP|網路時間協定|讓設備時鐘與參考時間同步。|使用 UDP 123；stratum 表示與參考時鐘的層次距離。|Stratum 不是時區。|路由器與 switch 時間同步後能對照 syslog。|ntp
snmp|SNMP|簡易網路管理協定|Manager 向 agent 查詢管理資訊，agent 也可傳送通知。|常用 UDP 161 查詢、162 trap；v3 可提供驗證與加密。|Community string 不是加密保護。|監控系統查詢流量並接收 link-down 通知。|snmp
syslog|Syslog|系統日誌|將設備事件按 facility 與 severity 記錄。|Severity 0 最嚴重、7 為 debugging；傳統 UDP 514。|Level 4 通常包含 0 到 4，不是只包含 4。|收集介面狀態改變到集中日誌伺服器。|logging
qos|QoS|服務品質|透過分類、標記、佇列及流量管理分配有限頻寬。|Policing 可丟棄或重標；shaping 通常緩衝延後傳送。|QoS 不能增加實體頻寬。|給延遲敏感語音適當的優先佇列服務。|qos
ssh|SSH|安全殼層|提供加密遠端 CLI，常用 TCP 22。|需要主機金鑰、驗證與 VTY 設定，使用 SSHv2。|只建立 username 不表示 VTY 已允許 SSH。|VTY 設 login local 與 transport input ssh。|ssh
tftp|TFTP|簡易檔案傳輸協定|以 UDP 傳送檔案，常用於 lab 設定備份。|初始請求為 UDP 69，後續用協商的 transfer ID。|沒有 SFTP 的內建加密與驗證。|隔離 lab 用 copy running-config tftp: 備份。|backup
ftp|FTP|檔案傳輸協定|以分離的 TCP 控制與資料連線傳輸檔案。|控制 TCP 21；主動資料常由 server TCP 20 發起；被動模式使用其他埠。|FTP 與 FTPS、SFTP 不是同一協定。|只放行 21 仍可能使資料傳輸失敗。|backup`;
export const security=`
acl|ACL|存取控制清單|由上到下比對封包，第一條符合規則決定結果。|有 implicit deny，套用方向與介面同樣重要。|第一個匹配後不再往下找更合適規則。|先 permit 管理網段 SSH，再拒絕其他來源。|acl
standard-acl|Standard ACL|標準 ACL|IPv4 standard ACL 主要依來源 IP 篩選。|不能依 TCP 目的 port 區分 HTTPS。|規則中的來源不能看成目的位址。|允許 192.168.10.0/24 來源，其餘被 implicit deny 擋下。|standardacl
extended-acl|Extended ACL|延伸 ACL|可比對協定、來源、目的與 TCP/UDP port。|Destination 後的 eq 443 代表目的 port。|TCP 443 與 UDP 443 不屬相同傳輸協定。|允許員工網段到 10.0.0.10 的 TCP 443。|acl
named-acl|Named ACL|具名 ACL|以名稱識別 standard 或 extended ACL。|建立時仍需指定 ACL 類型，再套用介面。|有名稱不表示自動套用到流量。|建立 WEB_ONLY 後使用 ip access-group 套用。|acl
port-security|Port Security|交換埠安全|限制接入埠可用的來源 MAC 與數量。|Violation 有 protect、restrict、shutdown。|MAC 限制不是使用者身分驗證。|單 PC 埠設 maximum 1 與 sticky。|portsecurity
dhcp-snooping|DHCP Snooping|DHCP 監聽防護|檢查 DHCP 流量並建立 IP/MAC binding。|合法伺服器方向或必要上行設 trusted。|所有用戶埠都設 trusted 會失去主要防護。|阻擋員工埠上的 rogue DHCP server 回應。|snooping
dai|Dynamic ARP Inspection|動態 ARP 檢查|驗證 ARP 內的 IP/MAC 綁定以減少欺騙。|常使用 DHCP snooping binding，靜態主機需額外規劃。|忽略靜態 IP 主機可能使合法 ARP 被丟棄。|檢查宣稱閘道 IP 的 ARP 是否符合綁定。|dai
aaa|AAA|驗證、授權與稽核|拆分你是誰、可以做什麼、做過什麼。|Authentication 驗證，Authorization 授權，Accounting 記錄。|Accounting 不負責判斷密碼是否正確。|管理員登入後只能 show，系統記錄其命令。|ssh
authentication|Authentication|身分驗證|確認使用者或裝置所聲稱的身分。|可用密碼、憑證或多因素。|通過驗證不表示拥有全部權限。|密碼加一次性驗證碼確認登入者。|ssh
authorization|Authorization|授權|依身分及政策決定可執行的操作。|以角色與最小權限限制資源存取。|授權不等於登入密碼檢查。|維運角色只能檢視，不能修改 ACL。|ssh
accounting|Accounting|活動稽核|保存登入、命令與連線時間等操作記錄。|正確時間與記錄保存能支援追蹤。|記錄活動不表示能自動阻止未授權操作。|TACACS+ 留存管理員執行的命令。|logging
vpn|VPN|虛擬私人網路|在共享網路建立邏輯通道，IPsec 可提供加密、完整性與驗證。|區分 site-to-site 與 remote-access。|VPN 不會自動修正錯誤路由或保護不安全端點。|分公司使用 site-to-site VPN 連總部。|route
wireless-security|Wireless Security|無線網路安全|結合無線驗證與鏈路資料保護。|Personal 常用 PSK/SAE，Enterprise 常用 802.1X。|隱藏 SSID 不能取代強加密與驗證。|公司員工用各自帳號登入 Enterprise WLAN。|cdp
wpa2|WPA2|第二代 Wi-Fi 保護存取|通常使用 AES-CCMP，支援 Personal 與 Enterprise。|WPA2-PSK 的 client 與 AP 需一致預共享密鑰。|PSK 與企業版 802.1X 驗證不同。|Lab SSID 設 WPA2-PSK 與高強度密碼。|cdp
wpa3|WPA3|第三代 Wi-Fi 保護存取|WPA3-Personal 使用 SAE 改善驗證及抵抗離線猜測能力。|SAE 是辨識 WPA3-Personal 的重點。|不能因此忽略弱密碼與端點安全。|支援的 AP 與 client 以 SAE 驗證連線。|cdp
security-concepts|Threats and Mitigation|威脅與緩解|Weakness 是弱點，threat 是潛在危害，exploit 是利用弱點的方法。|更新、分區、最小權限與監控是不同防護層。|風險降低不表示完全沒有風險。|修補漏洞並限制管理來源以降低攻擊面。|ssh
passwords|Password Policy|密碼與設備存取|強度、生命週期及多因素共同支援存取安全。|使用 secret 類型憑證並避免共用管理帳號。|service password-encryption 的弱混淆不能當成強密碼保護。|為各管理員建獨立帳號，離職時撤銷。|ssh
awareness|Security Awareness|資安意識與實體存取|人員訓練與機房門禁補足技術措施。|核實可疑要求、通報釣魚、限制 console 存取。|ACL 無法防止所有社交工程或實體破壞。|未經核准的 USB 依流程拒絕並通報。|logging`;
export const automation=`
controller|Controller-based Networking|控制器式網路|以集中平台協調設備政策與狀態。|邏輯管理集中與實際資料轉送可分離。|Switch 仍保有資料轉送能力。|從控制器為多台設備套用一致政策。|version
sdn|SDN|軟體定義網路|分離控制與資料平面，以程式介面協調網路。|Northbound 連應用與控制器；southbound 連控制器與設備。|Overlay 仍需 underlay 提供實際連通。|應用提交政策，控制器協調各設備。|version
catalyst|Cisco Catalyst Center|Cisco 校園管理平台|提供企業網路自動化、管理與可視性，前身名 DNA Center。|盤點、政策與 assurance 是理解重點。|集中管理不取代基礎路由與交換知識。|統一查看設備版本與健康狀態。|version
rest|REST API|REST 應用程式介面|以資源及 HTTP 方法描述程式存取方式。|GET 讀、POST 常建立、PUT 替換、PATCH 部分更新、DELETE 刪除。|REST 不限 JSON，也不自動具備安全驗證。|GET /devices 取得設備清單。|version
http|HTTP|超文字傳輸協定|用 request/response 交換應用資料。|2xx 成功、4xx 用戶端問題、5xx 伺服器問題；HTTPS 使用 TLS。|HTTP 200 不保證業務資料本身正確。|無效 token 可能得到 401。|version
json|JSON|JavaScript 物件表示法|以 object、array、string、number、boolean、null 表達資料。|Key 與字串需雙引號，boolean 使用 true/false。|JSON 不接受 trailing comma 或一般註解。|{"hostname":"R1","enabled":true} 表達設備資料。|version
xml|XML|可延伸標記語言|以成對標籤與屬性表達階層資料。|標籤需正確巢狀與關閉。|XML 是資料格式，不是路由協定。|<device><name>R1</name></device> 表達名稱。|version
yaml|YAML|YAML 資料序列化|以縮排描述資料階層，常見於 playbook。|縮排具有語意，清單常用減號。|縮排改變可能改變結構，不只是排版。|Ansible playbook 列出設備群與任務。|version
ansible|Ansible|Ansible 設定管理|以 playbook 描述任務，透過 SSH/API 等管理設備。|通常不需在受管網路設備安裝專用 agent。|重複執行安全與否仍取決於模組及設計。|一致套用 NTP server 到一組 switch。|ntp
configuration|Configuration Management|設定管理|以範本、版本與流程管理設定，減少漂移。|變更仍需比較、審核、備份及驗證。|自動化會快速擴散錯誤，不能跳過測試。|比對 running-config 與核准範本。|running
traditional|Traditional vs Controller|傳統與控制器式管理|逐台設備操作與集中政策協調的管理方式不同。|比較一致性、可視性、規模與管理範圍。|有 GUI 的設備不一定就是 SDN 控制器。|十台設備逐台設定與一次套用政策有不同成本。|running
ai|AI and Machine Learning|AI 與機器學習|預測模型偵測趨勢，生成式 AI 可產生文字或設定草稿。|需驗證資料品質、模型輸出並保留人員覆核。|AI 輸出不是必然正確，不能未驗證就套用設定。|模型發現流量異常，由工程師確認原因。|interfaces
terraform|Terraform|基礎設施宣告管理|以宣告式設定描述目標資源，由 provider 操作平台。|Plan 預覽變更，state 追蹤已管理資源。|不是路由協定，也不限於單台 switch 設定。|檢查 plan 後核准建立基礎設施。|version
api-auth|API Authentication|API 驗證|以 basic、token 等方式驗證存取者。|Token 限制權限與期限，HTTPS 保護傳輸。|Base64 編碼不等於加密。|Authorization header 攜帶受限 token。|version`;
export const protocolFacts={
 dhcp:{port:'UDP 67 / 68',flow:'Discover → Offer → Request → ACK'},dns:{port:'UDP / TCP 53',flow:'Client query → resolver → 回覆與快取'},nat:{port:'不固定；位址轉換功能',flow:'Inside → 位址轉換 → Outside'},pat:{port:'不固定；使用連線 port 映射',flow:'多個內部連線 → 一個外部 IP 與不同 port'},ntp:{port:'UDP 123',flow:'Client 對照 server 時間並校正'},snmp:{port:'UDP 161 / 162（常見）',flow:'Manager 查詢 agent；agent 發送通知'},syslog:{port:'UDP 514（傳統）；TLS 常見 TCP 6514',flow:'設備事件 → severity 篩選 → collector'},qos:{port:'不固定；轉送策略',flow:'分類 → 標記 → 排隊 / policing / shaping'},ssh:{port:'TCP 22',flow:'建立加密通道 → 驗證 → 遠端管理'},tftp:{port:'UDP 69 初始請求',flow:'請求 → 分塊傳送 → ACK'},ftp:{port:'TCP 21 控制；資料依模式',flow:'控制連線 → 建立資料連線 → 傳輸'}
};
