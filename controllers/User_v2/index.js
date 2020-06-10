const jwt = require('jsonwebtoken');
const User_v2 = require('../../schema/User_v2/index.js');
const bcrypt = require('bcrypt');
const request = require('request');
const requestify = require('requestify');
const crypto = require('crypto');
const sha256 = require('sha256');
const tool   = require('../../tool/index.js');
const fs     = require('fs');
const localStorage = require('localStorage');
const ejs = require('ejs');
const url = require('url');
/*----------- SERVICE -----------------*/
let serviceUser_V2 = require('../../service/User_v2/index.js');
let servicePayment = require('../../service/User_v2/payment.js');
let testBaoKim = require('../../schema/TestBaoKim.js');

/*  Sử dụng dữ liệu trả về dạng hmac256 để thực hiện thanh toán (chỉ duy nhất thanh toán) */
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
/*  Sử dụng dữ liệu trả về dạng hmac256 để thực hiện login , register ... */
function decryptionTokenLoginRegister(){
	let TOKEN_EXPIRE = 86400 * 1000;
	let data  = {
		iat : new Date().getTime(),
		jti : '',
		iss : `${process.env.API_KEY_BK}`,
		nbf : new Date().getTime() ,
		exp : new Date().getTime()  + TOKEN_EXPIRE,
		form_params : [
		]
	}
	let token = jwt.sign(data, `${process.env.API_SECRET_BK}`, { algorithm: 'HS256'});
	return token;
}
module.exports = {
	register :  (req, res) => {
		let token = decryptionTokenLoginRegister();
		let data = { 
				email         : req.body.email,
				name          : req.body.name,
				phone         : req.body.phone,
				password      : bcrypt.hashSync(`${req.body.password}`, 10),
				level         : req.body.level ? req.body.level  : 1, 
				// full_name     : req.body.full_name,
				// sex           : req.body.sex,
				// time_create   : new Date().getTime()
		}
		if ( parseInt(req.body.level) == 2 ) {
			if ( req.user.level != 99 ) {
				return res.status(401).json({code: 401, message: 'Unauthorized user!' });
			}
		}  
		requestify.post(`${process.env.BAO_KIM_URL}/auth/api/v4/user/register-v2?jwt=${token}`, {
	  		email         : req.body.email,
			name          : req.body.name,
			phone         : req.body.phone,
			password      : req.body.password,
		}) 
	    .then(function(response) {
	    	if (JSON.parse(response.body).code == 0 ) {
	    		data.user_id = JSON.parse(response.body).data.id;
	    		serviceUser_V2.save(data , function (err , sucess) {
	    			if (err) {
	    				return res.json({ code: 404, err: err });
	    			}else {
	    				return res.json({ 
	    					code: 200, 
	    					data : JSON.parse(response.body) , 
	    					token : jwt.sign({ 
				      			email: req.body.email, 
				      			level: req.body.level ? req.body.level  : 1, 
				      			full_name:  req.body.full_name,
				      		}, 'RESTFULAPIs')
				      });
	    			}
	    		})
	    	}else{
	    		return res.json({ code: 404, err: JSON.parse(response.body)  });
	    	}
	    })
	    .catch(err=>{
	    	return res.json({ code: 404, err: err });

	    })
	  
	},
	login : (req , res ) => {
		let token = decryptionTokenLoginRegister();
		let url =  Buffer.from(`${process.env.URL_SUCCESS}`).toString('base64');
		requestify.post(`${process.env.BAO_KIM_URL}/auth/api/v4/user/login?jwt=${token}`, {
       			username      : req.body.username,
		    	password      : req.body.password,
		    	client_secret : `${process.env.CLIENT_SECRET}`,
		    	client_id     : `${process.env.Client_id}`,
		    	grant_type    : 'password'

	    })
	    .then(function(response) {
			let json_response = JSON.parse(response.body);
	    	if (json_response.code != 0) {
	    		return res.json({ code: 404, err: json_response });
			}
			let email = json_response.data.email ? json_response.data.email : '';
	    	serviceUser_V2.detail({email : email} , function (err , user) {
	    		if ( err ) {
	    			return res.json({ code: 400, err:  err});
	    		} else{
					if(!user){
						let data = { 
							user_id       : json_response.data.id,
							email         : json_response.data.email,
							name          : json_response.data.name,
							phone         : json_response.data.phone.replace(/^84/g, '0'),
							password      : bcrypt.hashSync(`${req.body.password}`, 10),
							level         : 1,
						}
						serviceUser_V2.save(data , function (err , user) {
							if (err) {
								return res.json({ code: 404, err: err });
							}else {
								return res.json({ 
									code: 200, 
									url : `https://vnid.net/sso?ticket=${json_response.data.ticket}&return_url=${url}`,
									data : {
										user  : user,
										data_bao_kim  : json_response.data,
										token 	: jwt.sign({ 
										email     : user.email, 
										level     : user.level ? user.level  : 1, 
										name      : user.name,
										phone     : user.phone,
										balance   : user.balance,
										user_id   : user.user_id  
										}, 'RESTFULAPIs'),
									}
								 });	
							}
						})
					} else{
						return res.json({ 
							code: 200, 
							url : `https://vnid.net/sso?ticket=${json_response.data.ticket}&return_url=${url}`,
							data : {
								user  : user,
								data_bao_kim  : json_response.data,
								token 	: jwt.sign({ 
									email     : user.email, 
									level     : user.level ? user.level  : 1, 
									name      : user.name,
									phone     : user.phone,
								  balance   : user.balance,
								  user_id   : user.user_id  
								}, 'RESTFULAPIs'),
							}
						 });	
					}
	    		}
	    	})
	    })
	    .catch(err=>{
	    	return res.json({ code: 404, err: err });
	    })
	},
	// Tạo thanh toán từ User 
	order_pay :  (req , res ) => {
		let token = decryptionToken();
		let data = {
			mrc_order_id   : req.body.mrc_order_id,
			total_amount   : req.body.total_amount,
			description    : req.body.description,
			url_success    : req.body.url_success,
			webhooks       : `${process.env.WEBHOOKS}`,
			bpm_id         : req.body.bpm_id,
			customer_email : req.body.customer_email,
			customer_phone : req.body.customer_phone,
		}
		requestify.post(`${process.env.BAO_KIM_URL}/payment/api/v4/order/send?jwt=${token}`, data)
	    .then(function(response) {
	      	 return res.json({ code: 200, data: JSON.parse(response.body) });
	    })
	    .catch(err=>{
	    	return res.json({ code: 404, err: err });
	    })
	},
	// Cấp cho bảo kim để thực hiện thanh toán 
	webhooks_bao_kim : ( req , res ) =>{
		let json = JSON.stringify(req.body);
		json     = JSON.parse(json);
		let sign = json.sign;
		delete json["sign"];
		json = JSON.stringify(json);

		function fixedHex(number, length){
			var str = number.toString(16).toUpperCase();
			while(str.length < length)
				str = "0" + str;
			return str.toLowerCase();
		}
		
		function unicodeLiteral(str){
			var i;
			var result = "";
			for( i = 0; i < str.length; ++i){
				if(str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
					result += "\\u" + fixedHex(str.charCodeAt(i),4);
				else
					result += str[i];
			}
		
			return result;
		}

    	function escapeRegExp(str) {
		 	return str.replace(/[/]/g, "\\\/");
		}
	  	function signHmacSha256(key, str) {
			let hmac = crypto.createHmac("sha256", key);
			let signed = hmac.update(str).digest("hex");
			return signed
		}
	 	// let data_sign = (json);
		data_sign = escapeRegExp(json);
		let sign_key = signHmacSha256(`${process.env.API_SECRET}`, unicodeLiteral(data_sign));

		if ( sign == sign_key ) {
			json     = JSON.parse(json);
			let data = {};
			data.user_id        = json.txn.user_id;
			data.mrc_order_id   = json.order.mrc_order_id;
			data.total_amount   = json.txn.total_amount;
			data.fee_amount     = json.txn.fee_amount;
			data.description    = json.txn.description;
			data.amount         = json.txn.amount;
			data.customer_name  = json.order.customer_name;
			data.customer_email = json.order.customer_email;
			data.customer_phone = json.order.customer_phone;
			data.time_create    = new Date().getTime();
			servicePayment.save( data , function (err, api) {
		      if (err) return	 res.status(404).json({ err_code: 2, message: "Pay False" });
		      	let dataUser = {};
		      	dataUser.balance = json.txn.amount;
				serviceUser_V2.update(json.order.customer_email  , dataUser , function (err , success) {
					if (err) return	 res.json({ err_code: 2, message: 'Pay False' });
					else{
						return res.json({ err_code: 0 , message: 'Pay Success' });
					}
				} )
			});
		}else{
			return res.json({ err_code: 2, message: 'Pay False Sign' });
		}
	},
	list_payment : ( req , res ) =>{
		servicePayment.list(function(err , data) {
			if (err) return	 res.json({ code: 404, data : { err: err }  });
			return res.json({ code: 200, data: data });
		})
	},
	check_login : ( req , res ) =>{
		res.send('Login Success');
	},
	// Lấy ra list Bank
	list_bank :  (req , res ) => {
		let token = decryptionTokenLoginRegister();
		requestify.get(`${process.env.BAO_KIM_URL}/payment/api/v4/bpm/list?jwt=${token}`)
	    .then(function(response) {
	      	 return res.json({ code: 200, data: JSON.parse(response.body) });
	    })
	    .catch(err=>{
	    	return res.json({ code: 404, err: err });
	    })
	},
	// Thực hiện login một lần 
	sso_callback : ( req , res ) =>{
		let token = decryptionTokenLoginRegister();
		let authorization_code = req.query.authorization_code ? req.query.authorization_code : '';	
		requestify.post(`${process.env.BAO_KIM_URL}/auth/oauth/token?jwt=${token}`, {
       			grant_type       : 'authorization_code',
		    	redirect_uri     : `${process.env.URL_SSO_CALLBACK}`,
		    	// redirect_uri     : `http://devapi.hacklike.biz/api/sso_callback`,
		    	client_secret    : `${process.env.CLIENT_SECRET}`,
		    	client_id        : `${process.env.Client_id}`,
		    	code             :  authorization_code
	    })
	    .then(function(response) {
	    	let  json     = JSON.parse(response.body);
	    	let access_token = json.access_token;
		    requestify.request(`${process.env.BAO_KIM_URL}/auth/api/v4/user/detail?jwt=${token}`, {
			    method: 'GET',
			    headers: {
			        'Authorization': `Bearer ${access_token}`
			    },	
			})
			.then(function(response) {
				let data = {};
				data.token  =  access_token;
				let api = new testBaoKim(data);
				api.save(function (err, api) {
			     	if (err) return res.json({ code: 404, err: err });
			     	// Set Login User 
			     	res.cookie('access_token', access_token , { maxAge: 86400 * 1000  });
			     	res.cookie('is_login', true , { maxAge: 86400 * 1000  });
    				function url_vnp() {
					    return url.format({
					        protocol: `${process.env.URL_VNP}/url-callback?access_token=${access_token}`,
					    });
					}
					return res.redirect(url_vnp());
	    		})
			})
			.catch(err=>{
				return res.json({ code: 404, err: err });
			})
		})
	    .catch(err=>{
	    	return res.json({ code: 404, err: { msg : "authorization_code require"} });
	    })
	},	
	// update : function ( req , res ) {
	// 	let data = JSON.stringify(req.body);
	// 	data     = JSON.parse(data);
	// 	let email = req.user.email;
	// 	serviceUser_V2.update( email  , data , function (err , success) {
	// 				if (err) return	 res.json({ code: 404, data : { err : err } });
	// 				else{
	// 					return res.json({ code: 200 , data : { msg : 'Success'} });
	// 				}
	// 	})
	// },
	// check_active : function ( req , res ) {
	// 	let code_user    = req.params.id;
	// 	serviceUser_V2.update_active_user( code_user, function (err , success) {
	// 		if (err) return	 res.json({ code: 404, data : { err : err } });
	// 		else{
	// 			return res.json({ code: 200 , data : { msg : 'Success'} });
	// 		}
	// 	})
	// },
	detail : function (req , res ) {
		let email = req.user.email;
		serviceUser_V2.detail( {  email : email }   , function (err , user) {
			if (err) return	 res.json({ code: 404, data : { err : err } });
			else{
				return res.json({ code: 200 , data : user });
			}
		})
	},	
	validate_token : function (req , res ) {
		let token =  req.query.token;
		jwt.verify(token, 'RESTFULAPIs',async function(err, decode) {
			if ( decode && decode != undefined && !err){
           		return res.json({ code: 200 , data :  { user : decode , msg : "Success" } });
			}else {
				return res.json({ code: 404 , data :  { err  : err    , msg : "User Not Found" }} );
			}
        });
	},	 
	// Lấy ra thông tin khi login thành công face/gg 
	get_user_facebook : function (req , res ) {
		let token = decryptionTokenLoginRegister();
		let access_token =  req.query.access_token ?  req.query.access_token : '';
		requestify.request(`${process.env.BAO_KIM_URL}/auth/api/v4/user/detail?jwt=${token}`, {
			    method: 'GET',
			    headers: {
			        'Authorization': `Bearer ${access_token}`
			    },	
		})
		.then(function(response) {
			let json = JSON.parse(response.body);
			return res.json({ code: 200 , data : { user : json , msg : 'Success'} });
		})
		.catch(err=>{
			console.log('API Bao KIM Sai auth/api/v4/user/detail')
			return res.json({ code: 404, err: err });
		})
	}
}
