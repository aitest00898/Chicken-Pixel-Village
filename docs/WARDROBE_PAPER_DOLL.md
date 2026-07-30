# 人物紙娃娃／裝備穿戴顯示系統

## 唯讀調查摘要

- 角色資料：`packages/domain/src/fixtures.ts` 的 `avatarOptions`。
- 物品資料：`packages/domain/src/fixtures.ts` 的 `equipmentItems`，共 24 件。
- 基礎人物圖：`apps/mobile/public/assets/art/vanadis/character/avatars/{avatarId}-{full|chibi}.png`。
- 商品圖：`apps/mobile/public/assets/art/vanadis/equipment/original-atlas.png` 與 `apps/mobile/public/assets/art/vanadis/equipment/atlas.png`。
- 紙娃娃渲染：`apps/mobile/src/components/Sprites.tsx` 的 `ManagerAvatar`。
- 穿戴層解析：`packages/domain/src/wardrobe.ts` 的 `wearableLayerFileForStage(...)` 與 `wearableLayerFilesFor(...)`。
- 人物 × 裝備矩陣：`packages/domain/src/wardrobe.ts` 的 `wardrobeMatrixEntries(...)`。
- 矩陣輸出腳本：`pnpm wardrobe:export`，輸出到 `docs/generated/wardrobe-matrix.json` 與 `docs/generated/wardrobe-matrix.md`。
- 正式穿戴資產 QA：`pnpm wardrobe:qa-assets`，檢查正式 wearable PNG 是否為 `410x690`、RGBA、透明角落且沒有明顯綠幕殘邊；draft 檔預設不列入。
- 使用頁面：`apps/mobile/src/pages/ManagerPage.tsx`。
- 穿戴/脫下/切換角色：`apps/mobile/src/hooks/useVillageState.ts` 的 `equip` 與 `selectAvatar`。
- Firebase 持久化：`apps/mobile/src/services/visitProgress.ts`，Firestore `visit_progress/{uid}` 的 `equipped` 與 `avatarId`。
- 測試入口：`pnpm lint`、`pnpm typecheck`、`pnpm test:run`、`pnpm build`、`pnpm verify`。

## 根本原因

舊系統沒有「人物穿戴資產」概念。`ManagerAvatar` 直接讀 `equipmentItems`，再把 `EquipmentArt` 商品圖依 `slot-head`、`slot-body`、`slot-hand`、`slot-back` 的 CSS 位置疊到完整人物 PNG 上。資料層只有 `slot`，沒有 usage type、角色相容性、render stage、layerFiles、mask、pose variant 或 assetStatus。因此系統只能做貼圖，無法表達帽簷遮擋、外套替換原衣、背包前後層、手掌遮罩或手持姿勢。

## 架構決策

商品圖與穿戴圖分離：

- 商品圖：只用於行裝圖鑑、物品卡片與收藏展示。
- 穿戴圖：只由 `wearableAssetConfigs` 的 `layerFiles` 指向，用於人物紙娃娃。

缺少角色專用穿戴資產時：

- 不回退到商品圖。
- 不把其他角色的資產套用到目前角色。
- 不新增穿戴寫入。
- 若舊資料已保存，允許使用者點按移除，並顯示「已保存但暫無外觀」。
- 若 manifest 未來把資產標為 `ready`，測試會要求每個 layer file 實際存在於 `apps/mobile/public/assets/art/vanadis/equipment/wearable/`；不得指向商品 atlas。
- 若瀏覽器載入 ready layer 失敗，`ManagerAvatar` 會隱藏該失敗圖層，避免顯示破圖 icon；但該資產仍必須由測試與視覺驗證追查修正。
- 穿戴、脫下、slot 檢查、角色相容性、缺資產與互斥檢查集中於 domain 層 `changeEquippedItem(...)`，Firebase 寫入前必須先取得合法結果。

## Render stage

實作的語意順序位於 `packages/domain/src/wardrobe.ts`：

1. `character-back-effect`
2. `back-equipment`
3. `cape-back`
4. `backpack-back`
5. `base-character`
6. `body-variant`
7. `inner-clothing`
8. `torso-clothing`
9. `waist-equipment`
10. `front-straps`
11. `handheld-back`
12. `character-arm`
13. `hand-mask`
14. `handheld-main`
15. `handheld-front`
16. `neck-accessory`
17. `chest-accessory`
18. `head-equipment-back`
19. `character-hair-or-face`
20. `head-equipment-front`
21. `foreground-effect`

## 人物

