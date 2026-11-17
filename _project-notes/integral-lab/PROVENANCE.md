# 2026 全賽季題庫來源與核對紀錄

核對日期：2026-11-04（Asia/Hong_Kong）。本次已逐頁視覺核對官方 qualifier 題本／答案的 4 頁，以及四階段正賽的 98 頁，共 102 頁。

## 完整收錄範圍

| 階段 | 已公開使用題數 | 官方時限 | 官方 PDF |
|---|---:|---|---|
| Qualifier | 20 | 全卷20分鐘 | [題本](https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_test.pdf)／[答案](https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_answers.pdf) |
| Regular Season | 20 | 每題2分鐘 | [題目及答案](https://math.mit.edu/~yyao1/pdf/2026_regular_season.pdf) |
| Quarterfinals | 12，含1題加賽 | 每題3分鐘 | [題目及答案](https://math.mit.edu/~yyao1/pdf/2026_quarterfinal.pdf) |
| Semifinals | 9，含1題加賽 | 每題4分鐘 | [題目及答案](https://math.mit.edu/~yyao1/pdf/2026_semifinal.pdf) |
| Finals | 5 | 每題5分鐘 | [題目及答案](https://math.mit.edu/~yyao1/pdf/2026_finals.pdf) |

合計 **66道官方存檔題**，另保留4道明確分開標示的本站原創變式。官方索引明確說明正賽PDF只列實際使用的題目；本專案所稱「完整賽季」指這些公開使用題，不代表取得未公開備用題。

- [常規賽逐題頁碼、SHA-256與數學細節](docs/regular-season-provenance.md)
- [四分之一決賽逐題頁碼、SHA-256與數學細節](docs/quarterfinal-provenance.md)
- [準決賽及決賽逐題頁碼、SHA-256與數學細節](docs/semifinal-finals-provenance.md)

所有正式題均保留官方來源、原階段、場次、原題號、題面頁與答案頁。新題使用獨立ID，舊qualifier與原創題ID不變。中文提示、分步練習及推導皆為本站獨立編寫，不是MIT官方解說。

## 重要的答案處理

- Regular Season #1 的最終值超出浮點範圍；在安全解析後將固定的巨大指數項抽象成符號，只核對其餘精確代數關係，不作溢位的小數比較。
- Regular Season #5/#6/#8 及 Semifinal #2 Problem4 需要實數對數或反函數的分支說明。本站明示採用的實數域並另存官方答案形式，解鎖解答後可查閱兩者。
- Semifinal #1 Problem2 採用全實數連續的等價原函數；官方形式在0無定義，在各半軸與本站形式只差常數。
- 含無窮迭代、冪塔、floor、min/max、極限的題目，保留原運算順序並記錄適用分支或收斂條件。
- 正賽單人逐題演練使用官方時限，但不是官方對手、種子、比分及晉級流程的重現。

---

# Qualifier 題庫原始核對紀錄

核對日期：2026-11-04（Asia/Hong_Kong）。本專案為獨立的學習工具，不由 MIT 製作、認可或維護，也不代表官方比賽平台。MIT Integration Bee 題目與官方最終答案歸其原作者所有；本專案提供來源連結及署名，不聲稱官方題目採用開源授權。

## 官方來源

- 官方 archive：<https://math.mit.edu/~yyao1/integrationbee.html>
- 2026 Qualifying Exam 題本：<https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_test.pdf>
- 2026 Qualifying Exam Answers：<https://math.mit.edu/~yyao1/pdf/qualifying_round_2026_answers.pdf>

官方 archive 列明 qualifier 為 20 分鐘，2026 題本標示日期為 20 January 2026。本專案收錄該份試卷全部 20 題，並保留原題編號。第 1–10 題位於兩份 PDF 的第 1 頁，第 11–20 題位於第 2 頁。每筆題目均存有題本、答案 URL、頁碼、題號、核對日期。網站的單人 knockout 是訓練模式，與 MIT 當屆正式賽制不同。

## 核對方式

1. 從 MIT 官方 archive 進入題本與答案連結。
2. 下載兩份官方 PDF，將全部四頁渲染為圖片，逐題以視覺檢查指數、根號範圍、分母、上下限、巢狀結構與官方最終答案。
3. 轉錄所有 20 題及最終答案到 `dist/problems.js`。資料中不含掃描 PDF 的再分發；可從官方連結查閱原稿。
4. 漸進提示、選擇步驟、中文推導、錯誤回饋、技法分類、難度、估計訓練時間均為本專案新增的教學內容，不是 MIT 官方評語或官方評級。
5. 另外 4 題標為 `origin: original`，屬本網站原創練習，不應稱作 MIT archive 題目。

檔案 SHA-256（本次下載）：

- 題本：`b1a09084c3944f75a5eb3d374d1a4516a10e0167f7011d69618113d462d772a2`
- 答案：`52792e59557f32a40faec6eb361a31185cb5b352c07275279bff66ca1ad6f9c1`

## 重要的數學詮釋

- 所有 `log` 為自然對數。輸入可用 `log(...)` 或介面支援的 `ln(...)`。
- 不定積分官方答案省略 `+C`；訓練答案在適當連通定義域內按微分相等判斷，允許任意常數差異。
- 第 2 題使用負 x 的安全取樣點，避免 `exp(2026 exp(x))` 在一般正數樣本溢出。
- 第 3、15 題的花括號為小數部分；floor/ceiling 的整數端點不影響定積分。
- 第 5、14 題驗證採 x>1 與 x>0，避開根式端點的微分特例。
- 第 6 題 `cosh(x/2)>0`，因此平方根半角化簡不需要分段。
- 第 8 題幾何級數在 [0,1/2] 上一致收斂，因此可先求和或逐項積分。
- 第 12 題無限根式，對 x>0 的非負分支為 x+1。若由起始內層 0 的有限巢狀式取極限，x=0 的值為 0；這個單點差異不改變定積分 3/2，不能無條件宣稱整個閉區間逐點均等於 x+1。
- 第 16 題原式要求 `sin x ≠ 0` 且 `cos x ≠ 0`。根號內為 `cot^4 x`，所以平方根為 `cot^2 x`（因後者非負），不是 `cot x`。化簡後可以延伸到部分被原式排除的點，但不會因此擴大原題的定義域。
- 第 18 題依原式排除 x=0；第 19 題實數對數要求 x>e。
- 第 20 題精確保留三層 `cos²`（最內層 `cos² x` 及兩層 `cos²(πt/2)`）。

## 驗證的限制

符號引擎能驗證的形式取決於其化簡能力；有限取樣吻合只提供數值證據，不是所有實數的證明。題目的參考答案已與官方答案核對，但自動評分對複雜等價形式仍可能需要人工閱讀推導。定積分核對的是輸入數值或常數式與官方答案的等值性，不代表驗證了整個解題過程。

## 題庫擴展規則

新增 archive 題目必須重新閱讀該年的官方題本及答案，保留原題號、頁碼、兩個 URL、核對日期與域限制。無法確認來源的題目只能列入原創或待核對練習，不得標為已核對 MIT 題目。
