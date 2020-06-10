const VipEye = require('../../schema/FVI/VipEye.js');
const BuffEye = require('../../schema/FVI/BuffEye.js');
const tool   = require('../../tool/index.js');

module.exports = {
	save : function( data , cb ) {
		let api = new VipEye(data);
			api.save(function (err, success) {
		      if (err) return cb({status: false, message: 'Mongodb errors', errors: err} , null);
		      return cb(null, success);
	    });
	},
	detailV2: function (conditions, cb){
		VipEye.findOne(conditions, function(err, doc){
			if (err) return cb(err , null);
			return cb(null, doc);
		})
	},
	list : function(  conditions , _limit , page  , sort_name , sort_value ,  cb ) {
			
		let sort_where_name  =  sort_name ? sort_name : "time_create";
		let sort_where_value =  sort_value && parseInt(sort_value) == 1  ? 1 :  -1 ;
		// let query  =  status ?  VipEye.find({status : status })  : VipEye.find({ });
		if(!conditions['status']) conditions['status'] = { $ne: 5 };
		let query =  VipEye.find(conditions);
			query
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort([[sort_where_name ,sort_where_value]] )
			.exec(function(err, listBuffVipEye){
				if (err) return cb(err ,null);
        	return cb(null , listBuffVipEye )
		});
	},
	updateBuffVipEye( _idVipEye ,  status = true , data ,cb ) {
		const conditions = { idVipEye : _idVipEye };
		const update     = data;
		if ( status == false ) {
			update.last_time_use =  new Date().getTime();
		}
		VipEye.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffEye) { 
			if ( detailBuffEye == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
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
			let detailOrder = await VipEye.findOneAndUpdate(conditions, {
				$set: {
					status: 1,
					last_time_use: Date.now()
				}
			}).sort({ last_time_use :  1 });
			if(!detailOrder) return cb(true ,null);
			if(detailOrder.time_expired < Date.now()){
				detailOrder.status = 2;
				await detailOrder.save();
				return cb('Đơn hàng hết hạn' , null);
			}
			if(!detailOrder.convert_fbid){
				let checkFbid = await tool.checkIdPostFromGraph(detailOrder.fb_id);
				if(checkFbid){
					detailOrder.fb_id = checkFbid.id;
					detailOrder.convert_fbid = 1;
					await detailOrder.save();
				}
			}
			let date_now = new Date();
			date_now = date_now.setHours(0,0,0,0);

			let countOrder = await BuffEye.count({
				id_vip: detailOrder.fb_id.toString()+'_'+detailOrder.idVipEye,
				time_create: {
					$gte: date_now,
					$lte: date_now + (60 * 1000 * 60 * 24) - 1
				}
			})
			if(countOrder >= 5){
				return cb(true , null);
			}
			let orderBuffEye = await BuffEye.findOne({ id_vip : detailOrder.fb_id.toString()+'_'+detailOrder.idVipEye, status : {$in: [0, 1]} });
			if ( orderBuffEye || !detailOrder.convert_fbid) {
				return cb(true , null);
			} else{
				return cb(null , detailOrder );
			}
		} catch (err) {
			console.log('errror-------', err);
			return cb(err ,null);
		}
		VipEye.findOneAndUpdate(conditions, {
			$set: {
				status: 1,
				last_time_use: data_now
			}
		}).sort({ last_time_use :  1 })
			.exec(async function(err, detailOrder){
				if ( detailOrder  ) {
					if(detailOrder.time_expired < data_now){
						detailOrder.status = 2;
						await detailOrder.save();
						return cb('Đơn hàng hết hạn' , null);
					}
					if(!detailOrder.is_check_fb_id){
						
					}
					BuffEye.find({ id_vip : { $in: detailOrder.fb_id.toString() }, status : {$in: [0, 1]} }, function (err, orderBuffEye) {
						if ( orderBuffEye && orderBuffEye.length > 0 ) {
							   return cb(true , null);
						   } else{
							   return cb(null , detailOrder );
						   }
					})
					
					// let id = parseInt(detailOrder.idVipEye);
					// let data = {};
					// self.updateBuffVipEye(id, false , data , function(err , success) {
					// 		if(err)  {
					// 			return cb(err ,null);
					// 		} else {
					// 			BuffEye.find({ id_vip : { $in: detailOrder.fb_id.toString() }, status : {$in: [0, 1]} }, function (err, orderBuffEye) {
					// 				if ( orderBuffEye && orderBuffEye.length > 0 ) {
					// 		       		return cb(true , null);
					// 		       	} else{
					// 		       		return cb(null , detailOrder );
					// 		       	}
					// 		    })
					// 		}
					// })
				}else {
					return cb(err ,null);
				}
		});
	},
	detail (  idVipEye , cb ) {
		VipEye.findOne( { idVipEye : idVipEye }, function(err , detailBuffEye) { 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	delete (  idVipEye , cb ) {
		const conditions = { idVipEye : idVipEye };
		const update     =  { status : 5 };
		VipEye.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffEye) { 
			if ( detailBuffEye == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	handleUpdateBuffVipEye( idVipEye ,  status = true , data ,cb ) {
		const conditions = { idVipEye : idVipEye };
		const update     = data;
		if ( status == false ) {
			update.last_time_use =  new Date().getTime();
		}
		VipEye.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false, new: true }  ,  function(err , detailBuffEye) {
			if ( detailBuffEye == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	
	
}