| characterId | characterName | title | full asset | chibi asset |
|---|---|---|---|---|
| `caretaker-male` | 托爾・麥斯頓 | 契約農戶 | `caretaker-male-full.png` | `caretaker-male-chibi.png` |
| `caretaker-female` | 艾瑪・布魯克 | 契約農戶 | `caretaker-female-full.png` | `caretaker-female-chibi.png` |
| `manager-male` | 海登 | 村務經理 | `manager-male-full.png` | `manager-male-chibi.png` |
| `manager-female` | 艾琳 | 經營經理 | `manager-female-full.png` | `manager-female-chibi.png` |

## 物品重新分類

| itemId | itemName | usageType | slot | wearable | first-pass status | notes |
|---|---|---:|---|---:|---|---|
| `straw-hat` | 晨巡草帽 | wearable | head | yes | ready for `manager-male` | 海登專用戴帽層已接入；其他角色仍缺資產 |
| `work-jacket` | 霧綠工作外套 | pose-variant | body | yes | ready candidate for `manager-male` | 海登專用 body variant 已接入；保留原臉、姿勢與座標，仍需人工美術複核 |
| `feed-scoop` | 舊銅飼料勺 | handheld | hand | no | unsupported | 海登試作目標；需握持姿勢與手掌遮罩 |
| `field-pack` | 田野背包 | wearable | back | yes | missing | 海登試作目標；需 back + front straps |
| `granary-hat` | 穀倉織帽 | wearable | head | yes | missing | 需角色專用戴帽層 |
| `patrol-cap` | 墨藍巡查帽 | wearable | head | yes | missing | 需角色專用戴帽層 |
| `scholar-beret` | 羽筆學士帽 | wearable | head | yes | missing | 需角色專用戴帽層 |
| `weather-hood` | 風雨皮革兜帽 | pose-variant | head | yes | missing | 需頭髮/臉部遮罩 |
| `guild-circlet` | 舊金公會額環 | wearable | head | yes | missing | 需角色專用額環層 |
| `fog-work-coat` | 霧綠巡舍長衣 | pose-variant | body | yes | missing | 需 body variant |
| `ledger-vest` | 棕褐帳房背心 | wearable | body | yes | missing | 需 torso layer |
| `rain-mantle` | 灰藍雨巡披肩 | pose-variant | body | yes | missing | 需 cape back + front clasp |
| `hatchery-apron` | 孵化師亞麻圍裙 | wearable | body | yes | missing | 需 torso layer |
| `guild-coat` | 酒紅公會長衣 | pose-variant | body | yes | missing | 需 body variant |
| `brass-scoop` | 黃銅量穀勺 | handheld | hand | no | unsupported | 需握持姿勢與手掌遮罩 |
| `quill-ledger` | 羽筆巡查帳冊 | handheld | hand | no | unsupported | 可能與基礎帳冊重疊，需姿勢/手臂變體 |
| `inspection-lantern` | 夜巡提燈 | handheld | hand | no | unsupported | 需垂掛手勢 |
| `measuring-rod` | 木製丈量尺 | handheld | hand | no | unsupported | 需握持角度 |
| `market-scroll` | 商會行情卷 | handheld | hand | no | unsupported | 需替換或遮蔽既有帳冊 |
| `ledger-satchel` | 皮革帳冊袋 | wearable | back | yes | missing | 需 back + straps |
| `wheat-pack` | 麥穗補給架 | wearable | back | yes | missing | 需 back + straps |
| `guild-banner` | 折疊公會旗 | pose-variant | back | yes | missing | 需大型後層 |
| `tool-frame` | 繩索工具架 | wearable | back | yes | missing | 需 back + straps |
| `travel-cloak` | 灰藍旅行披風 | pose-variant | back | yes | missing | 需 cape back + front clasp |

## 人物 × 裝備矩陣規則

目前僅建立海登 first-pass 試作定義；但 4 位角色 × 24 件物品都已由 `wearableAssetConfigs` 表達狀態。

可程式檢查矩陣由 `wardrobeMatrixEntries(...)` 輸出，共 `4 × 24 = 96` 筆。每筆包含：

- `characterId`
- `characterName`
- `itemId`
- `itemName`
- `usageType`
- `slot`
- `wearable`
- `compatible`
- `requiredLayers`
- `requiresMask`
- `requiresBodyVariant`
- `requiresPoseVariant`
- `assetStatus`
- `implementationStatus`
- `visualVerificationStatus`
- `notes`

已輸出的人工交付檔：

- `docs/generated/wardrobe-matrix.json`：供自動化檢查、資產追蹤或後續工具讀取。
- `docs/generated/wardrobe-matrix.md`：供美術、人工驗收與開發追蹤閱讀；內含海登 first-pass 四項資產提示詞。

`apps/mobile/src/wardrobeMatrixExport.test.ts` 會檢查輸出 JSON 與 domain runtime matrix 完全一致。若 manifest 或角色/物品變更，必須重新執行 `pnpm wardrobe:export`。

