# 驗證紀錄

## 2026-09-30 家教與章節補強

- 桌面原始 PDF 與匯入 manifest 的 SHA-256 一致。104 個主題的來源範圍、勘誤與核對限制見 `docs/content-audit.md`。
- 新增 104 份原理、四步流程、案例推導與回想問答；102 主題映射 PDF，AI／Terraform 2 主題列為官方補充。
- 新增 SVI、DHCP pool、Snooping binding 三個指令範例，CLI 共 46 個；修正 SSH 的 configure terminal 模式切換。
- `node --test tests/core.test.mjs tests/pdf.test.mjs tests/pdf-questions.test.mjs tests/lessons.test.mjs`：29 項全數通過。
- `python tests/learning_browser_test.py`：104 個章節與家教概念／圖解頁全數通過；DHCP 流程追蹤、CLI、回想答案、家教下一题、來源連結與勘誤通過；390／768 px 八個代表性主題的章節與七個家教步驟均無整頁水平溢出，無 JavaScript pageerror。
- 第一輪發現手機長 CLI 使 Grid 子元素超出頁面；加入 min-width:0 與 terminal 寬度限制後，手機測試與全部主題重跑均通過。
- `python tests/browser_test.py`：原有題庫、錯題、子網路、路由／ACL、考試、保存／匯出及桌機手機操作回歸通過。
- `python tests/pdf_browser_test.py`：閱讀器模式、頁碼、全文搜尋、書籤、重試與響應式回歸通過。
- `node scripts/build.mjs`：通過，dist 包含新的資料模組、共用教學元件與樣式。
- 已檢視 `artifacts/lesson-ipv6-desktop.png` 與 `artifacts/tutor-dhcp-mobile.png`；內容及版面可閱讀。
- 未在 Cisco 實機執行 CLI，也未把全書機器翻譯標示為逐句人工校對完成。

日期：2026-09-29。Node.js v24.21.0 / Windows / 本機 Edge。

## PDF 中文教材續作驗收
### 題庫擴充
- `data/pdf-questions.js` 新增 36 道原創延伸題，六大領域各 6 題，合併後共 177 題。原 104 個 concept ID 與 37 個 scenario ID 保留。
- 每題附來源章節／頁碼、正確與錯誤選項解析；來源章節關聯與題目文字唯一性檢查通過。
- 25／50／100 題共用抽題已驗證能選到 PDF 新題，維持領域最低配額、不重複抽題及計分正確。
- 核心、PDF 完整性與新增題庫測試共 25 項通過；新增題錯題快照及來源可匯出／匯入保存。
- 建置通過；原有瀏覽器回歸通過。新題為部分章節重點延伸，並非每章完整題庫。
- 額外核對：[Cisco OSPF 介面與選舉說明](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13689-17.html)、[Ansible Inventory 官方文件](https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_inventory.html)。

- 454 頁、66 章、17,785 個文字區塊已封裝；逐章 SHA-256、原生英文區塊、原頁圖片與 IPv4 位址保留檢查通過。
- 修正完整性測試將原文 `[OK]`、`[AD]` 誤認為翻譯占位符；現在只拒絕英文原文不存在的占位符。
- 封裝時保留 Cisco CLI 提示、`Destination filename [startup-config]?` 與 `Building configuration... [OK]`，並加入回歸檢查。
- 修正上下方跳頁表單重複 ID，改用 data attribute 委派事件；閱讀模式測試等待畫面完成更新。
- `node --test tests/core.test.mjs tests/pdf.test.mjs`：21 項全數通過。
- `python tests/pdf_browser_test.py`：章節／領域篩選、中英與原圖模式、已讀／書籤重載保存、跳頁、全文搜尋、教材關聯、無效網址、載入失敗重試與圖片／PDF MIME 通過；390／768／1512 px 無整頁水平溢出，無 JavaScript pageerror。
- `python tests/browser_test.py`：原有頁面、家教、題庫／錯題、IPv4／VLSM、路由／ACL、考試／倒數計時、匯出與資料保存回歸通過。
- `node scripts/build.mjs`：通過，dist 已包含 PDF 教材。
- PDF 截圖：`artifacts/pdf-library-desktop.png`、`pdf-reader-desktop.png`、`pdf-reader-mobile.png`。
- 翻譯仍標示為機器翻譯初稿；上述檢查不代表 454 頁均已逐句人工校對，OCR 圖表與翻譯語意仍應對照原頁。

## Phase 1 — 架構與教材
- 六大領域、104 個主題、108 個術語、43 個指令關聯完整。
- 所有 topic 有中英文、概念、重點、陷阱、案例與 command 關聯。
- 所有主要 route 在桌面 1512 px、手機 390 px 成功 render。

## Phase 2 — 題庫與錯題
- 共 141 題，7 種題型；選项 ID 唯一、正解有效、錯誤選項有解釋。
- 多選採完整集合比較，少選/多選錯誤，選取順序不影響結果。
- 多條件篩選、錯題保存、重載、答對後標記掌握均通過。

## Phase 3 — 網路練習器與工具
- IPv4 network/broadcast/mask/host/wildcard 跨 octet 與邊界檢查。
- /31、/32 計算核心採點對點/單一位址用途，UI 一般 LAN 隨機題只使用 /16～/30。
- VLSM 大小排序、對齊、不重疊、母網段容量不足檢查。
- 瀏覽器測試以 Python ipaddress 獨立計算答案，驗證一般 subnet 與 VLSM 全欄批改。
- 隨機路由題 100 組檢查 LPM；隨機 ACL 50 組檢查 action/protocol/wildcard。
- CLI 搜尋、複製及術語搜尋驗證。

## Phase 4 — 考試、保存與分析
- 25/50/100 題均唯一，六領域基礎配額符合權重。
- 第一輪发现 IP 連線題量不足，已補 8 道原創情境題，重新驗證通過。
- 25 題考試：作答 2 題正確、1 題錯誤，其餘未答；驗證總分 8%、逐題及領域結果。
- 考試進度重載保留；交卷後重載不重複累積紀錄。
- 100 題計時到期自動交卷，答案在交卷前不顯示。
- 章節完成、目標、統計、連續天數、JSON 匯出與 repository 匯入驗證。

## Phase 5 — 最終驗收
- `node scripts/build.mjs`：通過，輸出 dist 靜態檔案。
- `node --test tests/core.test.mjs`：18 項通過。
- `python tests/browser_test.py`：端到端通過，無 JavaScript pageerror。
- Desktop/mobile 各主要模組無整頁水平溢出；手機導覽可開啟與切換。
- 啟動腳本：以 5182 驗證冷啟動並關閉該測試程序，5181 重複啟動正確重用現有網站。
- 截圖：`artifacts/dashboard-desktop.png`、`dashboard-mobile.png`、`subnet-result.png`、`exam-result.png`。

测试在獨立、可拋棄瀏覽器 context 進行，不會把測試成績寫入使用者日常瀏覽器。未測試 Cisco 實體設備執行 CLI，也沒有把本站分數與官方考試分數作等同驗證。
