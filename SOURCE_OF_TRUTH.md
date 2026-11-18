# EXPLORE Homework Web — Source of Truth
*Bản gốc cho app homework EXPLORE. Mọi quyết định / thay đổi ghi vào đây, kèm ngày.*
*Tạo: 2026-11-09 · Cập nhật: 2026-11-09 (CP4a — khối Grammar xong).*

---

## 1. Mục tiêu
Web homework dẫn HV đi từ **ôn tập → luyện tập** cho 3 phạm vi ngôn ngữ của mỗi lesson: **Vocab → Grammar → Functional Language**. Thời lượng 15–20 phút/lesson. **Thay thế** phần Homework trong DLP.

## 2. Quyết định đã chốt
| # | Điểm | Quyết định | Ngày |
|---|---|---|---|
| 1 | Thiết bị | Điện thoại + tablet + máy tính → responsive, nút to cho ngón tay | 11-09 |
| 2 | Lưu kết quả | Firebase — gắn sau. Prototype dùng lớp `Store` (localStorage) để thay bằng Firebase | 11-09 |
| 3 | Mascot dẫn dắt | Kim (girl, yellow shirt, pigtails), đứng góc màn hình suốt bài, bấm Kim = nghe lại hướng dẫn | 11-09 |
| 4 | Audio | ElevenLabs. Bản HV chỉ dùng mp3, không gọi API. Giọng dẫn: **giọng trẻ con nhất có thể, British chuẩn** | 11-09 |
| 5 | Quan hệ DLP | Web **thay thế** Homework DLP → cột Homework các tab cần sửa trỏ sang web (làm sau, báo trước) | 11-09 |
| 6 | Hình ảnh | Asset có sẵn của unit — lấy từ file HTML lớp học (I1 đã tách xong) | 11-09 |
| 7 | Rolling intake | Homework L1 chỉ ôn L1 | 11-09 |
| 8 | FL I1 | Thêm 1–2 câu "What are you eating?" → "I'm eating…" | 11-09 |
| 9 | Chống làm bằng trí nhớ | Đổi nội dung so với lớp (order, vị trí, tên/gương mặt mới) + xáo trộn mỗi lần làm lại | 11-09 |
| 10 | Trả lời sai | Theo template DOL (rung + viền đỏ + "tè tè", chọn lại tới khi đúng) **+ sai lần 2 thì đáp án nhấp nháy gợi ý**. Lần chọn đầu = điểm cho GV | 11-09 |
| 11 | Chấm Speaking | Nhận diện có/không có từ khoá (không chấm phát âm). Sai 2 lần → hiện + đọc đáp án, cho đi tiếp | 11-09 |
| 12 | Review | Hai phần: **Watch** (animation bằng code, tự chạy, mỗi câu có nút nghe lại) → **Explore** (HV tự bấm) | 11-09 |
| 13 | Animation | Dựng bằng code, không làm file video | 11-09 |
| 15 | Nút "I'm ready!" | ~~Luôn xanh, bấm được ngay~~ → **(11-18, theo mockup S3b đã duyệt)** Explore Vocab: I'M READY hiện khi đã nghe đủ từ; bấm thanh icon mở lưới tất cả từ để nghe nhanh | 11-18 |
| 16 | Thanh theo dõi từ (Explore) | Icon xám → **xanh khi HV bấm nghe món đó trên quầy** (HV tự theo dõi). Mỗi lần vào bài bắt đầu lại từ xám. Có đếm "x/10 words". Khi bấm I'm ready → lưu danh sách từ đã nghe + HV có skip hay không (gửi GV qua Firebase sau) | 11-09 |
| 17 | Say it (Speaking) | **Kim dẫn vào bài** (intro) → mỗi hình Kim hỏi "What's this?" → **micro tự bật** (tối đa 7s) → sai/không nghe thấy: Kim động viên → micro tự bật lại. Sai 2 lần → Kim đọc đáp án, HV bấm Next. Không có micro → "nói to rồi bấm Check" | 11-09 |
| 18 | Lời dẫn bài Practice | Mỗi bài Practice có câu `intro` của Kim giải thích cách chơi trước khi bắt đầu | 11-09 |
| 19 | Chấm Speaking câu dài | Chỉ kiểm tra **BE (is/'s, am/'m) + tên món**. Đúng món nhưng thiếu BE → Kim nhắc riêng "Don't forget is/am!" (lỗi chính trong STS Insights) | 11-09 |
| 20 | Nhân vật "I" | Kim còn là hình tạm → câu "I'm eating…" dùng bạn gái cầm đĩa (asset có sẵn) + bong bóng thoại; Lift the Lid dùng hình bàn tay chỉ vào HV ("It's you!") | 11-09 |
| 21 | Màn bản đồ (Map) | Màn ngoài kiểu Duolingo ABC: 3 nút lớn **Vocabulary → Grammar → Let's Talk** trên đường đi. Vòng tròn xanh = số bước đã xong; ✓ + ★ (1–3 sao theo điểm lần đầu) khi xong phần; 🔒 phần sau mở khi xong phần trước; phần đang học nhún nhảy. Start → Map; xong 1 phần → tự về Map (vòng xanh chạy + Kim khen). Nút 🗺️ trên thanh trên để về Map bất kỳ lúc nào. Bấm phần đang dở → học tiếp từ bước chưa xong; bấm phần đã xong → làm lại | 11-09 |
| 22 | Giao diện Map | Nền = cảnh Food Street của unit, làm mờ + phủ lớp giấy cho dịu. Đường đi = con đường lát đá. Mỗi phần = một quầy hàng có mái sọc (Vocab đỏ · Grammar vàng · Let's Talk xanh ngọc) + bảng hình. Tiến độ = chấm xanh dưới tên; xong phần = ✓ + sao. Rải vài món ăn của unit dọc đường | 11-09 |
| 23 | Font | **Grandstander** (tiêu đề, kiểu chữ vẽ tay như biển quầy) + **Andika** (chữ thường; font SIL thiết kế cho trẻ mới tập đọc: chữ a, g một tầng; có tiếng Việt). Thay Baloo 2 + Nunito | 11-09 |
| 24 | Let's Talk (FL) I1 | Watch: Tony (chips) → Pat (egg) → bạn gái "What are you eating? — I'm eating rice". Explore: 3 thẻ hỏi–đáp. P1 (L) **Find the friends**: nghe "What is Nick eating? — He's eating a sausage." → bấm đúng bạn, tên gắn vào (6 bạn, 5 tên; món dễ nhầm). P2 (S) **Answer Kim**: Kim hỏi → micro tự bật → kiểm tra BE + **đủ tất cả món** (vd "burger and chips"); 4 câu he/she + 2 câu "What are you eating?" | 11-09 |
| 25 | Hoàn thành lesson | Xong cả 3 phần → Map hiện huy hiệu 🏆 "Complete! ★ x/9" dưới tiêu đề + Kim chúc mừng | 11-09 |
| 26 | Công cụ tạo giọng + vẽ | **EXPLORE Studio** (file HTML mở trên máy người soạn, key lưu trong trình duyệt): ElevenLabs tìm/chọn giọng Kim + Người dẫn → tạo toàn bộ câu của lesson → tải .zip (mp3 + `lessons/<id>.voice.js`). OpenAI gpt-image-1 vẽ Kim theo phong cách Unit I (6 tư thế). App tự dùng mp3 nếu có, không thì đọc bằng TTS. Danh sách câu tạo bằng `tools/collect-lines.js` | 11-10 |
| 27 | Bố cục full màn hình | Cảnh phủ kín màn hình, thanh trên + khung điều khiển nổi trên hình (kính mờ), không còn viền trắng. Máy tính/tablet/đt ngang: hình phủ kín (cắt ≤12%); đt dọc: hình hiện trọn ở trên + phần còn lại lấp bằng chính hình đó làm mờ. Các màn luyện tập nằm trên nền mờ của cảnh phố | 11-10 |
| 28 | Kim động | Kim đứng góc dưới trái, to (khoảng 1/4 chiều cao màn hình). Tư thế đổi theo tình huống: chào (nghỉ) · chỉ tay (đang dẫn/nói) · ăn mừng (khen) · nghe (micro bật) · thử lại (nhắc). Thêm thở, nhún khi nói, nhảy khi khen, nghiêng đầu khi nghe; bong bóng thoại tự ẩn sau 3,5s. Hiện là hình rối tạm (SVG); khi có hình vẽ từ Studio (assets/common/kim/kim-wave/point/cheer/listen/think.png) app tự thay | 11-10 |
| 29 | UX học theo Pixie (giữ visual của mình) | **Khung lai:** Watch/Explore full màn hình ngang; các màn làm bài, thẻ Review và Map nằm trong khung dọc ~440px (máy tính: khung nổi giữa nền mờ; điện thoại: phủ kín). Kim đứng trên dải vỉa hè dưới đáy khung. **Thanh làm bài:** ✕ về Map · thanh tiến độ mảnh · **khay sưu tầm** (đúng → hình bay vào ô) · **Aa** · ☰. **Nút loa to + nút rùa 🐢 nghe chậm** ở bài nghe. **Watch:** chỉ còn nút loa + nút ➜ to, hết đoạn thì ➜ nhấp nháy (không tự chuyển). **Map:** Kim đứng cạnh quầy đang học | 11-11 |
| 30 | Phản hồi sai | **Giữ template DOL** (rung + viền đỏ + "tè tè", gợi ý nhấp nháy lần 2); Kim thêm tư thế suy nghĩ | 11-11 |
| 31 | Chữ trong bài nghe | **Ẩn mặc định**, hiện khi trả lời đúng hoặc bấm Aa (nhớ lựa chọn trên máy). Review vẫn hiện chữ | 11-11 |
| 32 | Khung (sửa #29) | **Mọi màn đều full màn hình.** Bỏ khung dọc kiểu điện thoại; giữ thanh làm bài (✕ · tiến độ · khay · Aa · ☰), nút rùa, vỉa hè + Kim đứng góc trái. Nội dung bài căn giữa, rộng tối đa ~760px trên máy tính | 11-16 |
| 33 | Chia Unit → Lesson | Start → **Chọn Unit** (A–J; chỉ Unit I mở, còn lại "Sắp có") → **Chọn Lesson** (I1–I5: kỹ năng + trạng thái Chưa làm / Đang làm x/y / ★) → Map của lesson. Mỗi lesson một link riêng (`#i1`, bước cụ thể `#i1--g-p1`). Danh mục ở `catalog.js`; lesson pack tải khi mở | 11-16 |
| 34 | Kỹ năng theo DLP | Lesson khai báo `skills` theo cột Skill focus (I1, I3: L+S · I2, I4: R+W · I5: tổng hợp). **Engine tự bỏ qua bài Practice có skill khác** và báo ⚠️ trong menu ☰ cho người soạn | 11-16 |
| 35 | I2 & I4 | Có thêm **1 bài ôn FL ngắn dạng đọc–viết** (DLP: FL recycle) | 11-16 |
| 36 | Audio bài đọc–viết | Câu/từ mẫu **chỉ đọc sau khi HV trả lời**; hướng dẫn của Kim vẫn có giọng | 11-16 |
| 37 | Kim (hình thật) | 5 tư thế vẽ bằng Gemini Nano Banana Pro theo phong cách màu nước Unit I (mẫu: Sue): wave · point · cheer · listen · think. Tách nền → `assets/common/kim/kim-<pose>.webp` (dùng chung mọi unit) | 11-16 |
| 39 | Kim theo loại màn (11-17) | **Màn cảnh (Watch, Explore) + màn Units/Lessons:** chỉ đầu Kim trong khung tròn ở góc trái dưới, thoại bên phải. **Màn làm bài, thẻ ôn, recap, done:** không có Kim (vẫn có giọng Kim hướng dẫn) | 11-17 |
| 39b | Mở đầu mỗi bài (11-17) | Đầu Kim + khung chữ tím hiện khi Kim đọc câu hướng dẫn đầu bài → đọc xong ~1s thì Kim biến mất; các câu hỏi sau đó không có Kim | 11-17 |
| 40 | Tốc độ giọng (11-17) | Mọi câu chuẩn hoá về ≈3.45 âm tiết/giây (trước: 2.5–5.2, trung vị ~3.9), giữ cao độ; cân âm lượng −18 LUFS. File: `assets/*/vo3/` | 11-17 |
| 40b | Voice Pipeline (11-17) | Mọi giọng đọc làm bằng `tools/voice-pipeline.js` chạy trên Chrome của Thanh (container + VM bị chặn mạng tới ElevenLabs/Gemini): ElevenLabs tạo → đo tốc độ, lệch >8% thì tạo lại với `speed` đã chỉnh (đích 3.35 âm tiết/s đo đầu–cuối tiếng; câu có "…" giữ nhịp) → Gemini (`gemini-pro-latest`) nghe phát âm → lỗi thì tạo lại, tối đa 3 lần → tự tải `explore-voice-<lesson>.json`. Claude chạy `tools/ingest-voice.py <file> <folder>`: chỉ cân âm lượng, **không kéo giãn**. Key nhớ trong Chrome của Thanh (localStorage của example.com). Thanh chỉ bấm Run | 11-17 |
| 40c | Gợi ý 💡 ở Lift the lid (11-17) | Nút bóng đèn ở góc đĩa: bấm → hiện chữ món ăn dưới đĩa (kèm mạo từ, vd "an egg") + đọc từ đó; HV vẫn phải tự nói cả câu. Số lần dùng gợi ý lưu vào kết quả (`hints`) cho GV xem | 11-17 |
| 42 | Dạng bài Đọc–Viết (11-17) | HV nhập bằng **thẻ** (không bàn phím): `choose` (chọn hình / chữ / ✓✗, có thể chọn nhiều), `spell` (thẻ chữ cái: đục lỗ đúng chỗ khó hoặc xáo trộn, a/an in sẵn, 💡 nghe từ), `build` (ráp câu bằng thẻ cụm từ, có thẻ bẫy; kiểu burger cho I2), `sort` (chạm thẻ → chạm khay; tên khay hiện sau), `gaptext` (điền từ vào đoạn văn). File `types-rw.js` | 11-17 |
| 43 | Bản đồ I2–I5 (11-17) | Đã gửi Thanh, Thanh chọn: thẻ chữ + tải 3 HTML bài giảng (I2, I3, I5) để lấy hình. I4 dùng hình I3 | 11-17 |
| 44 | Nguồn hình I3–I5 (11-17) | Tách từ HTML bài giảng DOL (Lesson 2, 3, 4-ppt, 5): 8 món Set 2, xe Drinks/Dessert, 32 cảnh Bill/Pat/Sue/Tony × món, hình bữa ăn I5, audio từ Set 2 + breakfast/lunch/dinner. Bài về nhà dùng câu & đáp án **mới**, không lặp đáp án trên lớp | 11-17 |
| 45 | Giọng I2–I5 (11-17) | Mỗi lesson 1 file `lessons/<id>.voice.js`, nạp khi mở lesson: câu đã thu ở I1 trỏ tới mp3 cũ, câu mới **nhúng thẳng** (data URI, 64 kbps mono) để app không vượt giới hạn 512 file. Quy trình: `tools/collect-unit-lines.js` → Voice Pipeline (Chrome) → `tools/ingest-unit.py` → `tools/pack-voice.py i2 i3 i4 i5` | 11-17 |
| 46 | Đưa lên web (11-17) | Unit I đã **live** tại https://explore-homework.dol.vn. Repo **`thanhtran-commits/explore-hw`** (public, nhánh `main`; Claude GitHub App cài riêng cho repo này). Dokploy: project *EXPLORE Homework* › app `web` — nguồn **Git** (URL công khai), Build Type **Dockerfile**, registry **Harbor** (bắt buộc: không chọn thì swarm không nhận image mới), domain port 80 + HTTPS Let's Encrypt. DNS không cần thêm: `*.dol.vn` đã trỏ Cloudflare → server. Giọng ở bản web là file mp3 (`pack-voice.py --files`), bản artifact vẫn nhúng data URI | 11-17 |
| 47 | Cập nhật bản web (11-17) | Sửa code → commit + push `main` → Dokploy › web › **Deploy** (chưa có webhook tự deploy). Cloudflare giữ file .js tới 30 phút → Dockerfile gắn `?v=<giờ build>` vào mọi script, `engine.js` gắn cùng số vào lesson pack nạp sau → deploy xong là thấy ngay. nginx: `charset utf-8` (thiếu thì chữ Việt/emoji vỡ), header mic `microphone=(self)` | 11-17 |
| 48 | Đa dạng game (11-17) | **Trong 1 bài không game nào lặp cơ chế**; bài nghe Vocab của các bài liền nhau phải khác nhau. Game phải diễn ra trong bối cảnh storyline của bài (vd Food Street: băng chuyền ở quầy, cho bạn ăn ở quầy, thực đơn hôm nay = bingo, hộp cơm = lật thẻ). Pop the bubble vẫn dùng (I1) | 11-17 |
| 49 | Nhân vật & hình (11-17) | Giữ **nhân vật trên lớp** (HV nhớ ngữ cảnh). Dựng bảng nhân vật cố định từ hình có sẵn; **Image Pipeline** (Chrome + key Gemini, giống Voice Pipeline) vẽ cảnh/món còn thiếu theo bảng + style màu nước. Nhân vật mới chỉ khi bài không có ai | 11-17 |
| 57 | Phần thưởng (11-18) | **Con dấu** cuối mỗi chặng, đóng vào trang unit trong hộ chiếu; màu mực theo kết quả (xanh / bạc / vàng), không bao giờ mất dấu. **Xong lesson:** HV tự chọn 1 trong 3–4 món theo theme unit (Unit I: xe đồ ăn; Transport: các loại xe) → đặt vào **con phố riêng** (nền lớn 5 chỗ, điện thoại vuốt ngang). Đủ unit → **logo unit**. **Hộ chiếu chỉ trong app:** trang bìa = lưới logo 10 unit A→J; bấm logo → trang unit (con phố + dấu chặng). Bấm dấu / xe → nghe lại câu đã học | 11-18 |
| 56 | Kim (11-18) | Kim nguyên người **chỉ ở màn chào** (vẫy tay). Roadmap: **đầu Kim** làm dấu "bạn đang ở đây" (tròn, viền đỏ, mũi chỉ), trượt theo đường khi xong bài. Xong chặng (F4), chọn món (R1): **đầu Kim** ăn mừng. Kim dẫn dắt **chỉ ở Watch** (đầu Kim = nút nghe lại). Explore, bài luyện: **không** đầu Kim, **không** chữ hướng dẫn | 11-18 |
| 55 | Bài luyện (11-18) | Thanh trên: ✕ · tiến độ · **Aa**. **Luôn có loa**; bấm Aa → chữ hướng dẫn/câu hỏi hiện **1 dòng ở đáy màn**, không đẩy phần tử. Bài bấm chọn chấm ngay; CHECK chỉ cho bài ghép (đánh vần, ráp câu, điền từ). Đúng/sai = tấm trượt từ đáy (xanh lá / đỏ nhạt). Bài nói: loa trên · hình · **micro đỏ** tròn to ở đáy · "Can't speak now" chữ nhỏ; im lặng vài giây → micro nhấp nháy + tự đọc lại câu. P12/P13: câu hỏi chỉ hiện khi bấm Aa. Ô đánh vần: mọi ô chung 1 đường gạch chân. **Bài đọc tối đa ~3 câu/trang**, dài hơn tách trang (chấm trang), đoạn ngắn có hình minh họa ở trên. Xếp 3 khay: 1 món/lượt | 11-18 |
| 54 | Kể chuyện (11-18) | Watch: cảnh phủ kín màn, khung vừa đủ nội dung câu; Watch Grammar hiện trọn nhân vật đang được nói tới + nhãn "He is → He's". Explore Vocab: cảnh trọn, **thanh mỏng trên cùng** gom icon món đã nghe (tự xuống 2 hàng khi > 6 từ); bấm thanh → **lưới tất cả món**, bấm thẻ nghe lại. Explore Grammar / Let's Talk: **1 thẻ/màn**, nền trắng, hình vuông to, loa trước câu; thêm màn **tổng kết 3 câu** cuối. Giữ cả Watch Grammar (dạy rút gọn) và Explore Grammar (HV tự nghe, nhận ra pattern) | 11-18 |
| 53 | Điều hướng (11-18) | Màn chào: Kim vẫy tay + "Hi! I'm Kim." + START (không chữ tiếng Việt). Chọn unit: unit đang học = thẻ lớn + CONTINUE, unit khác thu nhỏ "Coming soon". **Đường học unit** = chỉ các lesson (nút tròn hình bìa). Bấm lesson → **roadmap của lesson**: nền là cảnh theme **không người**, làm mờ đều toàn màn; mỗi chặng (Vocab / Grammar / Let's Talk) là **cột mốc lớn** (khung tranh + cờ tên chặng), mỗi bài là 1 nút món ăn nhỏ. Laptop/iPad ngang dùng **cùng thiết kế**, chỉ giãn ngang (không dựng lại bố cục) | 11-18 |
| 52 | Nhận diện EXPLORE (11-18) | Bố cục học từ Duolingo nhưng **nhìn là của DOL EXPLORE**: khung phẳng kiểu DOL (nền trắng, thẻ xám nhạt #F4F5F7, viền #E3E7ED, chữ #242938). **Đỏ san hô #E05848** (lấy từ mái che xe trong tranh; đậm #C8443A) = **HV làm**: micro, NEXT, CONTINUE, START. **Xanh royal dịu #4A6FD6** (đậm #3756B5) = **nghe**: loa, tiến độ. Font: **Plus Jakarta Sans** (tiêu đề, nút — font DOL), **Andika** (chữ HV đọc). Mockup duyệt: `tools/design-v3/` | 11-18 |
| 51 | Bố cục v2 (11-17) | **Một hệ bố cục cho mọi cỡ màn** (phần `LAYOUT v2` cuối `<style>`): kích thước theo chiều cao dùng được `--avh`, chừa dải dưới cho Kim, màn dọc xếp cảnh + thanh chữ rộng, điện thoại xoay ngang chia 2 cột, nút ≥ 44px, mục đầu hiện mờ khi Kim đọc hướng dẫn. Kiểm tra bằng `run2.js` trên 6 cỡ: điện thoại 390×844 & 360×640, điện thoại ngang 844×390, tablet 820×1180, laptop 1280×720 & 1366×640 | 11-17 |
| 50 | Thứ tự (11-17) | Sửa bố cục 3 cỡ màn → game mới Unit I → thử Image Pipeline → Unit A–H. **Bàn với Thanh trước khi sửa** từng hạng mục | 11-17 |
| 41 | Bố cục màn thấp (11-17) | Kích thước bong bóng / thẻ / đĩa / hình tính theo **cả chiều cao màn** (vh), vùng làm bài cuộn được nếu vẫn không đủ | 11-17 |
| 38 | Giọng đọc | ElevenLabs `eleven_multilingual_v2`. **Kim:** "Blondie – Dynamic Children's Storyteller" (tốc độ 0.95). **Người dẫn:** "Sally – Youthful Children's Storyteller" (0.88). I1: 118 câu (`lessons/i1.voice.js`, `assets/i1/vo/`); câu chung màn Unit/Map: 9 câu (`lessons/common.voice.js`, `assets/common/vo/`) | 11-16 |
| 14 | Exercise library | Lấy **Template tổng hợp các dạng bài tập Kids** (DOL) làm nền; research (Duolingo ABC, Khan Kids, Lingokids) bổ sung | 11-09 |

## 3. Kiến trúc
```
explore-hw/
├─ index.html        ← khung app + CSS (1 file cho mọi lesson)
├─ engine.js         ← player: flow, Kim, audio, step types, Store
├─ lessons/i1.js     ← lesson pack I1 (dữ liệu, không code)
└─ assets/i1/img|audio
```
- **Step types hiện có:** `watch` (có thêm strip câu, actors, bong bóng thoại, làm mờ nền) · `explore` · `chunks` · `bubbles` · `pick` · `say` · `lid` · `recap` · `done`.
- Thêm ở CP4b: `qa` (review hỏi–đáp) · `names` (nghe → bấm đúng bạn, gắn tên) · `answer` (Kim hỏi → HV nói cả câu, kiểm tra BE + đủ món).
- Audio thoại: hiện dùng TTS en-GB của trình duyệt làm tạm; khi có mp3 ElevenLabs chỉ cần thêm `audio:` vào từng `line` trong lesson pack.
- Nhảy tới bước bất kỳ: nút ☰ (dành cho GV/người duyệt) hoặc thêm `#v-p1` vào link.

## 4. Flow chuẩn
```
Start → MAP → [VOCAB] Watch → Explore → Practice ×2 → Ôn lại từ
      → [GRAMMAR] Watch → Explore → Practice ×2
      → [FL] Watch → Explore → Practice ×2 → Thưởng
```
- Khối nào cũng có thể tắt (B10). Practice lọc theo skill của lesson (L1, L3 = L&S; L2, L4 = R&W; L5 = tích hợp).
- Hai lesson cùng skill không dùng trùng vỏ game.

## 5. Exercise library (theo template DOL)
| Skill | Cơ chế (template) | Vỏ game | Trạng thái |
|---|---|---|---|
| L | Nghe & chọn | Bong bóng | ✅ `bubbles` |
| L | Nghe & chọn có nhân vật | Thẻ hình bạn đang ăn | ✅ `pick` |
| L | Nghe & chọn | Con cua / băng chuyền / silhouette | sau |
| L | Matching kéo thả | Kéo tên → người (Draw Lines) | CP4 |
| L | Lật hình (memory) | Mặt sau cá heo DOL | sau |
| S | Nghe & repeat (nhận diện từ khoá) | Say it! | ✅ `say` |
| S | Nghe & trả lời câu hỏi | Lift the Lid | ✅ `lid` · Kim hỏi (FL) CP4b |
| S | Lồng tiếng / chuỗi tăng dần | Dub it! / Chain | sau |
| R | Nối từ với hình · Categorise | Xếp từ vào xe | L2 |
| W | Nối chữ cái thành từ | Chữ bay | L2 |
| — | Story → game | Truyện | L5 |

## 6. Mốc
| CP | Mốc | Trạng thái |
|---|---|---|
| 1 | Chốt kiến trúc + điểm treo | ✅ 2026-11-09 |
| 2 | Map I1: stage DLP → khối web → bài | ✅ 2026-11-09 (bản 2, theo template) |
| 3 | Prototype I1 — khối Vocab | ✅ 2026-11-09 — chờ Thanh thử |
| 3b | Chọn giọng ElevenLabs + tạo mp3 thoại | ✅ 2026-11-16 |
| 4a | I1 khối Grammar | ✅ 2026-11-09 — chờ Thanh thử |
| 4b | I1 khối FL + hoàn thành lesson | ✅ 2026-11-09 — chờ Thanh thử |
| 6a | Màn Unit → Lesson + chặn sai kỹ năng | ✅ 2026-11-16 |
| 6b | Dạng bài Đọc–Viết | ✅ 2026-11-17 |
| 6c–e | I2, I3, I4, I5 | ✅ 2026-11-17 |
| 6 | Hosting riêng (để micro chạy) | ✅ 2026-11-17 — Dokploy, explore-homework.dol.vn (Firebase/lưu điểm: chưa làm) |
| 8a | Giao diện v3 · mốc 1–2: nền tảng + 12 dạng bài luyện | ✅ 2026-11-18 |
| 8b | Giao diện v3 · mốc 3–4: kể chuyện + điều hướng | ✅ 2026-11-18 |
| 8c | Lên web bản 1 (mốc 1–4) | ✅ 2026-11-18 — build 20261118065359 |
| 8d | Image Pipeline (nền không người, món thưởng, logo unit, dấu) | Chờ — cần Chrome của Thanh |
| 8e | Phần thưởng: dấu chặng, chọn món, con phố, hộ chiếu | Chờ 8d |
| 7 | Unit A → H | Kế tiếp — đề xuất plan trước |

## 7. Map I1 (bản 2)
| Khối | Bước | Dạng bài | Nội dung |
|---|---|---|---|
| VOCAB | Watch + Explore | Food Street | 3 xe, 10 món; chicken/fish chỉ vào biển con vật → món ăn |
| | P1 (L) | Bong bóng | 8 lượt, distractor từ cặp dễ nhầm |
| | P2 (S) | Say it! | 5 món: a sausage, meatballs, chips, an egg, fish (âm cuối) |
| GRAMMAR | Watch + Explore | Chunks | Bill (burger) / Sue (chicken) / bạn gái cầm đĩa (meatballs); He is → He's (buddy merge) |
| | P1 (L) | Nghe & chọn có nhân vật | 6 câu (bộ hình HW1 cũ); hình sai khác ở món hoặc ở người |
| | P2 (S) | Lift the Lid | 6 lượt: he×2, she×2, I×2; bạn × món ghép ngẫu nhiên mỗi lần làm |
| FL | Watch + Explore | Hỏi–đáp | Tony, Pat, Kim hỏi "What are you eating?" |
| | P1 (L) | Kéo tên → người | Gương mặt mới (không dùng Bill/Tony/Sue/Pat) |
| | P2 (S) | Kim hỏi → HV nói | he/she + 1–2 câu "you" |

## 8. Hạn chế đã biết
- **Micro:** bản web (explore-homework.dol.vn) dùng được micro thật — cần thử trên máy HV. Riêng **link claude.ai:** khung xem artifact không cho dùng micro → bài Say it tự chuyển sang chế độ "nói to rồi bấm Check". Nhận diện từ khoá chỉ chạy khi web được host riêng (CP6) hoặc mở file trên Chrome.
- **Kim** đang là hình tạm (SVG); cần designer vẽ Kim cùng style Unit I.
- Giọng thoại là TTS trình duyệt → mỗi máy nghe khác nhau, cho tới khi có mp3 ElevenLabs. Audio 10 từ là mp3 thật (lấy từ HTML I1).

## 9. Nguồn dữ liệu
- DLP: Google Sheet WHW EXPLORE, tab I1–I5 + "Unit I"; tab "APP HOMEWORK (tạm)" có link app cũ Unit C–G.
- Template dạng bài: `Template tổng hợp các dạng bài tập Kids.xlsx`.
- Asset I1: file `Explore 2 - Unit I - Lesson 1 - What Are They Eating.html` (Drive › Unit I › I1).

## 10. Changelog
| Ngày | Phần | Trước | Sau |
|---|---|---|---|
| 11-17 | Hosting | Chỉ có link artifact claude.ai | Live tại explore-homework.dol.vn (Dokploy, repo thanhtran-commits/explore-hw) |
| 11-17 | Build Dokploy | Nixpacks (mặc định) + không registry → chữ vỡ, deploy mới không lên | Dockerfile + registry Harbor |
| 11-17 | Cache JS | Cloudflare giữ bản cũ ≤30 phút | `?v=<build>` trên mọi script |
| 11-09 | Tạo file | — | Chốt CP1 |
| 11-09 | Exercise library | Danh sách tự đề xuất (v0) | Template DOL làm nền + research bổ sung |
| 11-09 | Review | Kim dẫn + nút từ | Watch (animation tự chạy, nút nghe lại từng câu) → Explore |
| 11-09 | Câu sai | Sai 2 lần hiện đáp án | Template DOL + gợi ý nhấp nháy lần 2 |
| 11-09 | Speaking | Ghi âm, không chấm | Nhận diện từ khoá |
| 11-09 | Grammar P1 I1 | Listen and Circle | Nghe & chọn có nhân vật |
| 11-09 | CP3 | — | Prototype khối Vocab I1 published |
| 11-09 | Explore · "I'm ready!" | Khoá tới khi HV nghe đủ 10 từ | Luôn xanh, bấm được ngay |
| 11-09 | Say it | Không có lời dẫn; HV phải tự bấm micro | Kim dẫn + hỏi từng hình; micro tự bật; tự bật lại khi sai / im lặng |
| 11-09 | Giọng TTS | Đôi khi câu thoại bị nuốt (lỗi Chrome khi vừa huỷ câu trước) | Chờ 120ms trước khi đọc câu mới |
| 11-09 | Recap Vocab · nút Next | Khoá ("CP4") | Mở, đi sang Grammar |
| 11-09 | CP4a | — | Khối Grammar I1 published (Watch, Chunks, Who is it?, Lift the Lid, Grammar done) |
| 11-09 | Điều hướng | Start → vào thẳng Vocab; cuối mỗi phần có nút "Next: <phần sau>" | Start → **Map**; cuối mỗi phần → "🗺️ Back to the map" |
| 11-09 | Map · nền / đường / nút | Gradient xanh trơn · nét chấm · nút tròn có vòng tiến độ | Cảnh Food Street mờ · đường lát đá · quầy có mái sọc + chấm tiến độ |
| 11-09 | Font toàn app | Baloo 2 + Nunito | Grandstander + Andika |
| 11-09 | CP4b | Let's Talk "Coming soon" (khoá) | Khối FL I1 published; xong cả lesson có huy hiệu 🏆 trên Map |
| 11-10 | Giọng đọc | Chỉ TTS trình duyệt | Engine đọc mp3 từ `window.VOICE` trước, TTS làm dự phòng; có Studio để tạo |
| 11-10 | Bố cục | Hình 16:9 ở giữa, viền trắng trên/dưới, Kim là avatar tròn nhỏ | Full màn hình, UI nổi trên hình, Kim đứng to ở góc và cử động theo tư thế |
| 11-11 | Màn làm bài | Thẻ kính mờ full màn hình, chấm tròn đếm lượt, chữ hiện sẵn | Khung dọc kiểu Pixie, khay sưu tầm + Aa + nút rùa, Kim đứng trên vỉa hè |
| 11-11 | Watch | ⏮ ⏸ ⏭ + "Go to the carts", tự chuyển khi hết | 🔊 + ➜ to, hết đoạn ➜ nhấp nháy chờ HV bấm |
| 11-16 | Khung màn làm bài + Map | Khung dọc ~440px giữa nền mờ | Full màn hình, vỉa hè chạy hết chiều ngang |
| 11-16 | Điều hướng | Start → Map I1 | Start → Units → Lessons → Map; Map có nút ← Unit |
| 11-16 | Kim + giọng | Hình rối SVG tạm + giọng TTS trình duyệt | Kim vẽ thật (5 tư thế) + giọng ElevenLabs cho toàn bộ I1 |
| 11-09 | Explore · thanh icon | Viền xanh nhạt, giữ kết quả lần trước, không chú thích | Nền xanh rõ, mỗi lần vào bắt đầu từ xám, có "x/10 words", lưu heard + skipped |
| 11-17 | Kim ở màn cảnh | Kim đứng cả người cạnh 4 bạn nhỏ | Chỉ đầu Kim trong khung tròn, như avatar đang nói |
| 11-17 | Kim ở màn làm bài | Kim đứng trên vỉa hè góc trái | Bỏ Kim + vỉa hè; nội dung bài được thêm chỗ |
| 11-17 | Tốc độ giọng | Câu nhanh câu chậm (2.5–5.2 âm tiết/giây) | Đều ≈3.45 âm tiết/giây (chậm hơn ~12%), giữ cao độ |
| 11-17 | Màn hình thấp (desktop cửa sổ ngắn, điện thoại xoay ngang) | Loa bị che, thẻ đáp án bị cắt, micro rơi khỏi màn | Mọi thứ co theo chiều cao, không còn phần tử nào ra ngoài màn (đã test 1280×800, 1280×600, 390×844, 844×390) |
| 11-17 | Mở đầu bài làm | Không có Kim, chỉ nghe giọng | Đầu Kim + khung chữ tím cho câu hướng dẫn (vừa nghe vừa đọc), xong thì Kim biến mất |
| 11-17 | Cách làm chậm giọng | rubberband → giọng Kim có tiếng vọng | ffmpeg atempo (WSOLA), cùng tốc độ đích, hết vọng |
| 11-17 | Giọng I1 | Làm chậm sau khi tạo (rubberband → atempo); chưa kiểm tra phát âm ("lesson" nghe như "lasson") | Tạo lại toàn bộ 127 câu qua Voice Pipeline: tốc độ chỉnh ngay lúc tạo, Gemini 3.1 Pro kiểm tra từng câu, 45 câu được tạo lại; "I am eating meatballs!" bị nói tắt "I'm" → tạo lại với nhấn mạnh "AM". File: `assets/*/vo4/` |
| 11-17 | Lift the lid | Chỉ có bóng món ăn; không đoán được thì kẹt | Thêm nút 💡: hiện + đọc tên món, mic tự bật lại để HV nói cả câu |
| 11-17 | Engine | Dữ liệu gắn chặt I1 (chỉ "eating", chỉ câu đầy đủ, recap cố định) | Dùng chung cho mọi lesson: hình chia sẻ (`@i1/img/…`), động từ theo món (`verb`), câu trả lời ngắn Yes/No (không nhận "Yes, she's"), máy quay Snack Machine (`style: "slot"`), chữ khó tô đỏ (`spell: "br[ea]d"`) |
| 11-17 | I2 | Sắp có | **Xong (chờ giọng thu):** Vocab (Watch đọc chữ + Explore + Read & match + Missing letters + Mixed-up letters), Grammar (Watch + chunks + Look & read ✓✗ + Build a burger), Let's Talk (Q&A + Read & match). Câu mới tạm đọc bằng TTS cho tới lượt Voice Pipeline |
| 11-17 | I3 | Sắp có | **Xong:** Vocab (2 xe mới + Pop the bubble + Say it), Grammar (eating/drinking, bẫy kem/sô-cô-la; Silly or not? + Snack Machine nói, chấm cả động từ), Let's Talk (Is…? Yes, she is / No, she isn't; Listen & tap + trả lời ngắn bằng mic, không nhận "Yes, she's") |
| 11-17 | I4 | Sắp có | **Xong:** Vocab (chữ khó tô đỏ, không a/an; Picture pairs + Sticky spelling + Snack labels), Grammar (is/am + -ing luôn đi đôi; Sentence doctor + Yes/No Starters P2), Let's Talk (ráp câu trả lời ngắn) |
| 11-17 | I5 | Sắp có | **Xong:** Vocab (bầu trời 3 bữa; Three trays xếp trước rồi mới hiện tên FOOD/DRINK/DESSERT + Fridge đánh vần + nghe bữa ăn nhà Max), Grammar (cùng động từ → and, khác → 2 câu; Snapshots nói + Tom's day điền từ chọn theo động từ + ráp câu), Let's Talk (What vs Is; Does it match? + Race home bàn cờ) |
| 11-17 | Engine | — | Thêm: câu trả lời 2 vế (eating + drinking), chấm động từ theo đầu từ ("meat" ≠ "eat"), bàn cờ Race home, chỗ trống có lựa chọn riêng, âm thanh hiệu ứng dùng chung |
| 11-17 | Giọng I2–I5 | Giọng máy (TTS) | 241 câu mới thu qua Voice Pipeline (Gemini 3.1 Pro kiểm tra; 179 câu được tạo lại ít nhất 1 lần; tốc độ trung vị 3.4 âm tiết/s) + 62 câu dùng lại của I1. Câu kết unit đổi thành "Hooray! You finished Food Street!" (giọng đọc "Unit I" thành "Unit Y") |
| 11-17 | Bố cục | Cảnh dính mép trên, chữ bé, Kim che nút, khung hình trống lúc mở bài, laptop bài bé tí | **Bố cục v2:** 5 lỗi đã nêu + 14 lỗi tự soát (nút 44px, recap/done, sort 3 khay, chữ tràn, thẻ hình bị ép dọc, thẻ Explore ngữ pháp lấp đầy màn dọc…). 474 ảnh/6 cỡ màn: 0 lỗi (riêng recap dài vẫn cuộn, nút ghim đáy) |
| 11-18 | Thiết kế | Giao diện kiểu Duolingo nền trắng, có Kim + chữ hướng dẫn ở mọi màn | **Giao diện v3 đã duyệt mockup** (#52–57): nhận diện DOL EXPLORE (đỏ san hô = làm, xanh = nghe), roadmap theme có cột mốc, Explore 1 thẻ/màn, bài luyện chỉ loa + Aa, micro đỏ, hộ chiếu + con phố riêng. Chưa sửa code |
| 11-18 | Giao diện v3 · bài luyện | Nền trời mây, Kim + bong bóng tím, thẻ nổi giữa màn, laptop bài nhỏ | Nền trắng DOL; ✕ · tiến độ · Aa; loa xanh luôn có; tấm đúng/sai từ đáy (sai ở bài bấm chọn tự ẩn ~1s); CHECK cho đánh vần/ráp câu/điền từ (sai lần 2 → đáp án + GOT IT; điểm = đúng ngay lần CHECK đầu); micro đỏ + nhắc khi im lặng + "Can't speak now" (bỏ phần nói, chỉ chấm câu đã nói); xếp 3 khay 1 món/lượt; Tom's day 3 trang; "Does it match?" 2 bóng nói; bỏ 🐢, khay hình, ☰ trong bài; font tự host (Plus Jakarta Sans + Andika) |
| 11-18 | Giao diện v3 · kể chuyện + điều hướng | Màn chào thẻ nhỏ, lưới unit, danh sách lesson, bản đồ 3 sạp, Watch có dock, Explore lưới thẻ | Màn chào Kim vẫy tay; "My units" thẻ lớn; đường học unit (nút tròn lesson + đầu Kim); roadmap lesson (cột mốc lớn mỗi chặng, nút món ăn, đầu Kim trượt); Watch phủ màn + "camera" theo trường `focus`, đầu Kim = nghe lại, chip He is → He's; Explore Vocab thanh icon trên + bảng tất cả từ; Explore Grammar/Let's Talk 1 thẻ/màn + màn tổng kết; Recap theo F3; Done đầu Kim + % đúng + thời gian (chỗ trống chờ con dấu). Lesson mở theo rolling intake, không khoá xám. Trường data mới (tuỳ chọn): `splash.bg`, unit/lesson `bg`, lesson `cover`, `focus`, `frame`; kết quả lưu thêm `_t` (thời gian) |
