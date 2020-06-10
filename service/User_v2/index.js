const UserV2 = require('../../schema/User_v2/index.js');
const User = require('../../schema/User/User.js');
let UserV2Service = {
	save(data , cb ) {
		let api = new UserV2(data);
		api.save(function (err, api) {
	      if (err) return cb(err , null);
	      return cb(null, api);
	    });
	},
	detail(conditions , cb ) {
		UserV2.findOne(conditions , function(err , user) { 
			if (err) return cb(err ,null);
			if (user == null) return cb(null, null);
        	return cb(null , user )
		}); 
	},
	update( email  , data  ,cb ) {
		let conditions = { email : email }
		let update     = data;
		this.detail(conditions , function (err , detail){
			if (err) return cb(err ,null);
			if (detail == null) return cb('User Not Found' ,null);
			data.balance   = parseInt(data.balance) + detail.balance;
			// data.code_user = detail.code_user.concat(data.code_user);
			let update     = data;
			UserV2.findOneAndUpdate(  conditions , { $set: update } , { upsert: false } , function(err , updateSuccess) { 
				if ( updateSuccess == null ) {
					return cb(true ,null);
				} 
				if (err) return cb(err ,null);
	        	return cb(null , updateSuccess )
			});
		})
	},
	detailUser(conditions , cb ) {
		UserV2.findOne(conditions , function(err , user) { 
			if (err) return cb(err ,null);
			if (user == null) return cb(true,null);
        	return cb(null , user )
		}); 
	},
	payment( email , total , cb ) {
		let  conditions = { email : email ,   balance : {$gte: total} };
		let data = {};
		this.detailUser(conditions , function (err , detail){
			if (err) return cb(err ,null);
			if (detail == null) return cb('User Not Found' ,null);
			data.balance   =  detail.balance - total ;
			let update     = data;
			UserV2.findOneAndUpdate(  conditions , { $set: update } , { upsert: false } , function(err , updateSuccess) { 
				if ( updateSuccess == null ) {
					return cb(true ,null);
				} 
				if (err) return cb(err ,null);
	        	return cb(null , updateSuccess )
			});
		})
	},
}
module.exports = UserV2Service ;