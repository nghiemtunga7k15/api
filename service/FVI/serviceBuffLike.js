const BuffLike = require('../../schema/FVI/BuffLike.js');
module.exports = {
	save : function( data , cb ) {
		let api = new BuffLike(data);
			api.save(function (err, success) {
		      if (err) return cb(err , null);
		      return cb(null, success);
	    });
	},
	list : function( user_id ,  _limit , page ,  cb ) {
		let query = user_id != false ? BuffLike.find({ user_id : user_id  , status : { $ne: 5 } }  , { owner : 0}) : BuffLike.find({ status : { $ne: 5 } });
		query
		// BuffLike.find( { user_id : user_id} )
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort({time_create : - 1 })
			.exec(function(err, listCmts){
				if (err) return cb(err ,null);
        	return cb(null , listCmts )
		});
	},
	detail( idLike ,cb ) {
		BuffLike.findOne({idLike : idLike}, function(err , detail) { 
			if (err) return cb(err ,null);
        	return cb(null , detail )
		});
	},
	order( cb ) {
		const conditions = {
			$or: [
				{
					status: 0
				},
				{
					status: 1,
					lock_row: 0
				}
			]
		};
		const update     =  { status : 1, lock_row: 1, last_time_get: Date.now()};
		BuffLike.findOneAndUpdate( conditions, {$set: update, $inc: {count_get: 1}}  ,  { upsert: false }  , function(err , success) { 
			if (err) return cb(err ,null);
        	return cb(null , success )
		});
	},
	delete( idLike ,cb ) {
		const conditions = { idLike : idLike };
		const update     = { status : 5 };
		BuffLike.findOneAndUpdate( conditions, update  ,  { upsert: false }  , function(err , success) { 
			if ( success == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , success )
		});
	},
	search( key_search ,cb ) {
		BuffLike.find({video_id:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if (err) return cb(err ,null);
        	return cb(null , data )
   		})
	},
	search_owner( key_search ,cb ) {
		BuffLike.find({owner:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if (err) return cb(err ,null);
        	return cb(null , data )
   		})
	},
	handleUpdate( id  , data , status = true ,cb ) {
		let conditions;
		if ( status == false ) {
			conditions = { video_id : id };
		} else {
			conditions = { idLike : id };
		}
		
		const update     = data;
		BuffLike.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  , function(err , updateSuccess) { 
			if ( updateSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , updateSuccess )
		});
	},
	
}