- `manager-male` + `straw-hat`：compatible, requiredLayers=`main`, assetStatus=`ready`, implementationStatus=`art-ready`, visualVerificationStatus=`needs-review`。
- `manager-male` + `work-jacket`：compatible, requiredLayers=`bodyVariant`, requiresBodyVariant=yes, assetStatus=`ready`, implementationStatus=`art-ready`, visualVerificationStatus=`needs-review`。
- `manager-male` + `field-pack`：compatible, requiredLayers=`back/front`, requiresMask=no, assetStatus=`missing`, implementationStatus=`program-wired`, visualVerificationStatus=`not-ready`。
- `manager-male` + `feed-scoop`：compatible, usageType=`handheld`, wearable=no, requiresPoseVariant=yes, assetStatus=`unsupported`, implementationStatus=`blocked-by-art`, visualVerificationStatus=`not-ready`。
- 其餘 `manager-male` 物品：依物品分類 compatible，但 assetStatus=`missing` 或 `unsupported`，implementationStatus=`manifest-only`。
- `caretaker-male`、`caretaker-female`、`manager-female` 的所有物品：classification 已建立，但 first-pass compatible wearable asset 尚未完成；implementationStatus=`manifest-only`；visualVerificationStatus=`not-ready`。

不得將 `program-wired` 視為 `art-ready`。只有實際透明 layer 檔案存在且經視覺驗證後，才可把 assetStatus 改為 `ready`。

## 裝備互斥與保存規則

- 同一個 slot 仍由 `VisitProgress.equipped` 的 `Partial<Record<EquipmentSlot, string>>` 表達，因此同一欄位一次只能保存一件。
- `changeEquippedItem(...)` 會拒絕 itemId 與 slot 不一致的寫入，例如 body 裝備不能寫入 head 欄位。
- `changeEquippedItem(...)` 會拒絕缺少角色專用 ready 資產的裝備，避免錯誤狀態寫入 local cache 或 Firebase。
- `field-pack` 與 `travel-cloak`、`guild-banner`、`wheat-pack`、`ledger-satchel`、`tool-frame` 互斥，避免大型背部輪廓重疊。
- `rain-mantle` 與 `field-pack`、`ledger-satchel`、`wheat-pack`、`guild-banner`、`tool-frame` 互斥，因披肩會跨越前後層並遮擋肩線。
- `travel-cloak` 與 `field-pack`、`ledger-satchel`、`wheat-pack`、`guild-banner`、`tool-frame` 互斥，因披風與大型背部裝備共用背部輪廓。
- 手持物目前維持 `wearable=false` 且 `requiresPoseVariant=true`；未完成握持姿勢與手掌遮罩前不得寫入已穿戴。

## 圖片試作紀錄

2026-07-30 進行 `straw-hat` / `manager-male` / `head-equipment-front` 圖像生成試作，輸出檔位於 Codex 暫存：

- `/Users/joe/.codex/generated_images/019f91ed-26f9-7580-ba23-13a5475293fa/call_5Tboc9LrpLTvNRnLUZ4qR7kS.png`
- draft 去背圖層：`docs/generated/visual-checks/straw-hat-manager-male/head-equipment-front-draft.png`
- draft 合成檢查：`docs/generated/visual-checks/manager-male-straw-hat-draft-composite.png`
- 實際處理結果：draft 圖層已轉為 `410x690` RGBA PNG，但合成檢查可見帽緣綠色殘邊，且帽簷遮住眼部過多。
- 判定：不合格，不得接入正式資產，不得將 `assetStatus` 改為 `ready`。

同日第二輪以洋紅色鍵重新生成、縮放至海登頭部位置並逐版去邊；`v038` 通過資產 QA 與合成檢查，已提升為正式海登草帽穿戴層：

- 正式資產：`apps/mobile/public/assets/art/vanadis/equipment/wearable/straw-hat/manager-male/head-equipment-front.png`
- 合成驗證：`docs/generated/visual-checks/straw-hat-manager-male/manager-male-straw-hat-ready-composite.png`
- 判定：可接入第一階段試作，`straw-hat` 對 `manager-male` 改為 `assetStatus="ready"`。
- 已知限制：此資產仍是單一 `head-equipment-front` 前層，未拆出 `head-equipment-back`；帽冠與頭髮接觸處已可視為戴上，但若後續需要更精細的頭髮前後遮擋，應追加後層或頭髮遮罩。

同日嘗試以圖像生成建立 `work-jacket` body variant；全人物重繪候選可呈現外套，但臉部、比例與構圖漂移，不得接入正式資產。改採保守圖像編修方式：以 `manager-male-full.png` 為唯一人物基準，只重染上身外衣區域為霧綠並清理少量色鍵殘點，確保臉部、姿勢、手勢、帳冊、羽筆、靴子、畫布尺寸與座標維持一致。

