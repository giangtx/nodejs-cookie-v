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
  * Khi người dùng truy cập trang web(app.com) lần đầu tiên, server sẽ đặt một SCRF cookie
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
