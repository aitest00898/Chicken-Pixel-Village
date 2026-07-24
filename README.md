# 雞情像素村

《雞情像素村》是手機優先的家禽行情、雞舍營運、持股分潤與風險管理 App。介面採原創「瓦納迪斯風格（Vanadis Chronicle Style）」：以羊皮紙、水彩墨線、世界設定集與少量低解析像素人物呈現真實產業資料。資料層採離線優先設計：正式私人資料以 Firebase SQL Connect／Cloud SQL PostgreSQL 為 canonical source，iOS／Android 使用原生 SQLite 作離線副本與 outbox，Web 只保存可重建快取。

## 本機開始

需要 Node.js 22–26 與 pnpm 11。Cloud Functions 的部署 runtime 固定為 Node 22；一般 Web 開發可使用目前本機 Node 24。

```bash
pnpm install
pnpm dev
```

驗證：

```bash
pnpm verify
```

Firebase emulator（不連 production）：

```bash
pnpm firebase:emulators
```

目前完成度、已執行證據與原生 toolchain 缺口分別見 `docs/DEVELOPMENT_STATUS.md` 與 `docs/VERIFICATION.md`。

## 安全邊界

此 repository 已連接免費 Spark Firebase 開發專案，並包含 Firebase 公開用戶端設定；不包含服務帳戶、伺服器憑證、真實股東或財務資料，也不會自行部署、push 或建立付費 Cloud SQL。詳情見 `docs/SECURITY.md` 與 `docs/FIREBASE_SETUP.md`。

## Workspace

- `apps/mobile`：React、Vite、Capacitor App
- `packages/domain`：雞舍、持股、分潤、風險領域規則
- `packages/market-data`：農業部行情 adapter 與 deterministic 商人台詞
- `packages/sync`：outbox、revision、idempotency 與衝突規則
- `packages/ui`：共用編年史式 UI 與高可讀資料元件
- `firebase/sql-connect`：SQL Connect schema、connector、seed
- `firebase/functions`：行情代理與受控伺服器操作
