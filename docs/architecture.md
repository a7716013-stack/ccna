# CCNA Lab 架構

專案原為空資料夾，獨立於 WorkJournal。採原生 ES modules / CSS / Node.js 靜態伺服器，無執行期第三方套件、無外部 CDN。

## 資料與畫面
- data/lessons.js：整合三份 lessons-* 原創擴充資料，依 topic 建立流程、案例、回想題、CLI 適用性與來源／勘誤關聯。
- src/learning-ui.js / learning.css：家教與章節共用的教材呈現與響應式四步圖解；概念型主題使用相應驗證方式。
- data/catalog.js：Domain / Topic；每個主題有中英文、概念、重點、陷阱、案例及 CLI 關聯。
- data/questions.js：獨立題庫與標準 Question model。
- data/commands.js：CLI 指令、用途、模式、範例與版本提示。
- src/core/engine.js：篩選、抽題、答案核對與計分。
- src/core/network.js：IPv4、VLSM、路由與 ACL 題目產生。
- src/core/store.js：LocalStorage repository；未來可替換 API adapter。
- src/app.js：Hash routing、共用題目與解析元件、頁面及互動。
- src/styles.css：響應式 Sidebar / Topbar / Main / Progress panel。

## 頁面
PDF 閱讀器沿用 Hash routing 與 LocalStorage repository。`data/pdf-catalog.js` 定義 66 章、領域與 topic 關聯；`data/pdf/chapters/` 按章延遲載入，`data/pdf/search.json` 在全文搜尋時載入。原 PDF 與 454 張頁面圖片保存在 `data/pdf/`。`src/pdf-library.js` 負責三種閱讀模式、重試、跳頁、書籤與已讀操作。

Dashboard、架構導覽、章節學習、逐步家教、題庫、錯題本、Subnetting、Routing、ACL、CLI、Glossary、Mock Exam、Progress、Analysis、Search。

## 實作順序
1. Layout、教材與架構導覽；建置及資料檢查。
2. 共用答題引擎、練習與錯題保存；引擎測試。
3. Subnetting / VLSM、路由、ACL、CLI、術語；邊界案例測試。
4. 考試、進度與分析；持久化與計分測試。
5. 搜尋、響應式版面、瀏覽器操作與重載驗證。

教材依 2026-09-29 查閱之 Cisco 200-301 v1.1 範圍整理，加入文件指定的延伸基礎概念；不採用官方考古題。參考網站只作資訊架構參考，不複製程式或教材。家教為預先編寫的分步教學，不依賴 AI API。
