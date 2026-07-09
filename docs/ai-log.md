# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有對話，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助分析原始資訊。
- AI 協助找出不能判斷處。
- AI 協助判斷哪些資訊不能直接相信。
- AI 協助判斷哪些資訊不能直接變成任務。
- AI 協助修改畫面標示或前端工作台。
- AI 可能補了原文沒有的資訊。
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實

## 不需要記錄

- 不需要逐字貼完整對話
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間 | 階段 | 任務 | AI / Agent 建議 | 採用 / 拒絕 | 人類判斷理由 | 相關檔案 / commit |
| ---- | ---- | ---- | --------------- | ----------- | ------------ | ----------------- |
|      |      |      |                 |             |              |                   |

| 10:00 | Phase 0 | 初步整理與標註草稿 | Agent 草擬 `docs/phase0-observations.md`、彙整 `src/fixtures/phase-0/messy-reports.json` 的重點樣本，並建議在 UI 上標註 `needs_review` / `verify:location` / `sensitive` 標籤；同時執行專案格式化、測試與啟動開發伺服器以便展示。 | 採用（部分） | 採用：自動化檢查（format/test/build）與草稿觀察；拒絕：不自動把社群或二手資訊標為 verified，需要人工確認且注意隱私處理。 | `docs/phase0-observations.md`, `src/fixtures/phase-0/messy-reports.json` |
| 11:38 | Phase 0 | 新增工作台刪除按鈕 | Agent 建議在 `整理工作台` 每筆原始資訊旁新增「刪除」按鈕，讓使用者能直接移除不需要的紀錄。 | 採用 | 採用：符合使用者需求與 UI 優化，並避免保留不必要資料。 | `src/app/App.tsx`, `src/features/phase-0/Phase0Workbench.tsx` |
| 14:20 | Phase 0 | 啟用 persona sub-agent 模擬使用者訪談 | Agent 建議根據 `release-packs/01-interview-kit/docs/personas/*.md` 的三個 persona，針對目前 prototype 提供使用者回饋，並整理成 `release-packs/01-interview-kit/docs/interview-notes.md`。 | 採用 | 採用：這是課程要求的使用者訪談模擬，且能讓我們更早看見不同角色對介面的關注點；人類仍保留最後修訂權，並補上不應被視為正式需求的提醒。 | `release-packs/01-interview-kit/docs/interview-notes.md`, `docs/ai-log.md` |
| 15:10 | Release 02 | 建立流程設計草稿 | Agent 建議把原始資訊、人工確認、候選結果與判斷紀錄整理成 Mermaid flowchart，並加入「暫不採用」分支，避免未確認內容被直接視為任務。 | 採用 | 採用：這個流程把「資訊是否足夠」與「是否可成為任務」拆開，並保留人工確認與判斷理由紀錄，符合流程設計要求。 | `release-packs/02-flow-design-kit/docs/flow.md` |
| 16:20 | v1 | 依 `flow.md` 實作 `/v1/` 前端 | Agent 建議新增 v1 行動前資訊檢查工作台，將 Phase 0 原始資訊依來源保留、欄位檢查、衝突檢查、人工確認與判斷紀錄呈現，並從首頁連到 `/v1/`。 | 採用（需人工再檢查） | 採用：符合「未確認內容不能直接變成任務」的流程設計；仍需人類檢查每筆資訊是否真的足夠形成候選結果，AI 不負責救災判斷。 | `src/app/App.tsx`, `src/features/v1/V1FlowWorkbench.tsx`, `src/styles/global.css` |

## 範例

| 時間  | 階段    | 任務         | AI / Agent 建議                        | 採用 / 拒絕 | 人類判斷理由                              | 相關檔案 / commit             |
| ----- | ------- | ------------ | -------------------------------------- | ----------- | ----------------------------------------- | ----------------------------- |
| 09:45 | Phase 0 | 分析原始資訊 | 建議把社群貼文直接轉成 verified report | 拒絕        | 社群貼文來源未確認，應保持 `needs_review` | `docs/phase0-observations.md` |

## 課後反思

### AI 幫助最大的地方

-

### AI 最容易誤導的地方

-

### 下次使用 AI 開發前，我們會先準備

### 本次簡短採用記錄

- Agent 執行：格式化、測試、建置檢查、啟動 dev server（供展示）。
- Agent 產出：`docs/phase0-observations.md` 草稿、`messy-reports` 摘要與需人工確認樣本清單。
- 人類採用決策：接受草稿作為內部觀察草案，保留 `needs_review` 標記，不將任何未驗證資訊標為已確認。

-
