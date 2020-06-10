const ScanComment = require('../../schema/ST/ScanComment.js');
module.exports = {
	save : function( data , cb ) {
		let api = new ScanComment(data);
			api.save(function (err, success) {
		      if (err) return cb(err , null);
		      return cb(null, success);
	    });
	},
	list : function( user_id ,  _limit , page ,   level , cb ) {
		// ScanComment.find({ user_id : user_id })
		let query = level != 99 ? ScanComment.find({ user_id : user_id  }  , { owner : 0})  : ScanComment.find({ status : { $ne: 5 } });
		query
			.limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort({time_create : - 1 })
			.exec(function(err, data){
			if (err) return cb(err ,null);
        	return cb(null , data )
		});
	},
	list_all : function(find,   cb ) {
		// ScanComment.find({ user_id : user_id })
		let query =ScanComment.find(find);
		query
			.select({ "fb_id": 1 , "type" : 1 , "_id": 0})
			.exec(function(err, data){
			if (err) return cb(err ,null);
        	return cb(null , data )
		});
	},
	detail(user_id ,  idScanCmt ,cb ) {
		// ScanComment.findOne( { user_id : user_id ,  idScanCmt : idScanCmt ,  }, function(err , detailScanCmt) { 
		ScanComment.findOne( {   idScanCmt : idScanCmt ,  }, function(err , detailScanCmt) { 
			if (err) return cb(err ,null);
        	return cb(null , detailScanCmt )
		});
	},
	listOrderPromise( fb_id  ) {
		// const conditions = { fb_id : fb_id  ,  $or : [  { status : 1 } ,  { status : 0 }  ] };
		const conditions = { fb_id : fb_id   };
		return new Promise(function(resolve, reject) {
			ScanComment.find( conditions, function(err , detailScanCmt) { 
				if (err) return reject(err);
	        	return resolve(detailScanCmt)
			});
		});
	},
	handleUpdatePromie( idScanCmt , total  ){
			return new Promise(function(resolve, reject) { 
					let query  = { idScanCmt : idScanCmt } ;  
					let update = { total_comment : parseInt(total) } ;  
					ScanComment.findOneAndUpdate( query , update , { upsert:false } , function(err , success) { 
						if ( success == null ||  err) {
							return reject(err);
						} 
						if (err)  return reject(err);
			        	return resolve(success )
					});
			});
	},
	delete ( idScanCmt ,  cb ) {	
		let query  = { idScanCmt :   idScanCmt  } ;  
		let update = { status : 3  ,  time_stop : new Date().getTime()} ;  
		ScanComment.findOneAndUpdate( query , update , { upsert:false }, function(err, success){
		    if ( success == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , success )
		});
	},
	handleUpdateLogTime( idScanCmt  , data ,cb ) {
		const conditions = { idScanCmt : idScanCmt };
		const update     = data;
		ScanComment.findOneAndUpdate( conditions, { $set: update  } ,  { upsert: false }  ,  function(err , detailScanCmt) { 
			if ( detailScanCmt == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , detailScanCmt )
		});
	},
	search_owner( key_search ,cb ) {
		ScanComment.find({ owner:{'$regex' : `^.*${key_search}.*$`, '$options' : 'i'}} ,function(err,data) {
	   		if (err) return cb(err ,null);
        	return cb(null , data )
   		})
	},
	getListComment (update, cb ) {	
		var conditions = { status : 0  };
		// const update     = { status : 1  };
		ScanComment.findOneAndUpdate( conditions  , update ,   { upsert:false },  function(err , data ) { 
			if ( data  == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , data  )
		});
	},
	handleUpdateMany ( fb_id, check = true , cb) {
		let  conditions ;
		let  update  
		if ( check == true ) {
			conditions   =  {  fb_id  : fb_id , status : { $ne: 5 } } ;
			update     =   {  
				status : 1,
				last_time_get: new Date().getTime()
			};
		}else{
			conditions = {  fb_id  : fb_id };
			update     = { time_delete : new Date().getTime() };
		}
		
		ScanComment.updateMany( conditions  , { $set: update  } , { upsert: false } , function(err , success) {
			if ( err ) {
		  		return cb(err , null);
		  	}else{
		  		return	cb(null , success);
		  	}
		});
	},
	getOrderCancel ( cb ) {
		let  conditions   =  { status : 3  , time_delete : 0 } ;
		ScanComment.findOneAndUpdate( conditions, {
			$set: {
				last_time_get: new Date().getTime()
			}
		}, { sort: {
			last_time_get: 1
		}}, function(err , success) {
			if ( err ) {
		  		return cb(err , null);
		  	}else{
		  		return	cb(null , success);
		  	}
		  });
	},
	getOrderByUser ( user_id ,  cb ) {
		let  conditions   =  { status :  { $nin : 5 }   , user_id : user_id } ;
		ScanComment.find( conditions   , function(err , success) {
			if ( err ) {
		  		return cb(err , null);
		  	}else{
		  		return	cb(null , success);
		  	}
		  });
	},
	listOrderScanPayment(fb_id, cb) {
		let conditions = {
			status: {
				$ne: 3
			},
			fb_id: fb_id
		}
		console.log(conditions);
		ScanComment.find( conditions, function(err , docs) { 
			if (err) return cb(err, null);
			if(docs.length == 0) return cb('Fb id not found', null);
			return cb(null, docs);
		});
	},
	updatePayment(idScanCmt, data){
		return new Promise((resolve, reject) => {
			ScanComment.findOneAndUpdate({
				idScanCmt: idScanCmt
			}, data, function(err , success) {
				if ( err ) {
					reject(err);
				  } else{
					resolve(success);
				  }
			})
		})
	}
}