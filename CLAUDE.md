<!-- claude-project-class: production -->
@docs/HANDOFF.md

# stock-widget

⚠️ Repo 係 public：唔准 commit key、token、客戶後台位或帳號資料。

- ⚠️ **任何 secret 唔准用 `VITE_` 開頭（Vercel env 都唔得）。** 症狀：key 出現喺 `stock-widget.js`。點解：Vite 會將有用到嘅 `VITE_*` 直接寫入前端 bundle。Server 端讀 `ALPHA_VANTAGE_KEY`。
- ⚠️ **唔好拆 `resolveSymbol` 嘅 `MIMI → AXNX` alias。** 症狀：widget 停喺 2026-10-12。點解：客戶 WordPress embed 仲傳 `symbol: 'MIMI'`。
- ⚠️ **Redis cache miss 先會用 Alpha Vantage quota（免費每日 25 次）。** 試新 symbol／endpoint 每個用 1 次；唔好 call 10D／1Y／5Y／ALL 嗰啲 premium endpoint，失敗唔會 cache，次次都再 call。
