# CCNA Lab · 網路學習工作室

版本：**1.0.2**。程式碼與完整教材可由本儲存庫下載，以 Node.js 20+ 執行 `npm start`；`npm test` 與 `npm run build` 不需安裝翻譯模型。此儲存庫版本不代表已啟用 GitHub Pages。

依桌面「新增資料夾/ccna.txt」建立的獨立本機學習網站。繁體中文 UI、Cisco 英文術語與 CLI，包含 6 大領域、104 個教材主題、177 道原創題目、46 個 CLI 範例及 108 個中英術語。題庫含 104 道觀念辨識題、37 道既有情境/應用題與 36 道 PDF 教材延伸題，另有隨機產生的練習器題目。新增題六大領域各 6 題，共用於練習、錯題本與 25／50／100 題模擬考。

本機網址：**http://localhost:5181**。使用獨立 port，不影響 WorkJournal 的 5180。

## 開啟網站

Windows 雙擊 `Start-CCNA.cmd`，會在背景啟動網站並開啟瀏覽器。若已啟動則重用現有 CCNA 程序。

也可於此目錄執行：

```powershell
node server.mjs
# 或
npm start
```

Node.js 20+；沒有執行期第三方套件，不需要 npm install。所有 UI、教材與圖示均由本機提供，無外部 CDN。瀏覽器需啟用 JavaScript。以命令列啟動時 Ctrl+C 可結束；背景腳本記錄 PID 於 `artifacts/server.pid`，關閉電腦後需再次啟動。

如要使用其他 port：`./Start-CCNA.ps1 -Port 5182`。LocalStorage 以網域與 port 區分，因此固定使用 localhost:5181 可保留一致的紀錄；不同瀏覽器與 127.0.0.1 不共享紀錄。

## 功能

- PDF 中文教材：Jeremy’s IT Lab 2024 筆記共 454 頁、66 章，提供繁體中文自動翻譯初稿、中英對照、原頁圖片、全文搜尋、領域篩選、跳頁、書籤與已讀紀錄。入口為 `http://localhost:5181/#pdf`；翻譯尚未逐句人工校對，OCR 圖表文字請搭配原頁核對。
- PDF 閱讀紀錄包含於既有 JSON 備份；教材頁與全站搜尋可連到相關 PDF 章節。

- Dashboard：今日/累積題數、正確率、待複習錯題、連續學習天數、最近主題與各領域表現。
- 架構導覽及章節學習：中英名稱、概念、考點、陷阱、案例、CLI 與小測驗。
- 家教：概念 → 圖解 → 範例 → CLI → 常見錯誤 → 考點 → 小測驗。這是編寫好的分步教材，不是連接 AI 模型的問答服務。
- 家教與章節共用 104 份擴充教材：原理、各自的四步流程、案例推導、自我檢核及來源。102 主題有 PDF 對照，AI／Terraform 明列官方補充；原書勘誤在相關課程顯示。家教小測驗可接續下一題。
- 題庫：依領域、主題、難度、題型篩選；單選、多選、是非、CLI、子網路、路由表、情境題。多選須答案集合完全相同才計分。
- 錯題本：保存選擇、正解、次數、時間；答對重練後標記已掌握，保留歷史。
- Subnetting：初級 /24～/30，中級 /16～/23 跨 octet，進階 VLSM；逐欄批改、計算步驟。VLSM 依題目指定由大至小從母網段起點連續配置，不接受任意其他有效布局。
- 路由練習：隨機路由與目的 IP，依已安裝路由做 LPM，解析 prefix、AD、metric、next hop。
- ACL 練習：隨機需求與候選條目，解析 action、protocol、source、destination、wildcard、port。這是規則辨識練習，非完整 IOS 模擬器。
- CLI 指令庫：設備/功能/文字篩選，可複製指令而不含提示字元和輸出；附版本及上下文說明。個別配置片段不一定是完整 lab 配置。
- 術語及全站搜尋：教材、CLI、題目、術語分類結果。
- 模擬考：25/50/100 題、不重複抽題，依六域權重配置基礎名額後補餘數。計時 30/60/120 分鐘，答案自動保存；交卷或到時才公開解析，未答題算錯。
- 進度及成績：完成章節、每日目標、領域正確率、近 14 天答題數、弱項及考試歷史。
- 紀錄：LocalStorage 保存，進度頁可匯出/匯入 JSON。清除網站資料前請備份，匯入會取代目前紀錄。未加入帳號、雲端同步或資料庫。

