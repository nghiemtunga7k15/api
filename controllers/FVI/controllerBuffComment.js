const axios = require('axios');
/*----------- SERVICE -----------------*/
let serviceBuffComment = require('../../service/FVI/serviceBuffComment.js');
let serviceAdmin = require('../../service/Admin/');
/*------------ MODAL ------------------*/
const BuffComment = require('../../schema/FVI/BuffComment.js');
const FaceBookUser = require('../../schema/FaceBookUser.js');
const serviceUser_V2 = require('../../service/User_v2/index.js');

const tool   = require('../../tool/index.js');
module.exports = {
	create : function(req, res, next) {
		let id_post;
		if (req.body.video_id) {
			id_post = tool.convertUrlToID(req.body.video_id);
		}else{
			return res.json( {code : 404 , data : { err : true , msg : 'ID Not Found'} } );
		}
		let promise  =  serviceAdmin.getAdminSetup();
				promise.then(success=>{
					let price;
					if ( parseInt(req.body.type_buff) == 0 ) {
						price = success[0].price_comment_randum;
					} else {  
						price = success[0].price_comment_choose;
					}; 

					let comments = req.body.comments.toString();

					let arrComment  = comments.split(";");
					let data = { 
						user_id              :      req.user.user_id,
						owner                : 		req.user.full_name,
						video_id             :		id_post ,
						type_buff            :		req.body.type_buff ,   // 1 Chọn ngẫu nhiên   0 Chọn từ User
						price                :		price ,                //  Chọn ngẫu nhiên  price = 10   0 Chọn từ User price = 15
						comments             : 		arrComment ,	
						comments_count       : 		arrComment.length ,	
						total_price_pay      : 		parseInt(arrComment.length) * parseInt(price),
						time_type            : 		req.body.time_type ,	
						time_value           : 		req.body.time_value ,	
						note                 : 		req.body.note ,	
						status               :      req.body.status,
						comment_max          :      success[0].comment_max,
						time_create          : 		new Date().getTime() ,
						time_done            : 		req.body.time_done ,	
						time_update          : 		req.body.time_update ,
						resources_cookie     :      req.body.resources_cookie,
						gender_cookie        :      req.body.gender_cookie,
					}
					// serviceUser_V2.payment(req.user.email, parseInt(arrComment.length) * parseInt(price), function (err, success) {
					// 	if (err) {
					// 		res.json({ code: 404, data: { err: err, msg: 'User Pay False' } });
					// 	} else {
					// 		serviceBuffComment.save(data, function (err, api) {
					// 			if (err) {
					// 				return res.json({ code: 404, err: err });
					// 			} else {
					// 				return res.json({ code: 200, data: api });
					// 			}
					// 		})
					// 	}
					// })
					axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`,  {
						amount: parseInt(arrComment.length) * parseInt(price),
						description: `Mua dịch vụ buff comment livestreams (${arrComment.length} comments)`,
						type_service: 'buff_comment'
					})
					.then((response) => {
						serviceBuffComment.save(data, function (err, api) {
							if (err) {
								return res.json({ code: 404, err: err });
							} else {
								return res.json({ code: 200, data: api });
							}
						})
					})
					.catch( err => {
						return res.json(err.response.data);
					})
				})
				.catch( err =>{
					return res.json( {code : 404 , data : { err : err , msg : 'Admin Set Up'} } );
				})
	},
	list : function(req, res, next) {
		let _limit = req.query.limit ?  parseInt(req.query.limit) : 20;
		let page = req.query.page ?  parseInt(req.query.page) : 1;
		let user_id = req.user.level != 99 ? req.user.user_id :  false ; 
		serviceBuffComment.list( user_id ,_limit , page , function ( err , listBuffEye){
			if(err) {
				return res.json( {code : 404 , data : [] } );
			} else {
				BuffComment.count({user_id : user_id}, function( err, totalRecord){
   					if ( err ) {
   						return res.json( {code : 404 , data : [] } );
   					} else {
						return res.json( {code : 200 , data : listBuffEye ,  page : page , limit : _limit , total : totalRecord } );
   					}
				})

			}
		})
	},
	order : function(req, res, next) {
		serviceBuffComment.order(function ( err , orderDetail) {
			if ( err ) {
   				return res.json( {code : 404 , err : err } );
   			} else {
				return res.json( {code : 200 , data : orderDetail } );
   			}
		})
	},
	detail : function(req, res, next) {
		let id = parseInt(req.params.id);
		serviceBuffComment.detail( id ,function ( err , detailBuffEye){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : detailBuffEye } );
			}
		})
	},
	update : function(req, res, next) {
		let idVideo  = parseInt(req.params.id);
		let promise  =  serviceAdmin.getAdminSetup();
		promise.then(success=>{
			let price;
			if ( parseInt(req.body.type_buff) == 0 ) {
				price = success[0].price_comment_choose;
			} else {  
				price = success[0].price_comment_randum;
			};

			if ( !req.body.type_buff ) {
				price = 10;
			}

			if(req.body.status == 2){
				req.body.time_done = new Date().getTime();
			}
			let data = req.body;

			if ( req.body.comments_count ) {
				data.total_price_pay = parseInt(req.body.comments_count) * price;
			}

			if ( req.body.comments ) {
				let comments = req.body.comments.toString();
				let arrComment  = comments.split(";");
				data.comments  = arrComment
			}
			data.time_update = new Date().getTime();
			
			serviceBuffComment.handleUpdate( idVideo , data , true ,function ( err , updateSuccess){
				if(err)  {
					return res.json( {code : 404 , data : err } );
				} else {
					return res.json( {code : 200 , data : { msg : 'Success'} } );
				}
			})
		})
		.catch(e=>{
				return res.json( {code : 404 , data : { msg : 'Thất Bại'} } );
		})
	},
	delete : function(req, res, next) {
		let id = parseInt(req.params.id);
		serviceBuffComment.delete( id ,function ( err , detailBuffEye){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : detailBuffEye } );
			}
		})
	},
	search : function(req, res, next) {
		let key_search = req.query.id;
		serviceBuffComment.search( key_search  ,function(err,data) {
	   		if(err){
	   			return res.json( {code : 404 , err : err } );
	   		}else{
	   			return res.json( {code : 200 , data : data } );
	   		}
   		})	
	},
	search_owner : function(req, res, next) {
		let key_search = req.query.id;
		serviceBuffComment.search_owner( key_search  ,function(err,data) {
	   		if(err){
	   			return res.json( {code : 404 , err : err } );
	   		}else{
	   			return res.json( {code : 200 , data : data } );
	   		}
   		})	
	},
	updateV2 : function(req, res, next) {
		if(req.body.status == 2){
			req.body.time_done = new Date().getTime();
		}
		let data = req.body;
		let idVideo  = parseInt(req.params.id);
		
		data.time_update = new Date().getTime();
		serviceBuffComment.handleUpdate(idVideo, data, false, function (err, updateSuccess) {
			if (err) {
				return res.json({ code: 404, data: err });
			} else {
				return res.json({ code: 200, data: { msg: 'Success' } });
			}
		})
	}
}  