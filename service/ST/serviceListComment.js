const CommentScanSuccess = require('../../schema/ST/CommentScanSuccess.js');
module.exports = {
	save : function( data , cb ) {
		let api = new CommentScanSuccess(data);
			api.save(function (err, success) {
		      if (err) return cb(err , null);
		      return cb(null, success);
	    });
	},
	saveAll : function( data,  cb ) {
		CommentScanSuccess.create( data , function(err , success) {
		  		if ( err ) {
		  			return cb(err , null);
		  		}else{
		  			return	cb(null , success);
		  		}
		});
	},
	listCommentById( idScanCmt ,  fb_id   , time , type = false ) {
		let conditions = type == false ? {  created_timestamp : { $gt:  parseInt(time) } ,  fb_id : fb_id } : { fb_id : fb_id } ;
		return new Promise(function(resolve, reject) { 
			CommentScanSuccess.find( conditions , function(err , detailScanCmt) { 
				if (err) return reject(err);
				if(detailScanCmt == null || detailScanCmt.length == 0 ) {
					return reject(err)
				}
				let obj = {};
				obj['idScanCmt'] = idScanCmt;
				obj['totalPost'] = detailScanCmt.length != 0 ? detailScanCmt.length : 0;
				return	resolve(obj)
			});
		});
	},
	// getListComment (  cb ) {	
	// 	const conditions = { status : 0  };
	// 	const update     = { status : 1  };
	// 	CommentScanSuccess.findOneAndUpdate( conditions  , update ,   { upsert:false },  function(err , data ) { 
	// 		if ( data  == null ) {
	// 			return cb(true ,null);
	// 		} 
	// 		if (err) return cb(err ,null);
 //        	return cb(null , data  )
	// 	});
	// },
	// handleUpdateMany ( fb_id, cb) {
	// 	let conditions   =  {  fb_id : fb_id };
	// 	const update     =  { status : 1 };
	// 	CommentScanSuccess.updateMany( conditions  , { $set: update  } , { upsert: false } , function(err , success) {
	// 		if ( err ) {
	// 	  		return cb(err , null);
	// 	  	}else{
	// 	  		return	cb(null , success);
	// 	  	}
	// 	  });
	// },
	getlistPhone() {
		return new Promise(function(resolve, reject) { 
			let conditions = {  'time_update_phone' : 0  ,    user_phone : { $nin: 'Not Found' } , created_timestamp : { $nin:  0 } };
			let query      = CommentScanSuccess.findOne( conditions );
			let arr  = [];
			let obj = {};
				query
					.exec(function(err, detailOrder){
						if (err ) {
							return reject(err);
						}else{
							if ( detailOrder == null) {
								return reject(err);
							}
							let _conditions = { 'time_update_phone' : 0  , fb_id : detailOrder.fb_id , user_phone : { $nin: 'Not Found' } , created_timestamp : { $nin:  0 } ,  }
							let _query      = CommentScanSuccess.find( _conditions );
							_query
							.exec(function(err, _detailOrder){
								if (err ) {
									return reject(err);
								}else{
									_detailOrder.forEach(obj=>{
										let object = {};
										object['phone'] = obj.user_phone;
										object['idx']   = obj.idScanCmtSuccess;
										arr.push(object);
									})
									if (_detailOrder.length !=0 ){
										obj = {
											list_phone : arr,
											id : _detailOrder[0].fb_id
										}
									}
									return resolve(obj);
								}
							});	
						}
				});	
		});
	},
	handleUpdateAddress ( idScanCmtSuccess , fb_id  ,data ) {
		return new Promise(function(resolve, reject) { 
			let conditions   = {  fb_id : fb_id ,  idScanCmtSuccess : idScanCmtSuccess  };
			data.time_update_phone =  new Date().getTime();
			const update     =  data ;
		  	CommentScanSuccess.findOneAndUpdate( conditions  , { $set: update  } , { upsert: false } , function(err , success) {
		  		if ( err ) {
		  			return reject(err);
		  		}else{
		  			return	resolve( success);
		  		}
		  	});
		});
	},
	listCommentSuccess(  cb ) {	
		let query  =  CommentScanSuccess.find({});
			query
    		.sort({time_create : - 1 })
			.exec(function(err, listOrderScanCmt){
				if (err) return cb(err ,null);
        	return cb(null , listOrderScanCmt )
		});
	},
	CommentPayment( order, fb_id , payment_end) {
		return new Promise(function(resolve, reject) { 
			CommentScanSuccess.find( {
				fb_id: fb_id,
				time_scan: {
					$gt: payment_end
				}
			}, function(err , comment_scan) { 
				if (err) return reject(err);
				let obj = {};
				obj['order'] = order;
				obj['total'] = comment_scan.length;
				return	resolve(obj)
			});
		});
	},
	findAll(conditions, cb){
		CommentScanSuccess.find(conditions).sort({time_create : - 1 })
			.exec(function(err, listOrderScanCmt){
			if (err) return cb(err ,null);
        	return cb(null , listOrderScanCmt)
		});
	}
	
}