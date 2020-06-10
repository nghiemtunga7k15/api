const VipLike = require('../../schema/FVI/VipLike.js');
const BuffLike = require('../../schema/FVI/BuffLike.js');
const tool   = require('../../tool/index.js');

module.exports = {
	save : function( data , cb ) {
		let doc = new VipLike(data);
			doc.save(function (err, success) {
		    if (err) return cb(doc , null);
		      return cb(null, success);
	    });
	},
	detail: function (conditions, cb){
		VipLike.findOne(conditions, function(err, doc){
			if (err) return cb(err , null);
			return cb(null, doc);
		})
	},
	list : function(  conditions , _limit , page  , sort_name , sort_value ,  cb ) {
			
		let sort_where_name  =  sort_name ? sort_name : "time_create";
		let sort_where_value =  sort_value && parseInt(sort_value) == 1  ? 1 :  -1 ;
		if(!conditions['status']) conditions['status'] = { $ne: 5 };
		let query =  VipLike.find(conditions);
			query
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort([[sort_where_name ,sort_where_value]] )
			.exec(function(err, listBuffVipLike){
				if (err) return cb(err ,null);
        	return cb(null , listBuffVipLike )
		});
	},
	updateBuffVipLike( vip_like_id ,  status = true , data ,cb ) {
		const conditions = { vip_like_id : vip_like_id };
		const update     = data;
		if ( status == false ) {
			update.last_time_use =  new Date().getTime();
		}
		VipLike.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffLike) { 
			if ( detailBuffLike == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffLike )
		});
	},
	async order( cb ) {
		let self = this;
		let conditions = {
			status: {
				$in: [0, 1] 
			}
		};
		try {
			let detailOrder = await VipLike.findOneAndUpdate(conditions, {
				$set: {
					status: 1,
					last_time_get: Date.now()
				}
			}).sort({ last_time_get :  1 });
			if(!detailOrder) return cb(true ,null);
			if(detailOrder.time_expired < Date.now()){
				detailOrder.status = 2;
				await detailOrder.save();
				return cb('Đơn hàng hết hạn' , null);
			}
			let date_now = new Date();
			date_now = date_now.setHours(0,0,0,0);

			let countOrder = await BuffLike.count({
				id_vip: detailOrder.fb_id.toString()+'_'+detailOrder.vip_like_id,
				time_create: {
					$gte: date_now,
					$lte: date_now + (60 * 1000 * 60 * 24) - 1
				}
			})
			if(countOrder >= 5){
				return cb(true , null);
			}
			return cb(null , detailOrder );
		} catch (err) {
			console.log('errror-------', err);
			return cb(err ,null);
		}
	},
	delete (  vip_like_id , cb ) {
		const conditions = { vip_like_id : vip_like_id };
		const update     =  { status : 5 };
		console.log(conditions);
		VipLike.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffLike) { 
			if ( detailBuffLike == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffLike )
		});
	},
	handleUpdateBuffVipLike( vip_like_id ,  status = true , data ,cb ) {
		const conditions = { vip_like_id : vip_like_id };
		const update     = data;
		if ( status == false ) {
			update.last_time_use =  new Date().getTime();
		}
		VipLike.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffLike) {
			if ( detailBuffLike == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffLike )
		});
	},
	
	createBuffLike(vip_like_id, data, cb){
		const conditions = { vip_like_id : vip_like_id };
		VipLike.findOne( conditions  ,  async function(err , detailOrder) {
			if (err) return cb(err ,null);
			if ( detailOrder == null ) {
				return cb(true ,null);
			}
			try {
				// let vip_id = detailOrder.fb_id.toString()+'_'+detailOrder.vip_like_id;
				let date_now = new Date();
				date_now = date_now.setHours(0,0,0,0);
				let count_one_day = await BuffLike.count({
					vip_id: detailOrder.vip_like_id,
					page_id: detailOrder.fb_id,
					time_create: {
						$gte: date_now,
						$lte: date_now + (60 * 1000 * 60 * 24) - 1
					}
				});
				console.log('count_one_day', count_one_day);
				if(count_one_day >= 5) return cb(null, {message: 'Vuot qua gioi han trong ngay roi'});
				let promise = [];
				data.forEach((fb_id, i) => {
					promise.push(new Promise(async (resolve, reject) => {
						try {
							let check_order = await BuffLike.findOne({
								vip_id: detailOrder.vip_like_id,
								video_id: fb_id,
								page_id: detailOrder.fb_id
							});
							if(!check_order){
								return resolve({ 
									video_id             :		fb_id ,
									owner                : 		detailOrder.name,
									type_buff            :		detailOrder.type_buff,   
									user_id              :      detailOrder.user_id ,
									quantity             : 		detailOrder.quantity ,	
									price                :		0 ,               
									total_price_pay      : 		0 ,
									time_type            : 		detailOrder.time_type ,	
									time_value           : 		detailOrder.time_value ,	
									note                 : 		'vip like',	 
									time_create          : 		new Date().getTime(),
									resources_cookie     :      detailOrder.resources_cookie,
									gender_cookie        :      detailOrder.gender_cookie,
									type_service         :      detailOrder.type_service,
									vip_id				 :      detailOrder.vip_like_id,
									page_id				 :      detailOrder.fb_id
								});
							} else {
								return resolve(false);
							}
						} catch (err) {
							console.log(err);
							return resolve(false);
						}
					}))
				});
				let results = await Promise.all(promise);
				try {
					let bulkWrite = [];
					results.forEach((item) => {
						if(item && count_one_day < 5) {
							count_one_day++;
							// bulkWrite.push({
							// 	"insertOne" : {
							// 		"document" : item
							// 	}
							// })
							bulkWrite.push(item);
						}
					})
					// console.log(bulkWrite);
					if(bulkWrite.length > 0){
						let docs = await BuffLike.create(bulkWrite, {ordered: true});
						// console.log(docs);
					}
					return cb(null , {message: 'done ok '} );
				} catch (err){
					// console.log(err);
					return cb(null , {message: 'done'} );
				}
			} catch (err) {
				console.log(err);
				return cb(err ,null);
			}
		});
	}
}