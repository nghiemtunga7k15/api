var app = require('express');
var router = app.Router();
const modelUser = require('../schema/User/User');
const Userv2 = require('../schema/User_v2/');
const jwt = require("jsonwebtoken");
var indexRouter = require('./index.js');
const requestify = require('requestify');

function decryptionToken(){
  let TOKEN_EXPIRE = 86400 * 1000;
  let data  = {
    iat : new Date().getTime(),
    jti : '',
    iss : `${process.env.API_KEY}`,
    nbf : new Date().getTime() ,
    exp : new Date().getTime()  + TOKEN_EXPIRE,
    form_params : [
    ]
  }
  let token = jwt.sign(data, `${process.env.API_SECRET}`, { algorithm: 'HS256'});
  return token;
}

//header user
router.use(async function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    req.user = undefined;
    req.token = undefined;
    req.type_get_api = undefined;
    req.type_user = 'userV1';
    // Sử dụng trong tài khoản bảo kim
    if (req.headers && req.headers.authorizations) {
      req.type_user = 'userBaoKim';
        if (req.headers && req.headers.authorizations && req.headers.authorizations.split(' ')[0] === 'JWT') {
          var email = "";
          jwt.verify(req.headers.authorizations.split(' ')[1], 'RESTFULAPIs',async function(err, decode) {
            if (err) req.user = undefined;
            email = decode.email;
            req.user = decode;
            req.user_vnp = decode;
            req.token = req.headers.authorizations.split(' ')[1];
          });
          // req.user = await Userv2.findOne({email: email});
          
        }
        else {
          req.user = undefined;
          if ( (req.headers.authorizations == `${process.env.TOKEN_DEFAULT}` ) || req.query.authorizations == `${process.env.TOKEN_DEFAULT}` ) {
            req.user  = true;
          } 
        }
        next();
    } else{
      // Đây là code sử dụng trong user phiên bản 1 , chưa có tài khoản Bảo Kim , khi đã tích hợp Bảo Kim đoạn code này có thể xóa đi 
        if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
          var email = "";
          jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs',async function(err, decode) {
            if (err) req.user = undefined;
            if ( decode == undefined ) req.user = undefined
            if ( decode &&  decode != undefined ) email = decode.email;
          });
          // req.user = await Userv2.findOne({email: email});
          req.user = await modelUser.findOne({email: email});
        }
        else {
          req.user = undefined;
          if ( (req.headers.authorization == `${process.env.TOKEN_DEFAULT}` ) || req.query.authorization == `${process.env.TOKEN_DEFAULT}` ) {
            req.user  = true;
            req.type_get_api = 'service'
          } 
        }
        if (req.cookies && req.cookies.is_login && req.cookies.is_login == 'true'  ) {
            req.user  = true;
        }
        next();
    }

});

//index
router.use('/api', indexRouter);

module.exports = router;
