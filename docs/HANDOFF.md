# HANDOFF — stock-widget

（狀態檔唔係日誌；過程 → `git log -p docs/HANDOFF.md`。⚠️ repo 係 public：唔寫 key、admin 位、客戶帳號資料，嗰啲喺 Claude memory `project_mimi_axnx_ticker_change`／`reference_stock_widget_local_test`）

## 而家企喺邊
- 目標：客戶 IR 頁嘅 widget 顯示 AXNX（前 MIMI）正確股價；報價嗰批修正已經全部交付，live site 驗證過。
- Production 跟 `origin/main` 自動 deploy（Vercel，push 後約 1 分鐘）。冇工作在途。
- Live embed 仍然傳 `symbol: 'MIMI'`，靠 `src/utils/stockConfig.js` 個 alias 轉 AXNX —— 唔好拆。
- `stock-widget.js`／`.css` cache 5 分鐘（`vercel.json`），deploy 後唔使再改 embed 嘅 `?v=`。
- 檢查：`pnpm test`（node:test）、`pnpm lint`（0 error）、`pnpm build`（尾段 `scripts/check-entry-imports.js` 擋住「chunk import 主程式」→ load 兩次）。
- 本地測試唔好燒 quota：見 memory `reference_stock_widget_local_test`（用 prod Redis API build、embed 模擬頁）。

## 等 CK
- Alpha Vantage key rotate（新 key＋Vercel 改 Secret 類型）：CK 2026-11-26 叫 **on hold**，唔好主動催。要 2FA，只可以 CK 做。
- Vercel 冇用嘅 `VITE_FINNHUB_API_KEY` 刪唔刪（建議刪）。
- 客戶對 licensing（免費 AV key 只准非商業用途）嘅回覆：CK 已經講咗，結果未知。

## 已拍板・否決過（唔使再問）
- 只開 1M／3M／6M：10D 要 intraday、1Y+ 要 `outputsize=full`，免費 key 都攞唔到；AV 嘅 AXNX series 仲夾住 2024 年另一間公司嘅舊數據，重開 1Y+ 會顯示出嚟。
- 2026-10-22 reverse split 用 `SPLITS` 表喺前端 back-adjust（CK 批咗，報價包埋）；將來有新 split 要加一行。
- MIMI 時期嘅歷史唔駁埋（3M／6M 由 2026-10-13 開始，所以兩個睇落一樣）。
- Widget light theme 底色 `transparent`，跟 host 頁底色（CK 要求）。
- `StockChart` 一定要 static import：lazy chunk 會用冇 `?v` 嘅 URL import 主程式，令 widget 行兩次。
- AV key 只用 server 端 `ALPHA_VANTAGE_KEY`；任何 secret 唔准用 `VITE_` 開頭（Vite 會包入公開 bundle）。

## 下一步
1. 冇指定工作。CK 解除 key rotate 嘅 hold 之後：CK 喺 Vercel 換值＋改 Secret → redeploy → 用一個 Redis 冇 cache 嘅 symbol（唔好用 IBM，demo key 都通）驗證 `source: api`。
2. 已知小問題（未報價、未做）：Historical 標題永遠寫 `(Last 30 Days)`；報價卡 Shares `0`、MarketCap 等 `N/A`（免費 tier 冇數據）；表格 Change 係同當日開市比，報價卡係同前日收市比。