## 教材範圍

以 **2026-09-29 查閱的 Cisco CCNA 200-301 v1.1** 為範圍，加入文件要求的延伸基礎，例如 OSI、XML/YAML。v1.1 更新內容包含 AI/ML、Terraform、STP 防護。教材為原創簡明教學，不是官方教材全文或考古題，不能替代完整實驗與實機練習。

- [Cisco v1.1 官方考綱](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf)
- [Cisco 更新公告：新版考試 2027-02-03 上線](https://blogs.cisco.com/learning/ai-updates-ccna-ccie-automation)
- [Cisco IOS XE VLAN routing](https://www.cisco.com/c/en/us/td/docs/routers/ios/config/17-x/lan-wan/b-lan-wan/m_lnsw-conf-vlan-ieee.html)

章節內也可查看來源與版本。模擬分數為本站練習正確率，不等同官方考試成績、不保證通過。

## Folder Structure / 新增檔案

```text
ccna/
  index.html                 網頁入口
  favicon.svg                自製圖示
  package.json               build / start / test 指令
  server.mjs                 僅綁定 127.0.0.1 的靜態伺服器
  Start-CCNA.ps1              Windows 背景啟動與健康檢查
  Start-CCNA.cmd              雙擊啟動入口
  .gitignore
  data/
    catalog.js               領域、主題、術語、來源整合
    fundamentals.js          網路基礎教材
    networking.js            存取與 IP 連線教材
    services.js              服務、安全、自動化教材及 port 資訊
    commands.js              CLI 資料
    questions.js             結構化題庫
  src/
    app.js                   頁面路由、互動與 orchestration
    ui.js                    共用 Card、Terminal、Topology、解析、圖表
    styles.css               桌面與手機版樣式
    core/
      engine.js              共用抽題、篩選、批改、計分
      network.js             IPv4/VLSM、路由及 ACL 產生器
      store.js               學習紀錄 repository 與統計
  scripts/build.mjs          語法檢查及靜態打包
  tests/
    core.test.mjs            資料完整性與演算法測試
    browser_test.py          Edge 端到端與響應式測試
  docs/
    architecture.md          架構與分階段規劃
    validation.md            驗證結果
  dist/                      build 產物（不納入版本控制）
  artifacts/                 測試截圖、日誌、驗證工具
```

原專案為空資料夾，以上均為新增；未修改 WorkJournal 或桌面的原始需求文件。

## Data Model

`Domain`：id、name、en、weight、color、icon、description。

`Topic`：id、domain、en、name、concept、key、trap、example、commands、order、difficulty、minutes、tags、diagram。以資料列保存，由 catalog 正規化。

`Question`：id、domain、topic、difficulty、questionType、question、options (`{id,text}`)、correctAnswer (`string[]`)、explanation、wrongAnswerExplanation (`optionId → 理由`)、commands (`commandId[]`)、tags。路由題可另附 routes / destination。

`Command`：id、device、category、command、purpose、example、interpretation、version。

`LearningState`：version、history、wrong、completed、recentTopic、exams、activeExam、settings。歷史紀錄含 domain/topic、選擇、結果、模式、ISO 時間及當地日期。錯題儲存題目快照，因此隨機題也可以重練。

## Question Engine 與主要元件

`engine.js` 負責 Fisher–Yates 洗牌、條件交集篩選、答案集合比較、考試抽題與總分/領域結果。`app.js` 只組合相同引擎與 repository，不為每個頁面重寫計分。

`ui.js` 的 `questionCard` / `answerExplanation` 同時供章節、練習器、錯題與考試解析使用；`terminal` 提供指令範例；`domainBars` 繪出真實答題率。`learning-ui.js` 將 `data/lessons.js` 的主題教材同時呈現在家教與章節頁；`lessonDiagram` 依各主題提供四步流程，`lessonSources` 顯示 PDF 與官方參考。Hash routing 支援直達主題與篩選。

完整內容核對範圍、原書勘誤與 104 主題頁碼表見 [docs/content-audit.md](docs/content-audit.md)。新增教材時，在 `data/lessons-fundamentals.js`、`lessons-networking.js` 或 `lessons-services.js` 加入同一 topic ID 的原理、四步流程、案例、問題與答案；維持欄位內不含分隔符號 `|`，步驟使用 `~` 分隔。概念型主題不強配無關 Cisco CLI。

`store.js` 使用 `createRepository(storage)` 注入儲存介面，未來可增加 API adapter。資料毀損或 quota 不足會顯示警告，避免假稱保存成功。跨裝置/多分頁同時寫入的衝突合併不在本機第一版範圍。

## 如何新增題目

PDF 延伸題集中在 `data/pdf-questions.js`，由 `data/questions.js` 合併至共用題池。使用固定 `pdf-*` ID，不影響既有 `concept-*` 或 `scenario-*` 紀錄。每題含 PDF 章節與頁碼來源，以及逐選項解析。新增列時請使用新的固定 ID；不要更改已發布題目的 ID。現有 36 題為教材重點改寫的原創練習，並非全書每章皆已出題。

在 `data/questions.js` 的情境資料加入一筆：

```js
['vlan', 'Single Choice', '不同 VLAN 的主機要互通，需要什麼功能？',
 ['L3 路由', '只更改 MAC'], [0],
 'VLAN 分隔 L2 廣播網域，跨 VLAN 需路由。',
 ['L3 可連接不同網路。', '更改 MAC 不會建立路由。']]
```

陣列順序為 topic、type、question、options、正解索引陣列、解析、各選項解釋。最後追加而非插入既有題目前方，以維持已保存 `scenario-*` ID；正式擴充可改用顯式永久 ID。每筆題目必須有唯一 ID、正確 topic/command 關聯與所有錯誤選項解析。新增後執行 `npm test`。

## 如何新增 Topic

在對應教材檔加入一列（內容不得包含未跳脫的 `|` 或實際換行）：

```text
topic-id|English Name|中文名稱|基本概念|考點|常見陷阱|實際案例|command-id
```

catalog 會整合為 Topic、術語、架構節點，questions 會產生對應觀念辨識小測驗。請另外撰寫情境題，維持教材與應用題品質；新增領域需同步更新 domains 及權重。

## 如何新增 CLI

在 `data/commands.js` 加一列：id、device、category、command、purpose、example、interpretation。使用真實平台語法並註明需先設定的條件；範例以 `R1#` 或 `SW1(config)#` 等前綴區分命令與輸出。將 Topic 的 command-id 指向新增 ID。

## Build / Test

PDF 資料位於 `data/pdf/`；章節與補充說明為 `data/pdf-catalog.js`，已校對翻譯為 `data/pdf-reviewed.js`，閱讀器為 `src/pdf-library.js`。`scripts/package-pdf.mjs` 從本機 `artifacts/pdf-import/translated.json` 重新封裝章節、搜尋索引與雜湊清單，需要既有 OpenCC 工具。一般啟動網站不需要翻譯工具。

`npm test` 同時包含核心與 PDF 完整性測試；`tests/fixtures/pdf-native-sha256.json` 保存原始英文頁面的校驗基準，因此 GitHub 下載版本不需本機匯入暫存資料即可測試。只有重新建立此基準時才需要原始 `artifacts/pdf-import/source.json`。啟動網站後可執行 `python tests/pdf_browser_test.py` 驗證閱讀器（使用與原有瀏覽器測試相同的 Playwright 環境）。

`python tests/learning_browser_test.py` 驗證全部家教／章節與代表性手機、平板頁面；`node scripts/audit-lessons.mjs` 核對來源 PDF 雜湊並重建教材對照報告，可另傳原始 PDF 路徑作為參數。

```powershell
npm run build
npm test
# 瀏覽器測試使用已安裝 Edge，需 Playwright（僅開發驗證用）：
python -m pip install --target artifacts/python playwright
python tests/browser_test.py
```

`build` 輸出 `dist/`，可由靜態網站伺服器託管。本次只建立本機網站，沒有建立線上主機或付費服務。測試使用獨立瀏覽器 context，不更動日常瀏覽器的學習紀錄。更多驗證結果見 `docs/validation.md`。