- 正式資產：`apps/mobile/public/assets/art/vanadis/equipment/wearable/work-jacket/manager-male/body-variant.png`
- 單件驗證：`docs/generated/visual-checks/work-jacket-manager-male/manager-male-work-jacket-body-variant.png`
- 草帽合成驗證：`docs/generated/visual-checks/work-jacket-manager-male/manager-male-work-jacket-straw-hat-composite.png`
- 判定：可接入第一階段 body-variant 流程，`work-jacket` 對 `manager-male` 改為 `assetStatus="ready"`，但 `visualVerificationStatus` 維持 `needs-review`。
- 已知限制：此資產是保守重染 body variant，能證明「商品圖與穿戴圖分離、body-variant 替換、同畫布 0,0 對齊、草帽可疊加」流程；外套版型仍沿用海登原長外套輪廓，後續若要求更接近圖鑑短版工作外套，需由正式美術另繪同畫布 body variant。

可用檢查指令：

- `pnpm wardrobe:qa-assets`：只檢查正式 wearable 資產，應作為 ready 資產提交前的最低門檻。
- `node scripts/qa-wardrobe-assets.mjs --include-drafts`：包含 `apps/mobile/public/.../wearable/**/draft/*.png` 檢查；不合格 draft 應移到 `docs/generated/visual-checks/` 作為人工證據，不留在 app public 資產目錄。

## 海登 first-pass 資產編修提示詞

以下提示詞只能用於建立角色專用穿戴資產，不得輸出圖鑑展示圖。每個輸出都必須與 `apps/mobile/public/assets/art/vanadis/character/avatars/manager-male-full.png` 使用相同畫布、相同人物位置、透明背景、0,0 對齊。

### `straw-hat` / `manager-male` / `head-equipment-front`

以海登 `manager-male-full.png` 為姿勢與頭部角度基準，製作「晨巡草帽」戴在海登頭上的角色專用透明圖層。只輸出帽子與必要接觸陰影，不輸出人物身體、臉、背景、文字或展示底座。帽冠必須真正套住頭頂，帽簷依海登頭部透視自然彎曲，前帽簷略遮住額頭與上緣頭髮，接觸處有低彩度水彩陰影。保持瓦納迪斯風格、草編材質、灰藍布帶、細墨線與低飽和舊化。輸出完整 `410x690` 透明 PNG 畫布。

### `work-jacket` / `manager-male` / `body-variant`

以海登 `manager-male-full.png` 為身份、臉部、比例與站姿基準，製作「霧綠工作外套」body variant。輸出一張完整海登等身透明 PNG，但只允許改變身體服裝區域：保留原臉、頭髮、手勢、靴子位置、畫布位置與瓦納迪斯筆觸。工作外套必須真正穿在肩膀與手臂上，遮蔽原本外衣的衣領、袖口、前襟與下襬，不能出現雙重衣領、雙重袖口或原衣服穿插。外套為低彩度霧綠布料、舊皮革扣件、自然水彩陰影。輸出完整 `410x690` 透明 PNG 畫布。

### `field-pack` / `manager-male` / `backpack-back`

以海登 `manager-male-full.png` 為姿勢基準，製作「田野背包」後層透明圖層。只輸出位於人物身後的背包本體與必要陰影，不輸出胸前背帶、人物、背景、文字或展示底座。背包應貼合海登背部與肩線，被人物身體遮擋時仍以後層存在。材質為低彩度霧綠帆布、舊皮革、黃銅扣具、水彩墨線。輸出完整 `410x690` 透明 PNG 畫布。

### `field-pack` / `manager-male` / `front-straps`

以海登 `manager-male-full.png` 為姿勢基準，製作「田野背包」胸前背帶前層透明圖層。只輸出肩帶、胸帶、扣具與必要陰影，不輸出背包本體、人物、背景、文字或展示底座。背帶必須沿海登肩膀與胸口曲線自然下垂，不穿過手臂或帳冊；應位於人物身體與外套前方。輸出完整 `410x690` 透明 PNG 畫布。

### `feed-scoop` / `manager-male` / `pose-variant`

海登目前基礎姿勢左手持帳冊、右手持羽筆，不適合直接裝備飼料勺。需另製 `manager-male-feed-scoop-grip` pose variant：保留海登臉部、身高比例、瓦納迪斯風格與畫布位置，但右手改成自然握住舊銅飼料勺握柄；手掌或手指遮住握柄前緣，工具不得懸浮，不得穿過身體。若只產生飼料勺商品圖或未能保留角色辨識，該資產不得標記為 ready。
