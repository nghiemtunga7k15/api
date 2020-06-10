const BuffComment = require('../../schema/FVI/BuffComment.js');
module.exports = {
	save : function( data , cb ) {
		let api = new BuffComment(data);
			api.save(function (err, success) {
		      if (err) return cb(err , null);
		      return cb(null, success);
	    });
	},
	list : function( user_id ,  _limit , page ,  cb ) {
		let query = user_id != false ? BuffComment.find({ user_id : user_id  , status : { $ne: 5 } }  , { owner : 0}) : BuffComment.find({ status : { $ne: 5 } });
		query
		
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort({time_create : - 1 })
			.exec(function(err, listCmts){
			if (err) return cb(err ,null);
        	return cb(null , listCmts )
		});
	},
	order : function ( cb ) {
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
		BuffComment.findOneAndUpdate( conditions , {$set: update, $inc: {count_get: 1}} , { upsert:false }, function(err, detailBuffCmt){
		    if ( detailBuffCmt == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffCmt )
		}); 
	},
	detail ( idVideo ,cb ) {
		BuffComment.findOne({idVideo : idVideo}, function(err , detailCmts) { 
			if (err) return cb(err ,null);
        	return cb(null , detailCmts )
		}); 
	},
	delete ( idVideo ,cb ) {
		let query  = { idVideo : idVideo } ;  
		let update = { status : 5 } ;   
		BuffComment.findOneAndUpdate( query , update , { upsert:false }, function(err, detailBuffCmt){
			if (err) return cb(err ,null);
        	return cb(null , detailBuffCmt )
		}); 
	},
	search ( key_search ,cb ) {
		BuffComment.find({video_id:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if(err){
	   			if (err) return cb(err ,null);
	   		}else{
	   		return cb(null , data );
	   		}
   		})	 
	},
	search_owner ( key_search ,cb ) {
		BuffComment.find({owner:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if(err){
	   			if (err) return cb(err ,null);
	   		}else{
	   		return cb(null , data );
	   		}
   		})	 
	},
	handleUpdate( id  , data , status = true ,cb ) {
		let conditions;
		if ( status == false ) {
			conditions = { video_id : id };
		} else {
			conditions = { idVideo : id };
		}
		const update     = data;
		BuffComment.findOneAndUpdate(  conditions , { $set: update } , { upsert: false } , function(err , updateSuccess) { 
			if ( updateSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , updateSuccess )
		});
	},
	
}