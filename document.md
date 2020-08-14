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
  ### Giải pháp:
  Chúng ta cần đặt giá trị bổ xung(token) chuyển đến máy chủ để tăng tính xác thực của request
  * Khi người dùng truy cập trang web(app.com) lần đầu tiên, server sẽ đặt một SCRF cookie.
  * Cookie này chỉ được đọc bằng JavaScript code trên app.com.
  * Coolie cần được gửi trở lại server theo hai cách khác nhau: dưới dạng cookie và dưới dạng header. Việc thêm nó vào header là trách nhiệm của front-end và đảm bảo request là chính xác(không có mã bên ngoài nào có thể đặt đc request đó).
  
  ### Thư viện csurf hoạt động hơi khác một chút, chúng ta có thể xem ví dụ sau đây:
  ### Phía server(sử dụng thư viện csurf)

   * ### Cài đặt:
  ```
  $ npm install csurf
  ```
    * #### Code:
    app.js
  ```javascript
  import createError from 'http-errors';
  import express from 'express';
  import path from 'path';
  import cookieParser from 'cookie-parser';
  import logger from 'morgan';

  import testRouter from './routes/test';

  //tạo express app
  const app = express();

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  //sử dụng router test
  app.use('/test', testRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({message: 'error: ' + err});
  });

  export default app;
  ```
    test.js
  ```javascript
      import express from 'express';
      import csurf from 'csurf'
      //cài đặt router middleware
      const csrfMiddleware = csurf({
          cookie: true
      })
      
      //tạo router
      const router = express.Router();

      router.get('/gettoken', csrfMiddleware, (request, response) => {
          //trả về csrfToken 
          response.json({
              csrf: request.csrfToken()
          })
      })

      router.post('/', csrfMiddleware, (request, response) => {
          response.json({
              message: 'chào bạn!'
          })
      })

      export default router;
    ```
   Như đã thấy ở trên ví dụ có 2 api:
    
     * '/test/gettoken': một GET api đơn giản chỉ trả về cookie xác thực
     * '/test': một POST api trả về dữ liệu cho người dùng ở đây là message: 'chào bạn'
   ### Giao tiếp giữa client và server
   Trong request đầu tiên, server sẽ gửi cho client hai cookie là _csrf và XSRF-Token:
     * _csrf được tạo tự động khi ta để {cookie: true}. Đây là bí mật và không phải là CSRF-Token. Server sẽ sử dụng cái này để khớp với mã token thực sự. Cookie _csrf là một giải pháp thay thế cho việc sử dụng session: thay vì lưu chữ bí mật này ở máy chủ, gắn với user session thì lưu trữ nó trên trình duyệt của người dùng dưới dạng cookie
     * XSRF-Token. Đây là CSRF token. Chúng ta cần tạo nó bắng cách thủ công với hàm request.csrfToken(). Nó cần được gửi cho client trong lần request đầu tiên(có thể thực hiện bằng nhiều cách như đặt nó làm cookie hoặc trả về cho client bằng response như ví dụ trên...). Client cần gửi lại nó trong body, query string hoặc header trong mỗi request.
     
   Gọi GET api 'test/getttoken' để lấy ra XSRF-Token
   ![csrf-get](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-get.png?alt=media&token=905d8f57-f8e8-4f5d-9c40-f951ed79395e)
   _csrf sẽ được lưu ở cookie
   ![csrf-cookie](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-cookie.png?alt=media&token=786c5b79-84eb-4b6e-ba12-19a956e7a0ca)
   Trường hợp client gửi lại XSRF-Token trong body(sử dụng param tên là _csrf)
   ![csrf-body](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-body.png?alt=media&token=560fca6f-cbe5-45f3-ba73-a41d5b9d8664)
   Trường hợp client gửi lại XSRF-Token trong query string(sử dụng param tên là _csrf)
   ![csrf-query](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-query.png?alt=media&token=e0d0e6a1-67dd-4831-b0d9-67bdd64e064a)
   Trường hợp client gửi lại XSRF-Token trong header(sử dụng param tên là CSRF-Token hoặc XSRF-Token)
   ![csrf-header](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-header.png?alt=media&token=30973f7d-eaa2-41da-8472-db727952df75)
   Trường hợp XSRF-Token thiếu, bị sai hoặc _csrf thiếu, bị sai
   ![csrf-log](https://firebasestorage.googleapis.com/v0/b/slytherin-b4041.appspot.com/o/csrf-log.png?alt=media&token=451d7476-9b55-449a-a7da-6820f32f2655)
   Đối với GET request:
     * Bảo vệ CSRF là không cần thiết.
   Đối với POST/PATCH/PUT/DELETE request:
     * Phải thêm csrfProtection middleware trên server code.
     * Server sẽ kiểm tra cookie _csrf do client gửi về và XSRF-Token cũng do client gửi về trong body, query string hoặc header trong mỗi request.
   ### Những điều cần xem xét
     * XSRF-TOKEN có thể sẽ được client gửi lại dưới dạng cookie (do cách thức hoạt động của cookie), nhưng server sẽ bỏ qua nó, vì nó sẽ chỉ tìm kiếm nó trong body, query string hoặc header trong mỗi request.
     * Mã tạo token(request.csrfToken()) chỉ nên được chạy một lần khi GET request '/' gốc chạy lần đầu tiên
     * ...
     
   Tài liệu tham khảo:
   https://medium.com/@d.silvas/how-to-implement-csrf-protection-on-a-jwt-based-app-node-csurf-angular-bb90af2a9efd
   https://securitydaily.net/csrf-phan-1-nhung-hieu-ve-biet-chung-ve-csrf/
   http://expressjs.com/en/resources/middleware/csurf.html
