# EXPLORE Homework

Bài tập về nhà cho chương trình EXPLORE (DOL English): ôn → luyện theo từng lesson (Vocabulary → Grammar → Let's Talk).
Nguồn sự thật / quyết định / changelog: `SOURCE_OF_TRUTH.md`.

## Chạy thử trên máy
```
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

## Đưa lên web (Dokploy)
1. Dockerfile tự dựng trang hoàn chỉnh (thêm phần head cho index.html); giọng đọc ở dạng file mp3.
2. Dokploy: tạo Application → nguồn GitHub (repo này) → Build type **Dockerfile** → port **80** → gắn domain `explore-homework.dol.vn` + HTTPS.
   Micro (bài nói) chỉ chạy trên HTTPS.
3. Mỗi lần push lên nhánh chính, Dokploy tự build lại (bật Auto Deploy).

## Thêm giọng đọc cho lesson mới
`node tools/collect-unit-lines.js <lessons>` → chạy Voice Pipeline (`tools/voice-pipeline.js`, trên Chrome) → `python3 tools/ingest-unit.py <kết quả>` → `python3 tools/pack-voice.py <lessons>`.
