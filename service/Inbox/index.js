const Inbox= require('../../schema/Inbox/index.js');
let InboxService = {
	save(data , cb ) {
		Inbox.insertMany(data, function (err, api) { 
	      	if (err) return cb(err , null);
	      	return cb(null, api);
		 });
	},
	create_many(data , cb ) {
		Inbox.insertMany(data, function (err, api) { 
	      	if (err) return cb(err , null);
	      	return cb(null, api);
		 });
	},
	list(  _limit  ,  _page  , status ,  cb ) {
		let query  = Inbox.find({  status : status });
			query
			.limit(_limit)
    		.skip((_limit * _page ) - _limit)
    		.sort({time_create : - 1 })
			.exec(function(err, listBuffEye){
				if (err) return cb(err ,null);
        	return cb(null , listBuffEye )
		});
	},
	detail  : function ( id_mess , status, cb ) {
		Inbox.find({ Id_mess : id_mess  ,  status : status}, function(err , data) { 
			if (err) return cb(err ,null);
        	return cb(null , data )
		});
	},
}
module.exports = InboxService ;