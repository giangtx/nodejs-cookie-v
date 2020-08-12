import express from 'express';
import jwt from 'jsonwebtoken';
import { isAuthorized , checkCookie} from '../auth'

const router = express.Router()

router.get('/', (request, response) => {
    let token = jwt.sign({ "body": "stuff" }, "Slytherin", { algorithm: 'HS256'});
    // var cookieToken = {
    //     tokenType: "Bearer",
    //     token: token
    // }
    // console.log(JSON.stringify(cookieToken))
    response.cookie('JWT',token,{
        maxAge: 86400000,
        httpOnly: true
    })
    response.send({
        tokenType: "Bearer",
        token: token,
        csrf: request.csrfToken()
    });
})
router.get('/check', isAuthorized,(request, response) => {
    response.json({
        message: 'this is secret, do not share'
    });
})

router.post('/cookie', checkCookie, (request, response) => {
    response.json({
        message: 'hi cookie, hi csrf'
    })
})

router.post('/csrf', (request, response) => {
    response.json({
        message: 'hi csrf'
    })
})
router.get('/csrf', (request, response) => {
    response.json({
        message: 'hi get'
    })
})
export default router;