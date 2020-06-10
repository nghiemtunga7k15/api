const axios = require('axios');
/*----------- SERVICE -----------------*/
let serviceBuffVipEye = require('../../service/FVI/serviceBuffVipEye.js');
const serviceBuffEye = require('../../service/FVI/serviceBuffEye.js');
let serviceAdmin = require('../../service/Admin/');
const servicePayment = require('../../service/Payment');
/*------------ schema ------------------*/
const VipEye = require('../../schema/FVI/VipEye.js');

const tool   = require('../../tool/index.js');
module.exports = {
	create : async function(req, res, next) {
		try {
			let fb_id = tool.convertPageId(req.body.fb_id || 'not found');
			if (!fb_id) return res.status(400).json( {code : 400, message: 'ID không hợp lệ!'} );
			let check_order = await VipEye.findOne({status: {$in: [0, 1]}, fb_id: fb_id});
			if(check_order) return res.status(400).json({code: 400, message: 'Đơn hàng đã tồn tại!'});
			let adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'price_vip_eye');
			let timeOneDay = 60 * 60 * 24 * 1000;
			let dayExpired = new Date().getTime() + (timeOneDay * parseInt(req.body.time_vip_eye));
			let price = parseInt(adminSetup.price_vip_eye);

			let total_price_pay = parseInt(req.body.choose_option_eye) * parseInt(price) * parseInt(req.body.time_vip_eye);
			let data = {
				user_id: req.user.user_id,
				owner: req.user.name,
				fb_id: fb_id,
				name: req.body.name,
				choose_option_eye: req.body.choose_option_eye,
				time_vip_eye: req.body.time_vip_eye,
				total_price_pay: total_price_pay,
				note: req.body.note,
				time_create: new Date().getTime(),
				time_expired: dayExpired,
				link_fb: req.body.fb_id,
				resource_type: req.body.resource_type ? parseInt(req.body.resource_type) : 1,
				price_one_eye: price
			}
			let payment = await servicePayment.payment({
				token: req.token,
				description: `Mua dịch vụ vip mắt (gói ${req.body.choose_option_eye} mắt ${req.body.time_vip_eye} ngày)`,
				type_service: 'buff_eye',
				amount: total_price_pay
			});
			serviceBuffVipEye.save(data, function (err, doc) {
				if (err) {
					return res.status(400).json({ code: 400, ...err});
				} else {
					return res.json({ code: 200, data: doc });
				}
			})

		} catch(err) {
			err = typeof err == 'object' ? err : {status: false, message: 'Bad request', errors: err};
			return res.json({ code: 400, ...err });
		}
	},
	list : function(req, res, next) {
		let user_id = req.user.level != 99 ? req.user.user_id :  false ; 
		let _limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let status =   parseInt(req.query.status);
		let sort_name = req.query.sort_name;
		let sort_value = req.query.sort_value;
		let conditions = {};
		if(user_id) conditions['user_id'] = user_id;
		if(req.query.search) conditions['$text'] = {$search: req.query.search};
		if(status) conditions['status'] = status;

		serviceBuffVipEye.list( conditions , _limit , page , sort_name , sort_value  , function ( err , listBuffEye){
			if(err) {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : listBuffEye ,  page : page , limit : _limit, total: 0 } );

			}
		})
	},	
	order : function(req, res, next) {
		serviceBuffVipEye.order(function(err , detailOrder){
			if(err)  {
				return res.json( {code : 404 , data : { msg : 'Order Not Found'} } );
			} else {
				return res.json( {code : 200 , data : detailOrder } );
			}
		})
	},
	detail : function(req, res, next) {
		let idVipEye = parseInt(req.params.id);
		serviceBuffVipEye.detail( idVipEye ,function ( err , detailBuffEye){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : detailBuffEye } );
			}
		})
	},
	delete : function(req, res, next) {
		let idVipEye = parseInt(req.params.id);
		serviceBuffVipEye.delete( idVipEye ,function ( err , detailBuffEye){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : detailBuffEye } );
			}
		})
	},
	update : function(req, res, next) {
		let idVipEye = parseInt(req.params.id);
		let data = {};
		data.time_update = new Date().getTime();
		// console.log(req.body);
		if(req.body.fb_id){
			let id_post = tool.convertPageId(req.body.fb_id || 'not found');
			if (!id_post)	return res.json( {code : 400 , message: 'ID không hợp lệ' } );
			data.link_fb = req.body.fb_id;
			data.video_id = id_post;
			data.convert_fbid = 0;
		}
		if(req.body.note) data['note'] = req.body.note;
		serviceBuffVipEye.handleUpdateBuffVipEye(idVipEye, true, data, function (err, doc) {
			if (err) {
				return res.json({ code: 404, err: err });
			} else {
				return res.json({ code: 200, message: 'success', data: doc });
			}
		})
	},
	createVideo : async function(req, res, next) {
		let id_post;
		if (req.body.video_id) {
			id_post = tool.convertUrlToID(req.body.video_id);
		}else{
			return res.json( {code : 404 , data : { err : true , msg : 'ID Not Found'} } );
		}
		let data = { 
			video_id           : 		id_post	,
			owner              : 		req.body.owner,
			view               :		req.body.view,
			user_id            :        req.body.user_id,
			time_value         :		req.body.time_value,
			note               : 		req.body.note,
			id_vip             : 		req.body.id_vip,
			time_create        : 		new Date().getTime(),
			price_one_eye      :		0,
			total_price_pay    :		0
		}
		serviceBuffEye.save(data, function (err , api) {
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else { 
				return res.json( {code : 200 , data : api } );
			}
		})
	}
}  