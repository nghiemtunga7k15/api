const moment = require('moment-timezone'); 
const axios = require('axios');
/*----------- SERVICE -----------------*/
let serviceScanCommentOrder = require('../../service/ST/serviceScanCommentOrder.js');
let serviceListComment      = require('../../service/ST/serviceListComment.js');
let serviceAdmin = require('../../service/Admin/');
/*------------ MODAL ------------------*/
const ScanComment = require('../../schema/ST/ScanComment.js');
const CommentScanSuccess = require('../../schema/ST/CommentScanSuccess.js');

const tool   = require('../../tool/index.js');
module.exports = {
	create :  async function(req, res, next) {
		let id_post = false;
		let promise  =  serviceAdmin.getAdminSetup();
		if (req.body.fb_id) {
			id_post = tool.convertUrlToID(req.body.fb_id);
		}
		if(!id_post){
			return res.json( {code : 404 , err : { msg : 'Id fb không hợp lệ' } } );
		}
		let listOrder = await ScanComment.find({ fb_id: id_post });
		let exists;
		listOrder.forEach(obj => {
			if (obj.status != 3) {
				exists = true;
			}
		})
		let checkOrderUser = await ScanComment.findOne({ fb_id: id_post, user_id: req.user.user_id, time_stop: 0 });
		if (checkOrderUser && checkOrderUser.status != 5) {
			return res.json({ code: 404, err: { msg: 'Order Đã Tồn Tại' } });
		}
		if(req.type_user == 'userV1'){
			let timeOneDay  = 60 * 60 * 24 * 1000;
			let minutesOnDay = 60 * 24;
			let data = {
				fb_id: id_post,
				owner: req.user.full_name,
				user_id: req.user.user_id,
				name_fanpage: '',
				note: req.body.note,
				minutes: (parseInt(req.body.time) * minutesOnDay).toString(),
				time_create: new Date().getTime(),
				time_expired: new Date().getTime() + parseInt(req.body.time) * timeOneDay
			}
			data.status   =  listOrder.length > 0  ? 1 : 0;
			data.status   =  exists == true  ? 1 : 0;
			data.type     = req.body.type;

			serviceScanCommentOrder.save(data, function (err, api) {
				if (err) {
					return res.json({ code: 404, err: { msg: 'Thất Bại' } });
				} else {
					return res.json({ code: 200, data: api });
				}
			})
		} else{
			promise.then( success =>{
				let timeOneDay  = 60 * 60 * 24 * 1000;
				let minutesOnDay = 60 * 24;
				let data = { 
					fb_id              : 		id_post	,
					owner              : 		req.user.name,
					user_id            :        req.user.user_id,
					name_fanpage       :        '',
					note               :        req.body.note,
					minutes            :        (parseInt(req.body.time) *minutesOnDay).toString(),
					time_create        :		new Date().getTime(),
					time_expired       :        new Date().getTime() + parseInt(req.body.time) * timeOneDay
				}
				data.status   =     listOrder.length > 0  ? 1 : 0;
				data.status   =      exists == true  ? 1 : 0;
				data.total_price_pay = success[0].price_scan_cmt_start;
				data.price_pay = success[0].price_scan_cmt_start;
				data.type         = req.body.type;

				
				// let list_combo = success[0].list_combo_scan_cmt;
				// // Matching Combo
				// if (list_combo.length > 0 ) {
				// 	combo_matching = list_combo.filter(function (combo) {
				// 		return combo.name == req.body.type_order.toString().toUpperCase() ;
				// 	});							
				// 	data.type_order =  {
				// 		name          : combo_matching[0].name,
				// 		limit_post    : combo_matching[0].limit_post,
				// 		price_pay_buy : combo_matching[0].price_pay_buy,
				// 		price_pay_cmt : combo_matching[0].price_pay_cmt,
				// 	}	
				// 	data.status   =     listOrder.length > 0  ? 1 : 0;
				// 	data.status   =      exists == true  ? 1 : 0;
				// 	data.total_price_pay = combo_matching[0].price_pay_buy;
				// 	data.type         = req.body.type;
				// }
				

				// if (req.user.level == 3) {
				// 	serviceScanCommentOrder.getOrderByUser(req.user.user_id , function(err , orderUser){
				// 		if(err){
				// 			return res.json( {code : 404 , err : { msg : 'Lỗi Order Check User '} } );
				// 		} else if ( orderUser.length == 30 ) {
				// 			return res.json( {code : 404 , err : { msg : 'Order Limit 30'} } );
				// 		} else{
				// 			serviceScanCommentOrder.save(data, function (err , api) {
				// 				if(err)  {
				// 					return res.json( {code : 404 , err : { msg : 'Thất Bại'} } );
				// 				} else {  
				// 					let data_comment = {
				// 						fb_id              : 		id_post	,
				// 						time_create        :		new Date().getTime(),
				// 						status             :        listOrder.length ? 1 : 0,
				// 						user_id_current            :        12
				// 					} 
				// 					serviceListComment.save(data_comment , function(){
				// 						return res.json( {code : 200 , data : api } );
				// 					})
				// 				}
				// 			})
				// 		}
				// 	})
				// }else{
				// 	serviceScanCommentOrder.save(data, function (err , api) {
				// 				if(err)  {
				// 					return res.json( {code : 404 , err : { msg : 'Thất Bại'} } );
				// 				} else {  
				// 					let data_comment = {
				// 						fb_id              : 		id_post	,
				// 						time_create        :		new Date().getTime(),
				// 						status             :        listOrder.length ? 1 : 0,
				// 						user_id_current            :        12
				// 					} 
				// 					serviceListComment.save(data_comment , function(){
				// 						return res.json( {code : 200 , data : api } );
				// 					})
				// 				}
				// 	})
				// }

				axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`,  {
					amount: success[0].price_scan_cmt_start,
					description: `Mua dịch vụ scan comments`,
					type_service: 'scan_comment'
				})
				.then((response) => {
					serviceScanCommentOrder.save(data, function (err , api) {
						if (err) {
							return res.json({ code: 404, err: { msg: 'Thất Bại' } });
						} else {
							return res.json({ code: 200, data: api });
						}
					})
				})
				.catch( err => {
					return res.json(err.response.data);
				})
			})
			.catch(err=>{
				return res.json( {code : 404 , err : { msg : 'Admin Set Up ' } } );
			})
		}

	},
	list : function(req, res, next) {
		let _limit  =  req.query.limit ? parseInt(req.query.limit) : 20;
		let page    = req.query.page ? parseInt(req.query.page) : 1 ;
		let user_id =   ( req.user && req.user.user_id   ) ? req.user.user_id : null ; 
		let level =   ( req.user && req.user.level   ) ? req.user.level : 1 ; 
		if ( !user_id || user_id == null ) {
			return res.json( {code : 404 , data : { msg :" User Not Found"} } );
		}
		serviceScanCommentOrder.list( user_id ,  _limit , page , level , function ( err , listScanCmt){
			if(err) {
				return res.json( {code : 404 , data : [] } );
			} else {
				let conditions = parseInt(level) != 99 ? { user_id : user_id  , status : { $ne: 5 }  }  : { status : { $ne: 5 }};
				ScanComment.count(conditions, function( err, totalRecord){
   					if ( err ) {
   						return res.json( {code : 404 , data : [] } );
   					} else {
						return res.json( {code : 200 , data : listScanCmt ,  page : page , limit : _limit , total : totalRecord } );
   					}
				})
			}
		})
	},
	list_all : function(req, res, next) {
		serviceScanCommentOrder.list_all({
			device_scan: req.query.device_scan ? req.query.device_scan : 'default',
			status : 1
		}, function ( err , data){
			if(err) {
				return res.json( {code : 404 , data : { msg: 'Error' , err : err } } );
			} else {
				function getUnique(arr, comp) {
				  const unique = arr
				       .map(e => e[comp])
				    .map((e, i, final) => final.indexOf(e) === i && i)
				    .filter(e => arr[e]).map(e => arr[e]);
				   return unique;
				}
				data = (getUnique(data,'fb_id'));
				return res.json( {code : 200 , data : { msg: 'Success' , data : data } } );
			}
		})
	},
	detail : function(req, res, next) {
		let idScanCmt = parseInt(req.params.id);
		let text      = req.query.text ? req.query.text : '';
		let timeStart = req.query.time_start ? req.query.time_start : '' ;
		let timeEnd   = req.query.time_end ? req.query.time_end : '';
		let address   = req.query.address ? req.query.address : '';
		let arr = [];
		serviceScanCommentOrder.detail( true ,  idScanCmt ,function ( err , detailOrderScanCmt){
			if(err)  {
				return res.json( {code : 404 , data : { msg : 'Error' } } );
			} else {  		
				if(detailOrderScanCmt == null) {
						return res.json( {code : 404 , data : [] } );
				}
				let query ;
				if ( text.length > 0  ) {
					query = CommentScanSuccess.find( 
						{ 
						$and: [ 
							{ $text: { $search: `${text}` } },
							{ 'fb_id' : detailOrderScanCmt.fb_id },
							detailOrderScanCmt.time_stop != 0 ? 
								{ 'created_timestamp'  : 
									{
								        $gt:  parseInt(parseInt(detailOrderScanCmt.time_create) ),
								        $lt :  parseInt(detailOrderScanCmt.time_stop)
								    }
								}
								:  { created_timestamp : { $gt : parseInt(detailOrderScanCmt.time_create)  }
							},
							req.query.add_province ?	{ id_province :  `${req.query.add_province }` } : {},
							req.query.add_district ? 	{ id_district :  `${req.query.add_district}` } : {},
						]
					 } );
				}else if  (timeStart.length > 0 && timeEnd.length > 0  ){
					/*--------Time Start-----------*/
					timeStart = moment(`${timeStart}`).tz('Europe/Paris').format();
					timeStart = moment(timeStart).format("x"); // for milliseconds
					/*--------Time End-----------*/
					timeEnd  = moment(`${timeEnd}`).tz('Europe/Paris').format();
					timeEnd  = moment(timeEnd).format("x"); // for milliseconds
					query = CommentScanSuccess.find( 
						{
						$and: [ 
							{ 'fb_id' : detailOrderScanCmt.fb_id },
							{ 'created_timestamp' : { $gt : 0  } },
							{ 'created_timestamp'  : 
									{
								        $gt:  parseInt(parseInt(timeStart) ),
								        $lt:  parseInt(timeEnd)
							}},
							detailOrderScanCmt.time_stop != 0 ? 
								{ 'created_timestamp'  : 
									{
								        $gt:  parseInt(parseInt(detailOrderScanCmt.time_create) ),
								        $lt :  parseInt(detailOrderScanCmt.time_stop)
								    }
								}
								:  { created_timestamp : { $gt : parseInt(detailOrderScanCmt.time_create)  }
							},
							req.query.add_province ?	{ id_province :  `${req.query.add_province }` } : {},
							req.query.add_district ? 	{ id_district :  `${req.query.add_district}` } : {}
						]
						}
					)
				} else if (text.length > 0 && timeStart.length > 0 && timeEnd.length > 0) { 
					query = CommentScanSuccess.find( 
						{
						$and: [ 
							{ 'fb_id' : detailOrderScanCmt.fb_id },
							detailOrderScanCmt.time_stop != 0 ? 
								{ 'created_timestamp'  : 
									{
								        $gt:  parseInt(parseInt(detailOrderScanCmt.time_create) ),
								        $lt :  parseInt(detailOrderScanCmt.time_stop)
								    }
								}
								:  { created_timestamp : { $gt : parseInt(detailOrderScanCmt.time_create)  }
							},
							{ $text: { $search:  parseInt(text.length) > 0 ?  `${text}`   : '' } },
							{ 'created_timestamp' : { $gt : parseInt(timeStart) > 0 ?  parseInt(timeStart) :  0  } },
							{ 'created_timestamp' : { $lt : parseInt(timeEnd)   > 0 ?  parseInt(timeEnd) :  0  } },
							req.query.add_province ?	{ id_province :  `${req.query.add_province }` } : {},
							req.query.add_district ? 	{ id_district :  `${req.query.add_district}` } : {}
						]
						}
					)
				} else {
					query = CommentScanSuccess.find(
						{
							$and: [ 
								{ 'fb_id' : detailOrderScanCmt.fb_id },
								{ 'created_timestamp' : { $nin : 0  }  } , 
							 	req.query.add_province ?	{ id_province :  `${req.query.add_province }` } : {},
								req.query.add_district ? 	{ id_district :  `${req.query.add_district}` } : {},
								detailOrderScanCmt.time_stop != 0 ? 
								{ 'created_timestamp'  : 
									{
								        $gt:  parseInt(parseInt(detailOrderScanCmt.time_create) ),
								        $lt :  parseInt(detailOrderScanCmt.time_stop)
								    }
								}
								:  { created_timestamp : { $gt : parseInt(detailOrderScanCmt.time_create)  }
								}
							]
						}
					);
				}
				if ( detailOrderScanCmt.type == 'comment') {
					query =  CommentScanSuccess.find(
						{
							$and: [ 
								{ 'fb_id' : detailOrderScanCmt.fb_id },
								{ created_timestamp : { $gt : 0   }}
								
							]
						}
					);
				}
				query
				.exec(function(err, listPost){
						if (err ) {
							return res.json( {code : 404 , err : err } );
						}else{
							return res.json( 
									{code : 200 , 
										data :  {
											fb_id        : detailOrderScanCmt.fb_id,
											idScanCmt    : detailOrderScanCmt.idScanCmt,
											name_fanpage : detailOrderScanCmt.name_fanpage,
											total_post   : detailOrderScanCmt.total_comment,
											comment      : { result : listPost , page : 1  , limit :20 },
											log_time     : detailOrderScanCmt.log_time
										}
										
							} );
						}
				});		

			}
		})
	},
	updateTotalComment : async function(req , res , next ) {
		let fb_id = req.params.id.toString();
		let data  =  [] ;
		let jsonData = JSON.stringify(req.body);
		let arrData = JSON.parse(jsonData);
		let checkIdPost = await CommentScanSuccess.findOne({ fb_id  : fb_id});
		if( arrData.length != 0  && Array.isArray(arrData) == true  ) {

				arrData.forEach(detail=>{
					let object           = {};
					object["fb_id"]      = fb_id;
					object['comment_id'] = detail.comment_id;
					object['user_name']   = detail.user_name;
					object['user_id'] = detail.user_id;
					object['message'] = detail.message;
					object['like_count'] = detail.like_count;
					object['user_phone'] = detail.user_phone;
					object['phone_comment'] = detail.phone_comment;
					object['is_post'] = detail.is_post;
					object['is_page'] = detail.is_page;
					object['created_time'] = detail.created_time;
					object['created_timestamp'] = parseInt(detail.created_timestamp);
					object['time_scan'] = new Date().getTime();

					if ( checkIdPost ) {
						object['status'] = 1;
					}

					data.push(object);
				})
					serviceListComment.saveAll( data , function (err , success) {
						if (err) {
							return res.json( {code : 404 , err : err } );
						}else{
							let promise             = [];
							let promiseUpdateOrder  = [];
							serviceScanCommentOrder.listOrderPromise(fb_id).then( listOrder =>{
								if ( listOrder.length != 0 ){
								 	listOrder.forEach(obj=>{
								 		if ( obj.time_stop == 0 && obj.status != 3 && obj.type != 'comment'){
									 		promise.push(serviceListComment.listCommentById(obj.idScanCmt, fb_id ,  obj.time_create ));
								 		}else{
								 			promise.push(serviceListComment.listCommentById(obj.idScanCmt, fb_id ,  obj.time_create , true));
								 		}
								 	})
								 	Promise.all(promise).then(listDataOrder=>{
								 		listDataOrder.forEach(obj=>{
								 				promiseUpdateOrder.push(serviceScanCommentOrder.handleUpdatePromie(obj.idScanCmt , obj.totalPost));
								 		})
								 		Promise.all(promiseUpdateOrder).then( successUpdate => {
								 			return res.json( {code : 200 , data : { msg: 'Thanh cong' } } );
								 		})
								 		.catch(err=>{
								 			return res.json( {code : 404 , err : err } );
								 		})
								 	})
								 	.catch(err=>{
								 		return res.json( {code : 404 , err : { msg: 'Time Order' } } );
								 	})
								}else{
								 	return res.json( {code : 404 , err : { msg: 'Not Order Matching' } } );
								}
							})
							.catch(err=>{
								return res.json( {code : 404 , err : err } );
							})
						}
					})
		}else{
			return res.json( {code : 404 , err : { msg: 'Error' } } );
		}	
	},
	updateTotalCommentV2 : async function(req , res , next ) {
		let fb_id = req.params.id.toString();
		let data  =  [] ;
		let jsonData = JSON.stringify(req.body);
		let arrData = JSON.parse(jsonData);
		let checkIdPost = await CommentScanSuccess.findOne({ fb_id  : fb_id});
		let time_now = new Date().getTime();
		let comment_array_id = [];
		if( arrData.length != 0  && Array.isArray(arrData) == true  ) {
			arrData.forEach(detail => {
				let object = {};
				object["fb_id"] = fb_id;
				object['comment_id'] = detail.comment_id;
				object['user_name'] = detail.user_name;
				object['user_id'] = detail.user_id;
				object['message'] = detail.message;
				object['like_count'] = detail.like_count;
				object['user_phone'] = detail.user_phone;
				object['phone_comment'] = detail.phone_comment;
				object['is_post'] = detail.is_post;
				object['is_page'] = detail.is_page;
				object['created_time'] = detail.created_time;
				object['created_timestamp'] = parseInt(detail.created_timestamp);
				object['time_scan'] = time_now;

				if (checkIdPost) {
					object['status'] = 1;
				}
				
				data.push(object);
				comment_array_id.push(detail.comment_id);
			})
			serviceListComment.findAll({
				comment_id: {
					$in : comment_array_id
				}
			}, (err, list_comment_same) => {
				if(err) return res.json({ code: 400, err: err });
				list_comment_same.forEach((comment, i) => {
					if(comment_array_id.indexOf(comment.comment_id) != -1){
						data = data.splice(comment_array_id.indexOf(comment.comment_id), 1);
					}
				})
				if(data.length == 0){
					return res.json({ code: 200, data: { msg: 'Thanh cong' } });
				}
				serviceListComment.saveAll(data, function (err, success) {
					if (err) {
						return res.json({ code: 400, err: err });
					} else {
						// return res.json( {code : 200 , msg: 'Thanh cong' } );
						serviceScanCommentOrder.listOrderScanPayment(fb_id, function (err, orderScans) {
							if (err) {
								return res.json({ code: 400, data: { msg: 'That bai', err: err } });
							}
							let promise = [];
							let promisePayment = [];
							let promiseUpdate = [];
							//promise danh sách order đang scan
							orderScans.forEach((order, i) => {
								promise.push(serviceListComment.CommentPayment(order, fb_id, order.payment_end));
							})
							
							Promise.all(promise).then((orderPromise) => {
								orderPromise.forEach((order, i) => {
									promiseUpdate.push(serviceScanCommentOrder.updatePayment(order.order.idScanCmt, {
										$inc: {
											total_comment: order.total
										},
										payment_end: time_now,
										// time_update: new Date().getTime()
									}))	
								})
								Promise.all(promiseUpdate).then((success) => {
									return res.json({ code: 200, msg: 'Thanh cong' });
								}).catch((err) => {
									return res.json({ code: 200, msg: 'That bai', err: err });
								})
								//lấy setup giá 
								// serviceAdmin.getAdminSetup().then((setUpAdmin) => {
								// 	orderPromise.forEach((order, i) => {
								// 		// thanh toán
								// 		promisePayment.push(new Promise((resolve, reject) => {
								// 			axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment`, {
								// 				amount: parseInt(setUpAdmin[0].price_scan_cmt_success) * order.total,
								// 				description: `Thanh toán ${order.total} comments từ dịch vụ scan comments (Id post : ${fb_id})`,
								// 				customer_id: order.order.user_id
								// 			}, {
								// 				headers: {
								// 					authorizations: 'a18ff78e7a9e44f38de372e093d87ca1'
								// 				}
								// 			})
								// 			.then(function(response) {
								// 				resolve({
								// 					order_id: order.order.idScanCmt,
								// 					total: order.total,
								// 					...response.data
								// 				});
								// 			})
								// 			.catch( err => {
								// 				resolve({
								// 					order_id: order.order.idScanCmt,
								// 					total: order.total,
								// 					...err.response.data
								// 				});
								// 			})
								// 		}))
								// 	})
	
								// 	Promise.all(promisePayment).then((data) => {
								// 		// update sau khi thanh toan
								// 		data.forEach((data, i) => {
								// 			if(data.code == 200){
								// 				promiseUpdate.push(serviceScanCommentOrder.updatePayment(data.order_id, {
								// 					$inc: {
								// 						total_comment: data.total,
								// 						total_price_pay: data.payment.total_amount
								// 					},
								// 					payment_end: time_now,
								// 					time_update: new Date().getTime()
								// 				}))
								// 			} else if(data.code == 400){
								// 				promiseUpdate.push(serviceScanCommentOrder.updatePayment(data.order_id, {
								// 					status: 3,
								// 					time_update: new Date().getTime()
								// 				}))
								// 			} else{
								// 				return res.json( {code : 400 , err : { msg: 'Da co loi xay ra' } } );
								// 			}
								// 		})
								// 		Promise.all(promiseUpdate).then((success) => {
								// 			return res.json( {code : 200 , msg: 'Thanh cong' } );
								// 		}).catch((err) => {
								// 			return res.json( {code : 200 , msg: 'That bai', err: err } );
								// 		})
								// 	}).catch((err) => {
								// 		return res.json( {code : 400 , err : { msg: 'Not payment', err: err } } );
								// 	})
								// }).catch((err) => {
								// 	return res.json( {code : 400 , err : { msg: 'Not setup admin', err: err } } );
								// })
							})
						})
					}
				})
			})
		} else{
			serviceScanCommentOrder.listOrderScanPayment(fb_id, function (err, orderScans) {
				if (err) {
					return res.json({ code: 400, data: { msg: 'That bai', err: err } });
				}
				return res.json({ code: 200, data: { msg: 'Thanh cong' } });
			})
		}	
	},
	order : async  function (req , res , next ) {

		function checkOrderCancel () {
			return new Promise(function(resolve, reject) { 
				let exists  = false ;
				let stop_id ;
					serviceScanCommentOrder.getOrderCancel(function(err , orderCancel){
						if (orderCancel || orderCancel != null) {
							serviceScanCommentOrder.listOrderPromise(orderCancel.fb_id).then(listOrder =>{
								listOrder.forEach(obj=>{
									if ( obj.status != 3 ) {
										exists = true;
									}
								})
								if ( exists == false ) {
									serviceScanCommentOrder.handleUpdateMany(orderCancel.fb_id , false , function (err , success){});
									resolve(orderCancel.fb_id);
								} else {
									reject(false);
								}
							})
						}else{
							reject(false);
						}
					})
			});	
		}

		serviceScanCommentOrder.getListComment({
			device_scan: req.query.device_scan ? req.query.device_scan : 'default',
			status: 1
		}, function(err , data){
	
			if(err || data == null || !data || data.length == 0) {
				checkOrderCancel().then(postId=>{
					return res.json( {code : 200 ,  data :  { post_id : null  , stop_id : postId } } );	
				})
				.catch(err=>{
					return res.json( {code : 200 ,  data :  { post_id : null  , stop_id : null } } );	
				})
			}else{
				serviceScanCommentOrder.handleUpdateMany(data.fb_id , true ,async function(err , success) {
					if ( err ) {
						return res.json( {code : 404 , data : { msg : 'Update Error' } } );
					} else {
						checkOrderCancel().then(postId=>{
							return res.json( {code : 200 , data :  { post_id : data.fb_id  , type : data.type , stop_id : postId }   } );
						})
						.catch(err=>{
							return res.json( {code : 200 , data :  { post_id : data.fb_id  , type : data.type, stop_id : null }   } );
						})
					}
				})
			}
			
		})
	},
	delete :  function (req , res , next ) { 
		let idScanCmt = parseInt(req.params.id);
		serviceScanCommentOrder.delete( idScanCmt ,  function(err , success) {
					if ( err ) {
						return res.json( {code : 404 , err : err } );
					} else {
						return res.json( {code : 200 , data :  success   } );
					}
		})
	},
	list_phone : function (req , res , next ) {
		serviceListComment.getlistPhone().then(listPhone=>{
			if ( !listPhone || listPhone == null || listPhone.length == 0) {
				return res.json( {code : 200 , data :   { list_phone  : null  , id : null } });
			}
			return res.json( {code : 200 , data :   listPhone });
		})
		.catch(err=>{
			return res.json( {code : 404 , data :   { list_phone  : null  , id : null } } );
		})
	},
	updateLogTime : function (req , res , next) {
		let idScanCmt = parseInt(req.params.id);
		let data =  {};
		serviceScanCommentOrder.detail( true , idScanCmt , function (err , detail) {
			if ( err ) {
				return res.json( {code : 404 , err : err } );
			} else {
				let obj =  { } ;
				if ( detail ) {
					obj.total_post = detail.total_comment;
				}
				obj.log_time  = new Date().getTime();
				if ( detail ) {
					data.log_time = detail.log_time.concat(obj);
				}
				serviceScanCommentOrder.handleUpdateLogTime(idScanCmt ,data , function(err , success) {
					if ( err ) {
						return res.json( {code : 404 , err : err } );
					}else {
						return res.json( {code : 200 , data :  { msg : 'Thành Công'} } );
					}
				} )
			}
		})
	},
	updateOrder : function (req , res , next) {
		let idScanCmt = parseInt(req.params.id);
		let data =  req.body;
		serviceScanCommentOrder.handleUpdateLogTime(idScanCmt, data, function (err, success) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, data: { msg: 'Thành Công' } });
			}
		})
	},
	updateAddrees  : function (req , res , next) {
		let fb_id = parseInt(req.params.id);
		let dataArr = []
		let promise = [];
		if( Array.isArray(req.body) == true) {
		 	dataArr = JSON.stringify(req.body);
			dataArr = JSON.parse(dataArr);
		}else{
			dataArr = [];
		}
		dataArr.forEach(obj=>{
			let data = {};
			data["id_province"]   = obj.province.id   ? obj.province.id  : '';
			data["id_district"]   = obj.district.id   ? obj.district.id  : '';
			data["address_post"]  = {
				add_full          : obj.address         ? obj.address       : '',
				add_county        : obj.province.name   ? obj.province.name : '',
				add_district      : obj.district.name   ? obj.district.name : ''
			}
			promise.push(serviceListComment.handleUpdateAddress( obj.idx  , fb_id, data));
		})
		Promise.all(promise).then(success=>{
			return res.json( {code : 200 , data : { msg : 'Thành Công'} } );
		})
		.catch(err =>{
			return res.json( {code : 404 , data : { msg : 'Error'} } );
		})
	},
	list_comment : function (req , res , next) { 
		serviceListComment.listCommentSuccess(function (err, data)  {
			if ( err ) {
						return res.json( {code : 404 , err : err } );
					}else {
						return res.json( {code : 200 , data :  data } );
			}
		})
	},
	search_owner : function(req, res, next) {
		let key_search = req.query.id;
		serviceScanCommentOrder.search_owner( key_search ,function ( err , data){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : data } );
			}
		})
	},
	detailV2 : function(req, res, next) {
		let limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let idScanCmt = parseInt(req.params.id);
		let text      = req.query.text ? req.query.text : '';
		let timeStart = req.query.time_start ? req.query.time_start : '' ;
		let timeEnd   = req.query.time_end ? req.query.time_end : '';
		let address   = req.query.address ? req.query.address : '';
		let arr = [];
		serviceScanCommentOrder.detail( true ,  idScanCmt ,function ( err , detailOrderScanCmt){
			if(err)  {
				return res.json( {code : 404 , data : { msg : 'Error' } } );
			} else {  		
				if(detailOrderScanCmt == null) {
						return res.json( {code : 404 , data : [] } );
				}
				let query = {
					fb_id: detailOrderScanCmt.fb_id,
					// time_scan: {
					// 	$lte: detailOrderScanCmt.payment_end
					// }
				};
				// if(detailOrderScanCmt.time_stop){
				// 	query['time_scan'] = {
				// 		$lte: detailOrderScanCmt.time_stop
				// 	}
				// }
				if(req.query.add_province){
					query['id_province'] = req.query.add_province
				}
				if(req.query.add_district){
					query['id_district'] = req.query.add_district
				}
				if ( text.length > 0  ) {
					query['$text'] = { $search: `${text}` };
				}
				if (timeStart.length > 0 && timeEnd.length > 0  ){
					/*--------Time Start-----------*/
					timeStart = moment(`${timeStart}`).tz('Europe/Paris').format();
					timeStart = moment(timeStart).format("x"); // for milliseconds
					/*--------Time End-----------*/
					timeEnd  = moment(`${timeEnd}`).tz('Europe/Paris').format();
					timeEnd  = moment(timeEnd).format("x"); // for milliseconds
					query['created_timestamp'] = {
						$gt:  parseInt(timeStart),
						$lt:  parseInt(timeEnd)
					}
				}
				console.log(query);
				CommentScanSuccess.find(query).limit(limit).skip((limit * page) - limit).sort({
					created_timestamp: -1
				}).exec(function(err, listPost){
						if (err ) {
							return res.json( {code : 404 , err : err } );
						}else{
							return res.json({
								code: 200,
								data: {
									fb_id: detailOrderScanCmt.fb_id,
									idScanCmt: detailOrderScanCmt.idScanCmt,
									name_fanpage: detailOrderScanCmt.name_fanpage,
									total_post: detailOrderScanCmt.total_comment,
									comment: { result: listPost, page: page, limit: limit },
									log_time: detailOrderScanCmt.log_time
								}
							});
						}
				});		

			}
		})
	},
	listAll : (req, res) => {
		let limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let query = {
			scan_phone: {
				$ne: 1
			}
		};

		if(limit > 100) return res.json({code: 400, message: 'max limit 100'});

		CommentScanSuccess.find(query).limit(limit).skip((limit * page) - limit).sort({
			created_timestamp: -1
		}).exec(function(err, docs){
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({
					code: 200,
					data: { 
						result: docs,
						page: page, 
						limit: limit
					}
				});
			}
		});		
	},
	updateMany: (req, res) => {
		let jsonData = JSON.stringify(req.body);
		let arrData = JSON.parse(jsonData);
		if(arrData.length > 0){
			CommentScanSuccess.updateMany({
				comment_id: {
					$in: arrData
				}
			}, {
				$set: {
					scan_phone: 1
				}
			}, (err, success) => {
				if(err) return res.json({ code: 404, err: err });
				return res.json({code: 200, message: 'success'});
			})
		} else{
			return res.json({code: 200, message: 'Not data update'});
		}
	}
}  