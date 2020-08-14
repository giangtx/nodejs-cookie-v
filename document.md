# Tìm hiểu về csrf token (Nodejs, csurf)
#### Trong các ứng dụng hiện nay thường hay sử dụng JWT để xác thực(authentication) và ủy quyền(authorization) token xác thực sẽ được lưu vào một http-Only cookie trên trình duyệt của người dùng. Điều này sẽ làm đơn giản hóa code ở front-end vì nó không phải theo dõi token(cookie tự động gửi bởi trình duyệt theo mỗi request)
#### Tuy nhiên việc sử dụng cookie để xác thực khiến cho ứng dụng dễ bị tấn công CSRF. Cùng tìm hiểu về CSRF, cách tấn công CSRF và cách giảm thiểu lỗ hổng bảo mật
![hacker](https://images.viblo.asia/0eea3ebb-a900-46b3-ab7b-3e25845689d7.jpg)
* ## Cơ bản về csrf
  CSRF ( Cross Site Request Forgery) là kĩ thuật tấn công bằng cách sử dụng quyền chứng thực của người sử dụng đối với 1 website khác. Các ứng dụng web hoạt động theo cơ chế nhận các câu lệnh HTTP từ người sử dụng, sau đó thực thi các câu lệnh này.
  hí
* ## Kịch bản tấn công
  #### Một cuộc tấn công CSRF vào một trang web(ví dụ: app.com) sử dụng cookie để xác thực có thể xảy ra theo cách sau:
  * Người dùng truy cập trang web app.com để thực hiện thanh toán, chuyển tiền... và chưa thực hiện logout để kết thúc.
  * Người dùng truy cập vào trang web độc hại (hacker.com) bằng trình duyệt của mình.
  * Trang web độc hại sẽ chứa một request ẩn với trang web bị nhắm đến(app.com). 
    > Ví dụ: Nó có thể là một thẻ img hay thẻ form bị ẩn gọi đến request "api/transfer_money?to=hackerman&amount=10000" để yêu cầu chuyển tiền của người dùng vào tài khoản của hacker
  ```html
  <img height="0" width="0" src="http://www.webapp.com/project/1/destroy">
  <iframe height="0" width="0" src="http://www.webapp.com/project/1/destroy">
  <link ref="stylesheet" href="http://www.webapp.com/project/1/destroy" type="text/css"/>
  <bgsound src="http://www.webapp.com/project/1/destroy"/>
  <background src="http://www.webapp.com/project/1/destroy"/>
  <script type="text/javascript" src="http://www.webapp.com/project/1/destroy"/>
  ```
  * Trình duyệt của nạn nhân sẽ tự động đính kèm cookie mà nó có cho app.com. Cookie xác thực sẽ được đính kèm với reuquest.
  * Nhìn từ phía của server, đây là một yêu cầu hợp lệ, cho lên request sẽ đc thực hiện thành công.
  * Như vậy kẻ tấn công có thể thử dụng CSRF để chay bất cứ yêu cầu nào với trang web mà trang web không thể phân biệt được request nào là hợp pháp hay không.
* ## Cách phòng chống các cuộc tấn công CSRF
  Dựa trên nguyên tắc của CSRF “lừa trình duyệt của người dùng (hoặc người dùng) gửi các câu lệnh HTTP”, các kĩ thuật phòng tránh sẽ tập trung vào việc tìm cách phân biệt và hạn chế các câu lệnh giả mạo.
  * ### Phía server