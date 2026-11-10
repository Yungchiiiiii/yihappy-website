# 倚樂企業有限公司官網

`yihappy.com.tw` 的原始碼，部署在 GitHub Pages。

- `legacy-site/`：正式站。`index.html`（首頁）、`about.html`（關於倚樂）、`process.html`（服務流程）共用 `styles.css` 和 `app.jsx`（React + Babel，在瀏覽器編譯），另有 logo、favicon、robots、sitemap。push 到 `main` 就會部署這個資料夾。
- `legacy-site/media/art/`：線稿插圖，由 `tools/build-art.py` 產生（`python3 tools/build-art.py`）。
- `docs/01-audit.md`：舊站盤點與公司事實整理，寫新文案時參考。

- `legacy-site/media/`：首頁輪轉機實拍短片（靜音循環播放）與封面圖，由 iPhone HDR 原片轉成 SDR 後壓縮。

修改方式：沿用現有設計，只做小幅改動；先在本機預覽確認，再合併到 `main` 上線。
