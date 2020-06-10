const BuffEye = require('../../schema/FVI/BuffEye.js');

module.exports = {
	save : function( data , cb ) {
		let api = new BuffEye(data);
			api.save(function (err, success) {
		      if (err) return cb(err , null);
		      return cb(null, success);
	    });
	},
	list : function (  conditions = {}, _limit , page  , sort_name , sort_value ,  cb ) {		
		let sort_where_name  =  sort_name ? sort_name : "time_create";
		if(!conditions['status']) conditions['status'] = { $nin: [5,6] };
		let sort_where_value =  sort_value && parseInt(sort_value) == 1  ? 1 :  -1 ;
		let query  = BuffEye.find(conditions);
			query
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort([[sort_where_name ,sort_where_value]] )
			.exec(function(err, listBuffEye){
				if (err) return cb(err ,null);
        	return cb(null , listBuffEye )
		});
	},
	order : function ( cb ) {
		let query  = { 
			status : 0,
			type_service_buff: 1,
			$or: [
				{
					lock_row: 0
				},
				{
					lock_row: 1,
					last_time_scan: {
						$lte: Date.now() - (60 * 1000 * 2)
					}
				}
			]
		} ;  
		let update = { lock_row : 1, last_time_scan: new Date().getTime() } ;  
		BuffEye.findOneAndUpdate( query , update , { upsert:false }, function(err, detailBuffEye){
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	detail  : function ( id , cb ) {
		BuffEye.findOne({id : id}, function(err , detailBuffEye) { 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	delete  : function ( id , cb ) {
		let query  = {id : id} ;  
		let update = { status : 5 } ; 
		BuffEye.findOneAndUpdate( query ,  update , { upsert:false } , function(err , deleteSuccess) { 
			if ( deleteSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , deleteSuccess )
		});
	},
	search  : function ( key_search , cb ) {
		BuffEye.find({video_id:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if(err){
	   			return cb(err ,null);
	   		}else{
	   			return cb(null , data )

	   		}
	   	})	
	},
	search_owner  : function ( key_search , cb ) {
		BuffEye.find({owner:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if(err){
	   			return cb(err ,null);
	   		}else{
	   			return cb(null , data )
	   		}
	   	})	
	},
	scan_buff_eye    : function ( cb ) {
	    BuffEye.findOneAndUpdate({
			status : 1
		}, {
			$set: {
				last_time_check: new Date().getTime()
			}
		}, {
			new: true
		}).sort({last_time_check: 1}).exec(function(err, data){
	       	if(err){
	   			return cb(err ,null);
		   	} else{
		   		return cb(null , data )
		   	}
		})	
	},
	handleUpdateBuffEye( id  , data ,cb ) {
		const conditions = {id : id};
		const update     = data;
		BuffEye.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffEye) { 
			if ( detailBuffEye == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	handleUpdateBuffEyeV2( video_id  , data ,cb ) {
		const conditions = {video_id : video_id};
		const update     = data;
		BuffEye.updateMany( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailBuffEye) { 
			if (err) return cb(err ,null);
        	return cb(null , detailBuffEye )
		});
	},
	scan_check_video    : function ( cb ) {
		BuffEye.find({status : 0}).sort({time_create: -1}).limit(1).exec(function(err, data){
			if(err){
			return cb(err ,null);
			}else{
				return cb(null , data )
		}
	 })	
},
	
}