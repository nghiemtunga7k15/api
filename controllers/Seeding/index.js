const mongoose = require('mongoose');

const modelOrderSeedingCmt = require('../../schema/Seeding');
const modelScriptSeedingCmt = require('../../schema/Seeding/scriptComment');
const serviceAdmin = require('../../service/Admin');

const axios = require('axios');
const tool   = require('../../tool/index.js');

module.exports = {
	add: async (req, res) => {
		try{
			let adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'price_seeding_cmt');
			var data = req.body;
			var links = data.links && Array.isArray(data.links) ? data.links : data.links ? JSON.parse(data.links) : [];
			data.links = links;
			var script_cmt  = data.script_cmt ? data.script_cmt.replace(/\n|^\s/g, "").slice(data.script_cmt.indexOf("-")).split('-') : [];
			// console.log(links);
			// return res.json({code: 200})
			if(links.length == 0 || script_cmt.length == 0){
				return res.json({code: 400, message: 'Dữ liệu không hợp lệ!'});
			}

			var script_cmt_arr = [];
			var num_cmt = 0;

			script_cmt.map((item, i) => {
				let arr_cmt = item.split("+");
				let data_reply = [];
				if (arr_cmt.length > 1) {
					data_reply = arr_cmt.slice(1, arr_cmt.length);
				}
				if (arr_cmt[0].trim(' ') != "") {
					script_cmt_arr.push({
						comment: arr_cmt[0].trim(),
						reply: data_reply
					})
					num_cmt += data_reply.length + 1
				}
			});
			data['script_cmt_arr'] = script_cmt_arr;
			data['num_scripts'] = script_cmt_arr.length;
			data['num_cmt'] = num_cmt;
			data['time_create'] = Date.now();
			data['user_vnp'] = {
				name: req.user_vnp.name,
				user_id: req.user_vnp.user_id
			};
			data['total_price_pay'] = adminSetup.price_seeding_cmt * num_cmt * links.length;
			data['price_one_cmt'] = adminSetup.price_seeding_cmt;
			let payment = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
				amount: data['total_price_pay'],
				description: `Mua dịch vụ seeding (${num_cmt} cmt)`,
				type_service: 'seeding'
			});

			let doc = await modelOrderSeedingCmt.create(data);
			return res.json({
				code: 200,
				message: 'success',
				data: doc
			})

		} catch (err) {
			err = err.response && err.response.data ? err.response.data.err : err;
			return res.status(400).json({ code: 400, message: 'Không thể tạo đơn', errors: err});
		}
	},
	update: async (req, res) => {
		try{
			var data = {};
			if(req.body.note){
				data['note'] = req.body.note;
			}
			if(req.body.status){
				data['status'] = req.body.status;
			}
			if(req.body.scan_post_seeding){
				data['scan_post_seeding'] = req.body.scan_post_seeding;
			}
			if(req.body.post_ids && Array.isArray(req.body.post_ids)){
				data['$addToSet'] = {
					post_ids: {$each: req.body.post_ids}
				};
			}

			let order = await modelOrderSeedingCmt.findOneAndUpdate({id_order_seeding_cmt: req.params.id_order}, data);
			if(order && Array.isArray(req.body.post_ids) && req.body.post_ids.length > 0 && order.script_cmt_arr.length > 0){
				let data_comment = []
				req.body.post_ids.forEach((post_id, i) => {
					for(let i = 0; i < order.script_cmt_arr.length; i++){
						data_comment.push({
							id_post: post_id,
							content: order.script_cmt_arr[i]['comment'],
							id_order: order.id_order_seeding_cmt,
							user_vnp: order.user_vnp,
							order: i,
							resources_cookie: order.resources_cookie,
							gender_cookie: order.gender_cookie
						})
					}
				});
				let resutls = await modelScriptSeedingCmt.create(data_comment, {
					ordered: true
				});
				let data_reply = [];
				resutls.forEach((item, i) => {
					let reply = order.script_cmt_arr[item.order]['reply'];
					for(let ii = 0 ; ii < reply.length; ii++){
						data_reply.push({
							parent_id: item.id_script_seeding_cmt,
							id_post: item.id_post,
							content: reply[ii],
							id_order: order.id_order_seeding_cmt,
							order: ii,
							user_vnp: order.user_vnp,
							resources_cookie: order.resources_cookie,
							gender_cookie: order.gender_cookie
						})
					}
				})
				if(data_reply.length > 0){
					await modelScriptSeedingCmt.create(data_reply, {
						ordered: true
					});
				}
			}
			return res.json({code: 200, message: 'success'});
		} catch (err) {
			console.log(err);
			return res.status(400).json({
				code: 400,
				message: 'bad request',
				errors: err
			});
		}
	},
	list: async (req, res) => {
		let limit = req.query.limit ? parseInt(req.query.limit) : 12;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let skip = page > 1 ? (limit * page) - limit : 0;
		let sort = {
			time_create: -1
		}
		let option = {};
		var find = {
			status: {
				$ne : 5
			}
		};
		if(req.user_vnp.level != 99){
			find['user_vnp'] = {
				user_id: req.user_vnp.user_id
			}
		}
		if(req.query.keyword){
			find['$text'] = {
				$search: req.query.keyword
			}
			option = {
				score: { $meta : 'textScore' }
			};
			sort = {
			  score: { $meta : 'textScore' }
			};
		}
		let total = await modelOrderSeedingCmt.find(find, option).count();
		let data = await modelOrderSeedingCmt.find(find, option).skip(skip).limit(limit).sort(sort).exec();

		let result = {
			'data' : data,
			'total' : total,
			'page' : page,
			'last_page' : Math.ceil(total / limit),
			'limit' : limit
		}
		return res.json(result);
	},
	remove: async (req, res) => {
		var data = await modelOrderSeedingCmt.findOneAndUpdate({id_order_seeding_cmt : req.query.id}, {status: 3});
		return res.send({
            code: 200,
            message: 'Success'
        });
	},
	list_scan: async (req, res) => {
		var data = modelOrderSeedingCmt.findOneAndUpdate({
			$or: [
				{
					status: 0
				},
				{
					status: 1,
					$where : "this.num_post > this.scan_post_seeding",
					$or: [
						{
							count_get: {$gte: 10},
							last_time_use: {
								$lte: new Date().getTime() - 60 * 1000 * 60 * 24
							}
						},
						{
							count_get: {$lt: 10},
							last_time_use: {
								$lte: new Date().getTime() - 60 * 1000 * 3
							}
						}
					]
				}
			]
		}, {
			status: 1,
			last_time_use: new Date() ,
			$inc: {
                count_get: 1
            }
		}).sort({
			last_time_use: 1
		}).select({
			links: 1,
			post_id: 1,
			script_cmt: 1,
			id_order_seeding_cmt: 1,
			last_time_use: 1,
			time_delay_cmt: 1,
			num_cmt: 1,
			num_post: 1,
			keyword: 1,
			scan_post_seeding: 1,
			post_ids: 1,
			script_cmt_arr: 1
		}).exec((err, doc) => {
			if(err){
				return res.send({
					code: 400,
					data: err
				});
			}
			return res.send({
				code: 200,
				data: doc
			});
		})
	},
	add_scripts: async (req, res) => {
		var data = modelOrderSeedingCmt.findOneAndUpdate({
			$or: [
				{
					status: 1,
					last_time_use: {
						$lte: new Date().getTime() - 3000
					},
					scan_post_seeding: {
						$gt : 0
					},
				}
			]
		}, {
			last_time_use: new Date(),
			status: 2
		}).sort({
			last_time_use: 1
		}).select({
			links: 1,
			post_id: 1,
			script_cmt: 1,
			id_order_seeding_cmt: 1,
			last_time_use: 1,
			time_delay_cmt: 1,
			num_cmt: 1,
			num_post: 1,
			keyword: 1,
			scan_post_seeding: 1,
			post_ids: 1,
			script_cmt_arr: 1
		}).exec((err, doc) => {
			if(err){
				return res.send({
					code: 400,
					data: err
				});
			}

			return res.send({
				code: 200,
				data: doc
			});
		})
	},
	detail: async(req, res) => {
		var find_data = {};
		find_data['id_order_seeding_cmt'] = req.query.id_order;

		var data = await modelOrderSeedingCmt.findOne(find_data);

		res.send({code: 200, data: data});
	},
	delete: async(req, res) => {
		modelOrderSeedingCmt.findOneAndUpdate({
			id_order_seeding_cmt: req.params.id_order
		}, {
			status: 5
		}).then((doc) => {
			return res.json({
				code: 200,
				message: 'Success'
			});
		}).catch((err) => {
			let results = {
				code: 400,
				message: 'Bad request'
			};
			if(err.errmsg){
				results['message'] = err.errmsg;
			}
			return res.json(results);
		});
	}
}