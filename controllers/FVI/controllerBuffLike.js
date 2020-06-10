const axios = require('axios');
/*----------- SERVICE -----------------*/
let serviceBuffLike = require('../../service/FVI/serviceBuffLike.js');
let serviceAdmin = require('../../service/Admin/');
/*------------ MODAL ------------------*/
const BuffLike = require('../../schema/FVI/BuffLike.js');
const FaceBookUser = require('../../schema/FaceBookUser.js');
const serviceApiPartner = require('../../service/Autofb');

const tool = require('../../tool/index.js');
module.exports = {
	create: async function (req, res, next) {
		let id_post;
		if (req.body.video_id) {
			id_post = tool.convertUrlToID(req.body.video_id);
		}
		if(!id_post) return res.json({
			code: 404,
			data: {
				err: true,
				msg: 'ID Not Found'
			}
		});
		let typeBuff = req.body.type_buff ? req.body.type_buff.toString() : '';
		let arrBuff = typeBuff.split(";");
		let like = arrBuff[0] && arrBuff[0] != '' ? parseInt(arrBuff[0]) : 0;
		let love = arrBuff[1] && arrBuff[1] != '' ? parseInt(arrBuff[1]) : 0;
		let haha = arrBuff[2] && arrBuff[2] != '' ? parseInt(arrBuff[2]) : 0;
		let wow = arrBuff[3] && arrBuff[3] != '' ? parseInt(arrBuff[3]) : 0;
		let sad = arrBuff[4] && arrBuff[4] != '' ? parseInt(arrBuff[4]) : 0;
		let angry = arrBuff[5] && arrBuff[5] != '' ? parseInt(arrBuff[5]) : 0;
		let quantity = like + love + haha + wow + sad + angry;
		if (!quantity) return res.status(400).json({
			code: 400,
			data: {
				err: 'Dữ liệu không hợp lệ'
			}
		});
		try {
			type_service = req.body.type_service ? req.body.type_service : 2;
			if(type_service == 2){
				let check_fb = await BuffLike.findOne({video_id: id_post, status: {$ne: 5}});
				if(check_fb) return res.json( {code : 400 , message: 'Fb id đã tồn tại' } );
			}

			let adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'price_like');
			let total_price = quantity * parseInt(adminSetup.price_like);
			let data = {
				video_id: id_post,
				owner: req.user.full_name,
				type_buff: {
					like: like,
					love: love,
					haha: haha,
					wow: wow,
					sad: sad,
					angry: angry,
				},
				user_id: req.user.user_id,
				quantity: quantity,
				price: adminSetup.price_like,
				total_price_pay: total_price,
				time_type: req.body.time_type,
				time_value: req.body.time_value,
				note: req.body.note,
				status: req.body.status,
				time_create: new Date().getTime(),
				time_done: req.body.time_done,
				time_update: req.body.time_update,
				resources_cookie: req.body.resources_cookie ? parseInt(req.body.resources_cookie) : 1,
				gender_cookie: req.body.gender_cookie,
				type_service: type_service,
			}
			if (parseInt(req.body.resources_cookie) == 3) {
				if (quantity < 50 || quantity > 10000) {
					return res.status(400).json({
						code: 400,
						message: `Min 50 Max 10k`
					});
				}
				if (quantity % 50 != 0) {
					return res.status(400).json({
						code: 400,
						message: 'Chỉ Được Mua like Là Bội số Của 50'
					});
				}
				data['status'] = 2;
				if (process.env.PRODUCTION != 'dev') {
					let doc = await serviceApiPartner.createBuff(`t=buy-buff-like&id=${id_post}&other=vn&sllike=${quantity}&camxuc=LIKE`);
				}
			}
			if(parseInt(req.body.resources_cookie) != 2){
				await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
					amount: total_price,
					description: `Mua dịch vụ buff cảm xúc (${quantity} cảm xúc)`,
					type_service: 'buff_like'
				});
			} else {
				data['total_price_pay'] = 0;
			}
			let doc = await BuffLike.create(data);
			return res.json({code: 200, message: 'success', data: doc});

		} catch (err) {
			console.log(err);
			err = err.response && err.response.data ? err.response.data.err : err;
			return res.json({
				code: 400,
				message: err
			});
		}
	},
	list: function (req, res, next) {
		let _limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let user_id = req.user.level != 99 ? req.user.user_id : false;
		serviceBuffLike.list(user_id, _limit, page, function (err, listBuffEye) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				BuffLike.count({
					user_id: user_id
				}, function (err, totalRecord) {
					if (err) {
						return res.json({
							code: 404,
							err: err
						});
					} else {
						return res.json({
							code: 200,
							data: listBuffEye.length > 0 ? listBuffEye : [],
							total: totalRecord,
							limit: _limit,
							page: page
						});
					}
				})
			}
		})
	},
	order: function (req, res, next) {
		serviceBuffLike.order(function (err, detail) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				if (detail != null) {
					// tool.getListToken( 1 , parseInt(detail.quantity)  , 2)
					// .then(response=>{
					// 	let cookies = JSON.parse(response.body).data;
					// 			return res.json( {code : 200 , data : detail , cookies : cookies  } );	
					// })
					// .catch(err=>{
					// 	return res.json( {code : 404 ,err : err  } );
					// })
					return res.json({
						code: 200,
						data: detail
					});
				} else {
					return res.json({
						code: 200,
						data: null
					});
				}
			}
		})
	},
	update: function (req, res, next) {
		let idLike = parseInt(req.params.id);
		let promise = serviceAdmin.getAdminSetup();
		promise.then(success => {
				let data = req.body;
				if (req.body.type_buff) {
					let typeBuff = req.body.type_buff.toString();
					let arrBuff = typeBuff.split(";");
					let like = arrBuff[0] && arrBuff[0] != '' ? parseInt(arrBuff[0]) : 0;
					let love = arrBuff[1] && arrBuff[1] != '' ? parseInt(arrBuff[1]) : 0;
					let haha = arrBuff[2] && arrBuff[2] != '' ? parseInt(arrBuff[2]) : 0;
					let wow = arrBuff[3] && arrBuff[3] != '' ? parseInt(arrBuff[3]) : 0;
					let sad = arrBuff[4] && arrBuff[4] != '' ? parseInt(arrBuff[4]) : 0;
					let angry = arrBuff[5] && arrBuff[5] != '' ? parseInt(arrBuff[5]) : 0;
					let quantity = like + love + haha + wow + sad + angry;
					data.type_buff = {
						like: like,
						love: love,
						haha: haha,
						wow: wow,
						sad: sad,
						angry: angry,
					}
					data.quantity = quantity;
					data.total_price_pay = parseInt(success[0].price_like) * parseInt(quantity);
				}

				data.time_update = new Date().getTime();
				if (req.body.status == 2) {
					data.time_done = new Date().getTime();
				}
				// console.log(data);
				serviceBuffLike.handleUpdate(idLike, data, true, function (err, updateSuccess) {
					if (err) {
						return res.json({
							code: 404,
							data: {
								msg: 'Thất Bại'
							}
						});
					} else {
						return res.json({
							code: 200,
							data: {
								msg: 'Thành Công'
							}
						});
					}
				})
			})
			.catch(e => {
				return res.json({
					code: 404,
					data: {
						msg: 'Thất Bại'
					}
				});
			})
	},
	detail: function (req, res, next) {
		let idLike = parseInt(req.params.id);
		serviceBuffLike.detail(idLike, function (err, detail) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				return res.json({
					code: 200,
					data: detail
				});
			}
		})
	},
	delete: function (req, res, next) {
		let idLike = parseInt(req.params.id);
		serviceBuffLike.delete(idLike, function (err, detail) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				return res.json({
					code: 200,
					data: detail
				});
			}
		})
	},
	search: function (req, res, next) {
		let key_search = req.query.id;
		serviceBuffLike.search(key_search, function (err, data) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				return res.json({
					code: 200,
					data: data
				});
			}
		})
	},
	search_owner: function (req, res, next) {
		let key_search = req.query.id;
		serviceBuffLike.search_owner(key_search, function (err, data) {
			if (err) {
				return res.json({
					code: 404,
					err: err
				});
			} else {
				return res.json({
					code: 200,
					data: data
				});
			}
		})
	},
}