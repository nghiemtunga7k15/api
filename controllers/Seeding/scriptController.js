const modelOrderSeedingCmt = require('../../schema/Seeding');
const modelScriptSeedingCmt = require('../../schema/Seeding/scriptComment');

module.exports = {
	list: async (req, res) => {
		let limit = req.query.limit ? parseInt(req.query.limit) : 12;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let skip = page > 1 ? (limit * page) - limit : 0;
		var find = {
			// status: {
			// 	$ne : 3
			// }
		};

		if(req.query.id_order){
			find['id_order'] = req.query.id_order;
		}
		if(req.query.post_id){
			find['id_post'] = req.query.post_id;
		}
		if(req.query.parent_id){
			find['parent_id'] = req.query.parent_id;
		}

		let total = await modelScriptSeedingCmt.find(find).count();
		let data = await modelScriptSeedingCmt.find(find).skip(skip).limit(limit).sort({
			time_create: 1,
			order: 1
		}).exec();

		let result = {
			'data' : data,
			'total' : total,
			'page' : page,
			'last_page' : Math.ceil(total / limit),
			'limit' : limit
		}
		res.send(result);
	},
	list_scan: async (req, res) => {
		try {
			let limit = req.query.limit ? parseInt(req.query.limit) : 12;
			var find = {
				content: {
					$ne: ''
				},
				status: {
					$in: [0, 1]
				},
				$or: [
					{
						parent_id: 0,
						last_time_get: {
							$lte: new Date().getTime() - 60 * 1000 * 1
						}
					},
					{
						parent_id: {
							$ne : 0
						},
						parent_cmt_id_on_fb: {
							$nin : [null, '']
						},
						last_time_get: {
							$lte: new Date().getTime() - 60 * 1000 * 1
						}
					}
				]
			};
			let docs = await modelScriptSeedingCmt.find(find).limit(limit).sort({
				last_time_get : 1,
				order: 1
			})
			let bulkWrite = [];
			docs.forEach(async (item, i) => {
				bulkWrite.push({
					"updateOne": {
						"filter": { id_script_seeding_cmt: item.id_script_seeding_cmt },
						"update": { $set: {
							status: 1,
							last_time_get: new Date(),
							$inc: {
								count_get: 1
							}
						} }
					}
				})
			})
			if(bulkWrite.length > 0){
				let update = await modelScriptSeedingCmt.bulkWrite(bulkWrite);
			}
			return res.json({
				code: 200,
				data: docs,
				total: docs.length
			})
		} catch (err) {
			console.log(err);
			return res.status(400).json({code: 400, message: 'bad request', error: err});
		}
	},
	check_user: async (req, res) => {
		modelScriptSeedingCmt.findOne({
			uid_fb_cmt: req.query.uid_fb_cmt,
			id_post: req.query.id_post
		}).exec((err, doc) => {
			if(err){
				return res.json({
					code: 400,
					err: err
				})
			}
			var results = {
				code: 200,
				status: true
			}
			if(doc){
				results['status'] = false;
			}
			return res.json(results)
		})
	},
	check_cmt_script: async (req, res) => {
		modelOrderSeedingCmt.findOneAndUpdate({
			status: 1,
			$where : "this.num_post <= this.scan_post_seeding"
		}, {
			last_time_use: new Date()
		}).sort({
			last_time_use: 1
		}).exec(async (err, doc) => {
			let results = {code: 200, message: 'success'};
			if(err){
				results = {code: 400};
				results['message'] = err;
			}

			if(doc){
				var script_order = await modelScriptSeedingCmt.findOne({
					id_order: doc.id_order_seeding_cmt,
					status: {
						$in: [0, 1]
					}
				})
				if(!script_order){
					doc.status = 3;
					doc.time_done = new Date().getTime();
					doc.save();
				}
			}
			return res.json(results);
		})
	},
	update: async (req, res) => {
		var data = {};
		if(req.body.status){
			data['status'] = req.body.status;
		}
		if(req.body.result_id_cmt_on_fb){
			data['result_id_cmt_on_fb'] = req.body.result_id_cmt_on_fb;
		}
		if(req.body.last_cmt_time){
			data['last_cmt_time'] = req.body.last_cmt_time;
		}
		if(req.body.uid_fb_cmt){
			data['uid_fb_cmt'] = req.body.uid_fb_cmt;
		}

		modelScriptSeedingCmt.findOneAndUpdate(
        {
            id_script_seeding_cmt: req.params.id_script
        }, data).exec((err, doc) => {
			let results = {code: 200};
			if(err){
				results = {code: 400};
				if(err.errmsg){
					results['message'] = err.errmsg;
				}
			}
			if(doc && req.body.parent_id == 0 && req.body.result_id_cmt_on_fb){
				modelScriptSeedingCmt.updateMany({
					parent_id: doc.id_script_seeding_cmt
				}, {
					parent_cmt_id_on_fb: req.body.result_id_cmt_on_fb
				}).exec((err, docs) => {
					if(err){
						results = {code: 400};
						if(err.errmsg){
							results['message'] = err.errmsg;
						}
					}
					return res.json(results);
				})
			} else{
				return res.json(results);
			}
		})
	}
}