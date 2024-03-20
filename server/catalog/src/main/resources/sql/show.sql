ALTER TABLE show
    MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

INSERT INTO show (title, poster_image, description, description_image, genre, video_url, view_count, singer_id, hall_id, reservation_start_datetime, reservation_end_datetime, status, reservation_type, start_date, end_date, max_ticket_per_person, company_id, is_adult_only)
VALUES ('2024 IVE 2nd FANMEETING 〈MAGAZINE IVE〉', 'https://cdnticket.melon.co.kr/resource/image/upload/product/2024/02/20240207105504dbc862cf-1e34-4050-9f0b-827a7ebc3a9f.jpg/melon/resize/180x254/strip/true/quality/90/optimize','', 'https://cdnticket.melon.co.kr/resource/image/upload/product/2024/02/20240207110635ac758c63-b12b-4ad4-ac3f-65f9e835dfff.jpg/melon/quality/90/optimize', 'KP', 'https://www.youtube.com/watch?v=8TtyQcLv0eU', 0, 3, 1, '2024.02.13.20:00:00', '2024.02.16:23:59:59', '판매중', '선착순', '2024.03.09', '2024.03.10', 1, 9, false),
        ('플레이 뮤지컬 〈핑크퐁과 아기상어의 무지개 구출 작전〉', 'https://ticketimage.interpark.com/Play/image/large/24/24002524_p.gif',	'2024년 5월, 핑크퐁, 아기상어와 함께 무지개를 구하러 알록달록 다채로운 색깔 나라로 떠나보아요!','https://ticketimage.interpark.com/Play/image/etc/24/24002524-01.jpg', 'FE', 'https://www.youtube.com/watch?v=SCQQ1mN-1pM', 0, 2, 5, '2024.02.29', '2024.08.24', '판매중', '선착순', '2024.05.01', '2024.08.25', 4, 8, false);