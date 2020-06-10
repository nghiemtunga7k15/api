const axios = require('axios');
/*----------- SERVICE -----------------*/
const serviceBuffEye = require('../../service/FVI/serviceBuffEye.js');
const serviceAdmin = require('../../service/Admin/');
/*------------ MODAL ------------------*/
const BuffEye = require('../../schema/FVI/BuffEye.js');
const FaceBookUser = require('../../schema/FaceBookUser.js');
const serviceUser_V2 = require('../../service/User_v2/index.js');
const serviceApiPartner = require('../../service/Autofb');

const tool = require('../../tool/index.js');
module.exports = {
	create: async function (req, res, next) {
		let id_post;
		if (req.body.video_id) {
			id_post = tool.convertUrlToID(req.body.video_id);
		} else {
			return res.json({ code: 404, data: { err: true, msg: 'ID Not Found' } });
		}
		let promise = serviceAdmin.getAdminSetup();
		promise.then(success => {
			let data = {
				video_id: id_post,
				owner: req.user.name ? req.user.name : '',
				view: req.body.view,
				price_one_eye: success[0].price_one_eye,
				user_id: req.user.user_id,
				total_price_pay: parseInt(success[0].price_one_eye) * parseInt(req.body.view),
				time_type: req.body.time_type,
				time_value: req.body.time_value,
				note: req.body.note,
				id_vip: req.body.id_vip,
				status: req.body.status,
				view_max: success[0].view_max,
				time_create: new Date().getTime(),
				time_done: req.body.time_done,
				time_update: req.body.time_update,
				last_time_check: req.body.last_time_check,
				resource_type: req.body.resource_type ? parseInt(req.body.resource_type) : 1
			}
			// serviceUser_V2.payment(req.user.email  , parseInt(success[0].price_one_eye) * parseInt(req.body.view) , function (err , success) {
			// 		if (err) { 
			// 		 	res.json( {code : 404 , data : {err : err , msg : 'User Pay False'} } ); 
			// 		}else{
			// 			serviceBuffEye.save(data, function (err , api) {
			// 				if(err)  {
			// 					return res.json( {code : 404 , err : err } );
			// 				} else { 
			// 					return res.json( {code : 200 , data : api } );
			// 				}
			// 			})
			// 		}
			// })
			axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
				amount: parseInt(success[0].price_one_eye) * parseInt(req.body.view),
				description: `Mua dịch vụ buff mắt (${req.body.view} mắt)`
			})
				.then(function (response) {
					serviceBuffEye.save(data, function (err, api) {
						if (err) {
							return res.json({ code: 400, err: err });
						} else {
							return res.json({ code: 200, data: api });
						}
					})
				})
				.catch(err => {
					return res.json(err.response.data);
				})
		})
			.catch(e => {
				return res.json({ code: 404, data: { err: err, msg: 'Admin Set Up' } });
			})
	},
	list: function (req, res, next) {
		let _limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let status = req.query.status ? req.query.status : '';
		let sort_name = req.query.sort_name;
		let sort_value = req.query.sort_value;
		let user_id = req.user.level != 99 ? req.user.user_id : false;
		let key_search = req.query.search ? req.query.search : '';
		let conditions = {};
		if (user_id) conditions['user_id'] = user_id;
		if (key_search) conditions['$text'] = { $search: key_search };
		if (status) conditions['status'] = status;

		serviceBuffEye.list(conditions, _limit, page, sort_name, sort_value, function (err, listBuffEye) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, data: listBuffEye, page: page, limit: _limit, total: 0 });
			}
		})
	},
	update: function (req, res, next) {
		let id = parseInt(req.params.id);
		let data = {
			time_update: new Date().getTime()
		};
		if (req.body.note) data['note'] = req.body.note;
		if (req.body.status) data['status'] = parseInt(req.body.status);

		serviceBuffEye.handleUpdateBuffEye(id, data, function (err, updateSuccess) {
			if (err) {
				return res.json({ code: 404, data: { msg: 'Thất Bại' } });
			} else {
				return res.json({ code: 200, data: { msg: 'Success' } });
			}
		})
	},
	order: function (req, res, next) {
		serviceBuffEye.order(function (err, order) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				if (order == null) {
					return res.json({ code: 200, data: null });
				}
				return res.json({ code: 200, data: order });
				// tool.getListToken( 1 , order.view  , 1)
				// 	.then(response=>{
				// 		let cookies = JSON.parse(response.body).data;
				// 		return res.json( {code : 200 , data : order , cookies : cookies  } );	
				// 	})
				// 	.catch(err=>{
				// 		return res.json( {code : 404 ,err : err  } );
				// 	})
			}
		})
	},
	detail: function (req, res, next) {
		let id = parseInt(req.params.id);
		serviceBuffEye.detail(id, function (err, detailBuffEye) {
			if (err) {
				return res.json({ code: 404, data: [] });
			} else {
				return res.json({ code: 200, data: detailBuffEye });
			}
		})
	},
	delete: function (req, res, next) {
		let id = parseInt(req.params.id);
		serviceBuffEye.delete(id, function (err, updateSuccess) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, data: { msg: 'Thành Công ' } });
			}
		})
	},
	search: function (req, res, next) {
		let key_search = req.query.id ? req.query.id : '';
		serviceBuffEye.search(key_search, function (err, data) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, data: data });
			}
		})
	},
	search_owner: function (req, res, next) {
		let key_search = req.query.id ? req.query.id : '';
		serviceBuffEye.search_owner(key_search, function (err, data) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, data: data });
			}
		})
	},
	scan_buff_eye: function (req, res, next) {
		serviceBuffEye.scan_buff_eye(function (err, data) {
			if (err) {
				return res.json({ code: 404, data: [] });
			} else {
				return res.json({ code: 200, data: data });
			}
		})
	},
	fb_user: function (req, res, next) {
		let _limit = parseInt(req.query.limit);
		let page = parseInt(req.query.page);
		let status = req.query.status ? parseInt(req.query.status) : 1;
		if (!_limit || _limit == null) {
			_limit = 20;
		}
		if (!page || page == null) {
			page = 1;
		}
		FaceBookUser.find({ status: status }).sort({ last_time_use: 1 })
			.limit(_limit)
			.skip((_limit * page) - _limit)
			.exec(function (err, data) {
				if (err) {
					return res.json({ code: 404, data: [] });
				} else {
					FaceBookUser.count({}, function (err, totalRecord) {
						if (err) {
							return res.json({ code: 404, data: [] });
						} else {
							return res.json({ code: 200, data: data, page: page, limit: _limit, total: totalRecord });
						}
					})
				}
			})
	},
	updateV2: function (req, res, next) {
		let video_id = parseInt(req.params.video_id);
		let data = req.body;
		data.time_update = new Date().getTime();
		serviceBuffEye.handleUpdateBuffEyeV2(video_id, req.body, function (err, updateSuccess) {
			if (err) {
				return res.json({ code: 404, data: { msg: 'Thất Bại' } });
			} else {
				return res.json({ code: 200, data: { msg: 'Success' } });
			}
		})
	},
	checkBuffEye: function (req, res, next) {
		serviceBuffEye.scan_buff_eye(function (err, docs) {
			if (err) {
				return res.json({ code: 400, data: { msg: 'Thất Bại', err: err } });
			} else {
				return res.json({ code: 200, data: docs });
			}
		})
	},
	partnerTest: async function (req, res, next) {
		let id_post;
		if (req.body.video_id) {
			id_post = tool.convertUrlToID(req.body.video_id);
		}
		if (!id_post) {
			return res.json({ code: 400, data: { err: true, msg: 'Id không hợp lệ' } });
		}
		try {
			let adminSetup = await serviceAdmin.getAdminSetup();
			let view = req.body.view ? parseInt(req.body.view) : 0;
			let price_one_eye = parseInt(adminSetup[0].price_one_eye);
			let total_price = price_one_eye * view;
			let time_buff = req.body.time_buff ? parseInt(req.body.time_buff) : 0;
			if (req.body.type_service_buff == 2) {
				if (time_buff < 30 || time_buff > 240) {
					return res.status(400).json({ code: 400, message: 'Min 30 Max 240 Phút' });
				}
				if (view < 50 || view > 4000) {
					return res.status(400).json({ code: 400, message: 'Min 50 Max 4000 mắt xem' });
				}
				if (view % 50 != 0) {
					return res.status(400).json({ code: 400, message: 'Chỉ Được Mua Số Mắt Là Bội Của 50' });
				}
				price_one_eye = adminSetup[0].price_eye_time;
				total_price = price_one_eye * view * time_buff;
			}
			let data = {
				video_id: id_post,
				owner: req.user.name ? req.user.name : '',
				view: req.body.view,
				price_one_eye: price_one_eye,
				user_id: req.user.user_id,
				total_price_pay: total_price,
				time_type: req.body.time_type,
				time_value: req.body.time_value,
				note: req.body.note,
				id_vip: req.body.id_vip,
				// view_max: adminSetup[0].view_max,
				time_create: new Date().getTime(),
				time_done: req.body.time_done,
				time_update: req.body.time_update,
				last_time_check: req.body.last_time_check,
				resources_cookie: req.body.resources_cookie ? parseInt(req.body.resources_cookie) : 1,
				type_service_buff: req.body.type_service_buff ? parseInt(req.body.type_service_buff) : 1,
				time_buff: time_buff
			}
			if(data['resources_cookie'] != 2){
				let payment = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
					amount: total_price,
					description: `Mua dịch vụ buff mắt (${view} mắt)`,
					type_service: 'buff_eye'
				});
			} else {
				data['total_price_pay'] = 0;
			}
			if (req.body.type_service_buff == 2) {
				// let order = await serviceApiPartner.createBuff(`t=buy-buff-live&id=${id_post}&slmat=${view}&timer=${data['time_buff']}`);
				data['status'] = 1;
				data['time_start'] = new Date().getTime();
			}
			serviceBuffEye.save(data, function (err, doc) {
				if (err) {
					return res.json({ code: 400, err: err });
				} else {
					return res.json({ code: 200, data: doc });
				}
			})
		} catch (err) {
			err = err.response && err.response.data ? err.response.data.err : err;
			return res.json({ code: 400, message: err });
		}

	}
}  