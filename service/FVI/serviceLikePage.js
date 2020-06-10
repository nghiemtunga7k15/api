const LikePage = require('../../schema/FVI/LikePage.js');

module.exports = {
	save : function( data , cb ) {
		let api = new LikePage(data);
			api.save(function (err, doc) {
		      if (err) return cb(err , null);
		      return cb(null, doc);
	    });
	},
	list : function (  conditions = {}, _limit , page  , sort_name , sort_value ,  cb ) {		
		let sort_where_name  =  sort_name ? sort_name : "time_create";
		if(!conditions['status']) conditions['status'] = { $nin: [5,6] };
		let sort_where_value =  sort_value && parseInt(sort_value) == 1  ? 1 :  -1 ;
		LikePage.find(conditions).limit(_limit)
    		.skip((_limit * page ) - _limit)
    		.sort([[sort_where_name ,sort_where_value]] )
			.exec(function(err, listLikePage){
			if (err) return cb(err ,null);
        	return cb(null , listLikePage )
		});
	},
	detail  : function ( id , cb ) {
		LikePage.findOne({like_page_id : id}, function(err , detailLikePage) { 
			if (err) return cb(err ,null);
        	return cb(null , detailLikePage )
		});
	},
	delete  : function ( id , cb ) {
		let query  = {like_page_id : id} ;  
		let update = { status : 5 } ; 
		LikePage.findOneAndUpdate( query ,  update , { upsert:false } , function(err , deleteSuccess) { 
			if ( deleteSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , deleteSuccess )
		});
	}
}