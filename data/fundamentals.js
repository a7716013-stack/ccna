export const fundamentals=`
osi|OSI Model|OSI 七層模型|將通訊分為七層，提供描述協定與排除故障的共同語言。|由下而上為實體、資料連結、網路、傳輸、會議、表達、應用；IP 在 L3，TCP 在 L4。|不能只看設備名稱判斷層級，交換器也可能支援 L3。|線材未插是 L1；VLAN 錯誤是 L2；閘道設定錯誤是 L3。|interfaces
tcpip|TCP/IP Model|TCP/IP 模型|以鏈路、網際網路、傳輸與應用四層描述 Internet 協定族。|資料逐層封裝為 segment / datagram、IP packet、Ethernet frame。|TCP/IP 與 OSI 並非每一層都一對一對應。|HTTP 資料交給 TCP，再由 IP 與 Ethernet 傳送。|interfaces
lan|LAN|區域網路|在辦公室或校園等範圍連接設備的網路。|同一 VLAN 為一個 L2 廣播網域；跨 VLAN 需路由。|LAN 不一定只有一台交換器或一個子網。|兩台辦公室交換器以 trunk 延伸員工 VLAN。|vlan
wan|WAN|廣域網路|跨地域連接不同 LAN，通常使用業者提供的連線。|延遲、可用性與頻寬都是設計條件。|WAN 不等於只能使用 Internet。|台北與高雄辦公室透過業者線路或 VPN 互連。|route
ethernet|Ethernet|乙太網路|以 frame 與 MAC 位址在鏈路傳輸資料的技術家族。|Frame 包含來源、目的 MAC 與錯誤偵測 FCS。|全雙工交換式 Ethernet 不用 CSMA/CD 處理碰撞。|同 VLAN 主機透過交換器轉送 Ethernet frame。|interfaces
mac|MAC Address|媒體存取控制位址|Ethernet MAC 通常為 48 bits，以十六進位表示。|交換器學習來源 MAC，根據目的 MAC 決定輸出埠。|跨路由器後 L2 標頭重建，MAC 與 IP 不能混為一談。|MAC table 將 0011.2233.4455 對應到 Gi0/1。|mac
ipv4|IPv4|第四版網際網路協定|32-bit 位址配合 prefix 區分網路與主機。|先以遮罩判斷目的是否本地，再決定送給主機或閘道。|2^h−2 的主機數公式不適用所有 /31 或 /32 情境。|192.168.10.70/26 的網路是 .64，廣播是 .127。|ipbrief
ipv6|IPv6|第六版網際網路協定|使用 128-bit（16 bytes）位址，常見 LAN prefix 為 /64。|沒有 broadcast；:: 在同一位址只可縮寫一次。|Link-local 不應經路由器轉送到其他鏈路。|2001:db8:10::1/64 可用於文件範例。|ipv6
tcp|TCP|傳輸控制協定|提供可靠、有序的位元組串流，具確認與重傳機制。|三向交握為 SYN、SYN-ACK、ACK。|TCP 可靠傳輸不等於內建資料加密。|SSH 使用 TCP 22，丟失資料由 TCP 重傳。|ssh
udp|UDP|使用者資料包協定|提供無連線 datagram 傳送，標頭負擔較低。|UDP 本身不保證送達、順序或重傳。|應用可自行增加可靠性，不能說 UDP 應用一律不重傳。|DNS 查詢與即時語音常使用 UDP。|interfaces
arp|ARP|位址解析協定|將同一 IPv4 鏈路的下一跳 IP 解析成 MAC。|Request 通常廣播，Reply 通常單播。|遠端目的地要解析閘道 MAC，不是遠端伺服器 MAC。|PC 要上網時先查詢 192.168.1.1 的 MAC。|arp
icmp|ICMP|網際網路控制訊息協定|傳遞 IP 錯誤與診斷訊息，ping 使用 Echo。|ICMP 不使用 TCP 或 UDP port。|ping 不通可能是過濾規則，不一定是主機離線。|先 ping 閘道，再逐步測試外部位址。|ping
switching|Switching|交換基礎|L2 switch 依 MAC table 在同 VLAN 轉送訊框。|未知單播會向同 VLAN 其他埠泛洪，排除入站埠。|學習的是來源 MAC，轉送查的是目的 MAC。|SW1 沒有目的 MAC 紀錄時不會直接丟棄所有未知單播。|mac
routing-basic|Routing|路由基礎|路由器依目的 IP 連接不同網路，決定下一跳。|每一跳減少 TTL，並重新封裝 L2 標頭。|一般路由不改來源與目的 IP；NAT 才進行位址轉換。|PC1 → SW1 → R1 → 遠端子網 PC2。|route
wireless-basic|Wireless Principles|無線網路基礎|Wi-Fi 以射頻在 AP 與 client 間共享媒介。|2.4 GHz 的常見 20 MHz 非重疊規劃為 1、6、11，依地區規範。|相同 SSID 不代表相同 channel。|相鄰 AP 避免使用重疊頻道以降低干擾。|interfaces
topology|Network Topology|網路拓樸|描述設備的實體連接與邏輯角色。|三層校園包含 access、distribution、core；資料中心常見 spine-leaf。|物理連接與實際封包路徑不一定相同。|每台 leaf 接所有 spine，leaf 之間透過 spine 傳輸。|cdp
physical|Physical Interface|實體介面|介面運作取決於線路、速率、雙工與管理設定。|分辨 administratively down、down/down、up/down。|有正確 IP 不代表實體鏈路正常。|介面被 shutdown，即使線材正常也無法通訊。|ipbrief
cabling|Cabling|網路佈線|銅線、單模與多模光纖適合不同距離與環境。|收發器型別、波長、纖芯與速率需相容。|不能只看接頭外觀就判斷是否支援所需距離。|跨建築長距離連線依規格選擇單模光纖。|interfaces
private-ip|Private IPv4|私有 IPv4 位址|RFC 1918 保留位址供私人網路使用。|三段為 10.0.0.0/8、172.16.0.0/12、192.168.0.0/16。|172.0.0.0/8 並非全部都是私有。|172.20.5.10 是私有，172.32.5.10 不屬 RFC 1918。|ipbrief
virtualization|Virtualization / VRF|虛擬化與 VRF|Hypervisor 承載 VM，container 共享核心，VRF 分隔路由表。|VRF 在同一設備維護獨立 L3 路由環境。|VLAN 的 L2 隔離與 VRF 的 L3 隔離不同。|不同 VRF 可各有 10.0.0.0/24 而不互相混淆。|route
poe|Power over Ethernet|乙太網路供電|透過 Ethernet 線材供電給 AP 或 IP phone。|需同時確認 PoE 標準、單埠供電與總電力預算。|有 Ethernet port 不表示支援 PoE。|AP 不開機時檢查交換器可用 PoE 電力。|power
ipv6-types|IPv6 Address Types|IPv6 位址類型|Unicast 指單一介面，multicast 指群組，anycast 由路由選擇最近實例。|Link-local 為 fe80::/10，ULA 為 fc00::/7；IPv6 沒有廣播。|Anycast 不代表將資料送到群組所有成員。|以鄰居 link-local 作下一跳時指定輸出介面。|ipv6
eui64|Modified EUI-64|修正式 EUI-64|以 MAC 衍生 64-bit interface ID，插入 fffe 並翻轉 U/L bit。|首個 octet 翻轉 0x02 位元。|不是所有 IPv6 位址都必須由 MAC 衍生。|00:11:22:33:44:55 對應 0211:22ff:fe33:4455。|ipv6
client-ip|Client IP Verification|用戶端 IP 檢查|核對主機 IP、遮罩、gateway 與 DNS，逐層排錯。|Windows 用 ipconfig /all；Linux 用 ip address 與 ip route。|IP 可通但名稱不通時應優先檢查 DNS。|先測試 gateway，再測目的 IP，最後查 DNS 名稱。|ping
components|Network Components|網路元件角色|Router 連接網路、switch 交換訊框、AP 連接無線、server 提供服務。|Firewall 依政策過濾；IPS 可偵測並阻擋威脅。|Controller 集中管理不表示所有使用者資料都經過它。|辦公室 AP 接 PoE switch，再由 firewall 連至 Internet。|cdp
duplex|Duplex and Interface Errors|雙工與介面錯誤|雙工不匹配可造成碰撞、錯誤計數與吞吐量下降。|Full duplex 可同時傳送接收；half duplex 使用共享媒介。|CRC 也可能由線材問題造成，不能只憑單一計數診斷。|檢查一端強制 full、另一端協商失敗的鏈路。|interfaces`;
