# HANDOVER — EXPLORE Homework Web (bàn giao sang Claude Code, 2026-11-24)

> Đọc file này trước, rồi `SOURCE_OF_TRUTH.md` (quyết định #1–57, mốc, changelog).
> Repo này là **nguồn duy nhất**. Thư mục `explore-hw` trên máy cloud cũ không còn dùng.

## 1. Đang ở đâu

| Mục | Trạng thái |
|---|---|
| Site chính `explore-homework.dol.vn` | Unit I (I1–I5), giao diện v3 + phần thưởng (dấu chặng, chọn xe, con phố, hộ chiếu) |
| `/preview/` | Giao diện v4 + v5 (tỉ lệ Duolingo ABC) — **Thanh đã duyệt**. Chưa đưa lên trang chính |
| Unit H | Map đã chốt (mục 3), slide đã tải về máy, **chưa viết code** |

## 2. Việc kế tiếp (theo thứ tự)

1. **Tách hình Unit H** từ `~/Downloads/explore-unit-h/`:
   - `Lesson 1 - ppt.pptx`, `Lesson 2 - ppt.pptx`, `Lesson 3 - ppt.pptx` (Canva, 89/103/94 trang) → giải nén, lấy `ppt/media/*`.
   - `Explore 2 - Unit H - Lesson 4 - Lost and Found.html`, `… Lesson 5 - Integrated Revision.html` → hình nhúng base64.
   - Làm contact sheet, đặt tên theo `assets/h1/img/…` như Unit I.
2. **Viết `lessons/h1.js … h5.js` + mục Unit H trong `catalog.js`** theo map mục 3 (xem `lessons/i1.js` làm mẫu).
3. **Image Pipeline** cho phần thiếu: nền roadmap không người (`bg-unit`, `bg-h1…h5`), 20 món thưởng chủ đề Clothes, logo unit. Công cụ: `tools/studio/`.
4. **Voice Pipeline** (giọng Kim + nhân vật) — `tools/voice-pipeline.js`, `tools/collect-unit-lines.js`, `tools/pack-voice.py`.
5. **Kiểm tra** 9–10 cỡ màn bằng `tools/audit/` (mục 5).
6. **Cùng đợt deploy:** đưa v4+v5 từ `preview/` lên trang chính (copy `preview/index.html`, `preview/engine.js` ra gốc; giữ hoặc bỏ /preview/ tuỳ Thanh).
7. Ghi số token + thời gian thật của Unit H để ước lượng các unit còn lại (ước cũ: ~1.5–2.5M token, ~1 ngày/unit).

## 3. Map Unit H (Thanh đã duyệt "1. ok")

Nhân vật: **Alex, Matt, Jill, Grace, Manny**; Kim dẫn chuyện.
Luật chung: màu chỉ **red, blue, green, yellow, pink, black** (không white, không orange) · *holding* chỉ đi với accessories · 1 tính từ / 1 danh từ · không dùng beautiful/ugly/new/old.

| Lesson | Khối | Bài |
|---|---|---|
| **H1 (L&S)** — Dress-up Box | Vocab | Nghe & chọn (đáp án nhiễu dễ nhầm); Say it |
| | Grammar | He's / She's / I'm wearing — nghe ✓/✗; nhìn & nói |
| | FL | What is he/she wearing? — nghe & kéo tên vào bạn (gương mặt MỚI); trả lời Kim |
| **H2 (R&W)** — màu sắc | Vocab | Đọc từ → chọn hình; điền chữ thiếu; xếp vào "a ___" / "___s" |
| | Grammar | Ráp câu "She's wearing a red skirt"; Look & Read ✓/✗ |
| | FL | Đọc câu hỏi → chọn câu trả lời |
| **H3 (L&S)** — cửa hàng Manny, bộ từ 2 | Vocab | Bong bóng; Say it |
| | Grammar | wearing vs holding; chọn hình; nói |
| | FL | Is he/she wearing…? — Yes/No chọn; Race home |
| **H4 (R&W)** — Lost and Found, clean/dirty | Vocab | Chọn; đánh vần; ghép nửa từ |
| | Grammar | Ráp câu; Look & Read Yes/No |
| | FL | (không có FL mới) |
| **H5 (tổng hợp)** | Vocab | Xếp Clothes / Accessories; chọn cụm từ |
| | Grammar | "and"; điền từ (tối đa ~3 câu/trang); ráp câu |
| | FL | What / Is trộn; trả lời |

Chi tiết sư phạm Unit H: Project doc `claude/unit-H-handover.md` (trong Project EXPLORE trên claude.ai) + Google Sheet **WHW EXPLORE**, tab H1–H5.

## 4. Deploy

- Push: `git push origin main` (remote GitHub `thanhtran-commits/explore-hw`). Dokploy **chưa** có webhook → phải bấm Deploy tay.
- Dokploy: admin.dol.vn → project EXPLORE homework → app → **Deploy** → Confirm, chờ ~70 s. Nếu ra trang đăng nhập: **Thanh tự đăng nhập** (Claude không nhập mật khẩu).
- Kiểm tra: mở site, console `window.EXPLORE_BUILD` = build mới.
- Cloudflare cache cả URL `.js` trần (kể cả 404) → trang luôn gọi `?v=<build>` (Dockerfile tự gắn).

## 5. Kiểm tra bố cục

```bash
python3 tools/audit/serve.py .        # phục vụ thư mục ở 127.0.0.1:8766 (cần tham số thư mục)
node tools/audit/run5.js all          # chụp + soát lỗi mọi bước ở các cỡ màn, ảnh ra tools/audit/shots
node tools/audit/run5.js i1 phone,mac # chỉ 1 lesson, vài cỡ màn
```
- Cần `playwright` (Node). Sau khi đổi trang: luôn goto + reload + bấm START (`cap.js`, `eye.js` làm sẵn).
- Lối tắt test phần thưởng: ☰ → Demo, `#reward-test`, `#passport`, `#passport-i`.

## 6. Pipeline giọng & hình (chạy trong Chrome của Thanh)

- **Key API** (Gemini, ElevenLabs): Thanh tự gõ vào trang của chính Thanh; chỉ dùng trong JS của trang, **không bao giờ in ra hay hỏi trong chat**. Không mở `~/Downloads/ELEVENLABS.env`.
- Image: `gemini-3-pro-image-preview`, ảnh mẫu lấy từ raw.githubusercontent của repo; chấm bằng `gemini-flash-latest` (2.5-flash đã ngừng). File tự tải về `~/Downloads/` → gom vào `~/Downloads/explore-pipeline/` → đổi webp vào `assets/…`.
- Voice: tạo + chỉnh tốc độ ~3.45 âm tiết/s + model kiểm tra phát âm, tạo lại câu lỗi.

## 7. Câu hỏi còn treo (hỏi Thanh)

1. Giữ màu viền/khối be ấm của v4 (`#E6E0D4` / `#F3EEE4`) hay về xám?
2. Giữ hay bỏ icon bữa ăn trên trời ở I5?
3. Lỗi nhỏ còn lại của v5: hình Tom's day chỉ cao ~20% trên laptop; Lift the lid có khoảng trống cạnh loa trên laptop.
4. Race home: câu mở "Read the question" + thu lại câu đó.
5. Tranh cảnh dọc cho điện thoại; 4 game cốt truyện cho Unit I; webhook GitHub → Dokploy (cần Thanh cho phép).
