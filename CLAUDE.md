# CLAUDE.md — EXPLORE Homework Web

Web bài tập về nhà cho chương trình EXPLORE (DOL English, HV 5–8 tuổi, nền Cambridge Starters).
Chủ dự án: **Thanh** — viết tiếng Việt, nội dung bài bằng tiếng Anh.

## Đọc trước khi làm
1. `HANDOVER.md` — đang ở đâu, việc kế tiếp, map Unit H.
2. `SOURCE_OF_TRUTH.md` — mọi quyết định đã chốt (#1–57), mốc, changelog. **File gốc duy nhất**: mọi thay đổi/kế hoạch ghi vào đây (mục Mốc + Changelog), không tạo nhiều file nhỏ.

## Cách làm việc với Thanh
- Việc phức tạp/sửa nhiều file: **đề xuất plan trước**, chờ Thanh gật rồi mới sửa ("discuss với mình trước khi sửa").
- Chia việc lớn thành checkpoint có mô tả rõ.
- Giải thích lựa chọn ngắn gọn; Thanh có thể sai — có bằng chứng thì nói thẳng.
- Có điểm mơ hồ thì nêu ra trước, không tự đoán.
- Sau mỗi đợt sửa lớn: **bảng recap cũ → mới**, và thêm dòng vào Changelog.
- Chỉ giao sản phẩm hoàn chỉnh, không chắp vá. Sửa giao diện xong phải tự kiểm tra bằng ảnh chụp (`tools/audit/`) ở nhiều cỡ màn (điện thoại dọc/ngang, iPad, laptop, Mac lớn) trước khi báo xong.

## Quy tắc an toàn
- Không bao giờ hỏi, nhập hay in mật khẩu / API key. Thanh tự đăng nhập Dokploy; key API Thanh tự gõ vào trang trong trình duyệt của Thanh.
- Không mở `~/Downloads/ELEVENLABS.env`.
- Tải file về máy Thanh phải được Thanh cho phép từng lần.

## Nguyên tắc nội dung (từ quy tắc soạn bài EXPLORE)
- Đáp án nhiễu lấy từ lỗi thật của HV, mỗi option sai chỉ khác **1** đặc điểm, ưu tiên 3 lựa chọn.
- HV không được làm xong mà không dùng kỹ năng đang luyện (bài nghe không lộ chữ, bài nhận diện dùng gương mặt mới).
- Mô hình đơn giản, phần tử nào không khớp thì loại; ngôn ngữ chỉ để tiếp xúc thì không chấm.
- Lesson 1 mỗi unit phải chơi được với HV mới (rolling intake).

## Kỹ thuật
- Không build step: `index.html` + `engine.js` + `types-rw.js` + `catalog.js` + `lessons/*.js`, ảnh/giọng ở `assets/`.
- Dockerfile + `deploy/nginx.conf` dựng site; `/preview/` là bản thử song song.
- Deploy: push `main` → bấm Deploy trên Dokploy (xem HANDOVER §4).
- Commit kèm dòng `Co-Authored-By: Claude <noreply@anthropic.com>`.
