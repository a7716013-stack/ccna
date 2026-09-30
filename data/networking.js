export const access=`
vlan|VLAN|虛擬區域網路|將 L2 網路劃分成獨立廣播網域。|同 VLAN 可跨 switch 延伸，不同 VLAN 互通需要 L3。|只建立 VLAN 不會自動建立跨 VLAN 路由。|員工 VLAN 10、訪客 VLAN 20，使用 ACL 控制互通。|vlan
access-port|Access Port|存取埠|一般 access port 將未標記資料訊框放入指定 data VLAN。|mode access 設定角色，access vlan 設定 VLAN。|Voice VLAN 是特定用途例外，不代表一般 access 埠等同 trunk。|PC 接 Gi0/1，設定 access VLAN 10。|access
trunk|Trunk Port|中繼埠|單一鏈路承載多個 VLAN，通常以 802.1Q 區分。|確認兩端模式、allowed VLAN 及 native VLAN。|VLAN 存在但未允許通過 trunk，仍可能無法通訊。|SW1 與 SW2 的 trunk 同時承載 VLAN 10、20。|trunk
dot1q|802.1Q|VLAN 標記|在 Ethernet frame 插入 VLAN 識別資訊。|VLAN ID 欄位為 12 bits，保留與可配置範圍需區分。|只支援 802.1Q 的平台可能沒有 trunk encapsulation 選擇指令。|Trunk 上的 VLAN 10 資料通常帶 tag 10。|trunk
native-vlan|Native VLAN|原生 VLAN|Trunk 預設以 native VLAN 歸屬未標記訊框。|兩端 native VLAN 應一致，避免錯誤 VLAN 歸屬。|Native VLAN 不代表 trunk 的所有 VLAN 都不帶 tag。|一端 native 99、一端 native 1 會造成 mismatch。|trunk
inter-vlan|Inter-VLAN Routing|跨 VLAN 路由|以路由器子介面或 L3 switch SVI 連接不同 VLAN。|各主機的 gateway 必須位於自己的子網。|L2 switch 有管理 IP 不表示能路由不同 VLAN。|VLAN 10 與 20 分別使用不同的 L3 gateway IP。|roas
roas|Router-on-a-Stick|單臂路由|路由器一個實體介面使用多個 dot1q 子介面服務不同 VLAN。|子介面需設定 encapsulation 與 IP；switch 側需 trunk。|子介面編號不是 VLAN ID，真正對應由 dot1q 指令指定。|Gi0/0.10 對應 VLAN 10，Gi0/0.20 對應 VLAN 20。|roas
stp|STP|生成樹協定|在冗餘 L2 拓樸阻擋部分路徑以避免迴圈。|先選 root bridge，再決定 port role。|Ethernet 沒有類似 IP TTL 的欄位終止 L2 迴圈。|三台 switch 三角連接，由 STP 阻擋其中一段的轉送。|stp
rstp|RSTP / Rapid PVST+|快速生成樹|改善生成樹收斂；Rapid PVST+ 為各 VLAN 執行快速生成樹。|三種狀態為 discarding、learning、forwarding。|PortFast 不等於停用 STP。|終端接入埠用 PortFast 搭配 BPDU Guard。|stp
root-bridge|Root Bridge|根橋接器|由最低 Bridge ID 的交換器擔任拓樸參考點。|先比 priority，相同再比 MAC；越低越優先。|不是 MAC 最大或連線最多的 switch 當 root。|Priority 4096 通常優於 32768。|stp
root-port|Root Port|根連接埠|非根交換器選擇到 root 的最佳埠。|先比 root path cost，再依 BPDU 欄位打破平手。|Root bridge 本身沒有 root port。|SW2 選擇總成本較低的上行作 root port。|stp
designated-port|Designated Port|指定連接埠|每個鏈路區段選擇提供最佳 root 路徑的埠。|指定埠為區段提供轉送路徑，其他埠可能被阻擋。|一台 switch 可以有多個 designated port。|Root bridge 上正常參與 STP 的埠通常為 designated。|stp
etherchannel|EtherChannel|鏈路聚合|多條相容實體鏈路組成一個邏輯 port-channel。|成員速率、VLAN 與 trunk/access 設定需相容。|單一 flow 不一定能使用所有鏈路的總頻寬。|兩條 1G 鏈路提供聚合容量與單線備援。|etherchannel
lacp|LACP|鏈路聚合控制協定|以 active/passive 模式協商標準化鏈路聚合。|Active 會主動協商，passive 只回應。|Passive/passive 無主動方，不能建立 LACP 聚合。|SW1 active 與 SW2 passive 組成 Port-channel 1。|lacp
cdp|CDP|Cisco 探索協定|Cisco 的直接 L2 鄰居探索協定。|可顯示對端設備名稱、平台與 port ID。|不能直接顯示多跳之外的所有設備。|show cdp neighbors 找出 Gi0/1 的對端 port。|cdp
lldp|LLDP|鏈路層探索協定|IEEE 802.1AB 的跨廠商鄰居探索協定。|適合多品牌設備交換直接鄰居資訊。|LLDP 與 CDP 都不是 IP 路由協定。|Cisco 與其他廠牌 switch 用 LLDP 確認連線。|lldp
wireless-arch|Wireless Architecture|無線網路架構|AP 可獨立管理，也可由 WLC 或雲端平台管理。|Lightweight AP 使用 CAPWAP；不同模式有不同資料路徑。|集中管理不代表所有模式的資料都送回 WLC。|分公司 FlexConnect 可在本地交換流量。|cdp
stp-guard|STP Protection|生成樹防護|BPDU Guard、Root Guard、Loop Guard 針對不同 STP 異常。|BPDU Guard 保護 edge；Root Guard 防止非預期 root；Loop Guard 防止 BPDU 消失導致錯誤轉送。|BPDU Filter 可能削弱迴圈偵測，不等同 BPDU Guard。|PC 埠收到 BPDU 時可由 BPDU Guard 使其 err-disabled。|bpdu
voice-vlan|Voice VLAN|語音 VLAN|將電話與同埠電腦的語音、資料分離。|Data VLAN 與 voice VLAN 可不同，電話語音通常帶 tag。|設定 voice VLAN 不等於完成全部 QoS 與電話服務。|電腦經 IP phone 接入，data VLAN 10、voice VLAN 30。|voice
wlan-gui|WLAN Configuration|無線 LAN 設定|WLAN 將 SSID、VLAN、安全模式與啟用狀態組合。|確認 PSK、安全模式、client VLAN 與 DHCP。|看得到 SSID 不代表能成功完成驗證。|建立 LAB SSID，映射訪客 VLAN 並測試 WPA2-PSK。|cdp
management|Device Management|設備管理方式|透過 Console、SSH、HTTPS 或集中平台管理設備。|SSH/HTTPS 提供加密，RADIUS/TACACS+ 可支援 AAA。|Telnet/HTTP 無同等的傳輸加密。|先用 Console 初始化，再用 SSH 遠端管理。|ssh`;
export const connectivity=`
routing-table|Routing Table|路由表|保存可達前綴、路由來源、下一跳與介面。|常見代碼 C=connected、L=local、S=static、O=OSPF。|路由表決定網路路徑，ARP 表解決 L2 位址映射。|O 10.1.0.0/16 [110/20] 中 110 為 AD、20 為 metric。|route
static|Static Route|靜態路由|由管理員明確設定目的前綴與下一跳。|下一跳需可解析，相關介面與路徑需可用。|寫入設定不保證一定安裝到 routing table。|ip route 10.20.0.0 255.255.0.0 192.0.2.2。|static
default-route|Default Route|預設路由|沒有更具體匹配時使用的 /0 路由。|IPv4 是 0.0.0.0/0，IPv6 是 ::/0。|匹配的更長前綴會優先於 default route。|分公司將其他未知目的網路交給 ISP。|default
ipv4-routing|IPv4 Forwarding|IPv4 轉送|查目的 IP 路由，減少 TTL，重建 L2 frame。|下一跳 IP 與封包目的 IP 可不同。|一般轉送不會把目的 IP 改成下一跳 IP。|到 10.10.1.10 的封包經過 next hop 192.0.2.2。|route
ipv6-routing|IPv6 Routing|IPv6 路由|以 IPv6 prefix 與 next hop 決定方向。|使用 link-local 下一跳時通常需指定輸出介面。|IPv4 可路由不表示 ipv6 unicast-routing 已開啟。|ipv6 route 2001:db8:20::/64 Gi0/0 fe80::2。|ipv6route
ad|Administrative Distance|管理距離|對同一前綴的不同路由來源比較可信程度。|常見 connected 0、static 1、OSPF 110；越低越好。|不能用低 AD 的 /8 覆蓋轉送時匹配的 /24。|同一 /24 的 static 通常優於 OSPF。|route
metric|Metric|路由度量|路由協定評估路徑的成本值。|OSPF 使用 cost，相同協定中通常越低越優先。|不同協定的 metric 不能直接當成相同尺度比較。|兩條 OSPF 路徑 cost 10 與 20，選 10。|ospf
lpm|Longest Prefix Match|最長前綴匹配|從符合目的 IP 的已安裝路由選最長前綴。|先確認匹配，再選最大的 prefix length。|AD 主要影響同前綴路由安裝，不跨前綴取代 LPM。|10.1.2.3 符合 /8、/16、/24 時用符合的 /24。|route
ospf|OSPF|開放最短路徑優先|Link-state IGP，以鏈路狀態資料計算最佳路徑。|CCNA v1.1 聚焦 single-area OSPFv2，area 0 是骨幹。|Process ID 為本機用途，不必在所有鄰居相同。|R1 與 R2 在 area 0 交換各自 LAN 路由。|ospfconfig
ospf-neighbor|OSPF Neighbor|OSPF 鄰居|以 Hello 發現鄰居，相容條件下建立鄰接。|檢查 area、timer、驗證與網路參數。|Broadcast 網路中 DROTHER 間停在 2-Way 可能正常。|鄰接失敗先比對 Hello/Dead timer 與 area。|neighbor
router-id|OSPF Router ID|OSPF 路由器識別碼|32-bit 識別值，在 OSPF 網域內需唯一。|明確設定 router-id 可提高穩定性與可辨識性。|格式像 IPv4，不代表它必須是可達的介面 IP。|router-id 1.1.1.1 只設定識別值，不宣告該位址路由。|ospfconfig
dr-bdr|DR / BDR|指定與備援指定路由器|在 OSPF broadcast 網路減少所需鄰接數。|Priority 高者優先，平手比 Router ID；priority 0 不參選。|選舉不搶占，後加入的高 priority 不立即取代既有 DR。|三台 Ethernet 路由器選一台 DR、一台 BDR。|neighbor
fhrp|First Hop Redundancy|第一跳備援|多個路由器共用虛擬閘道，避免單一 gateway 故障。|主機使用虛擬 IP，切換時不必修改 gateway。|FHRP 不取代路由協定。|兩台路由器以 HSRP 提供同一虛擬 gateway。|route
floating|Floating Static Route|浮動靜態路由|設定較高 AD 的 static route 作備援。|較優的同前綴路由消失後，備援才會被安裝。|較高 AD 不會讓 static 永遠優先。|OSPF AD 110，備援 static 設 200。|floating`;
