const modalAdmin = require('../../schema/AdminSetup.js');
let AdminService = {
	handleCreate(data , cb ) {
		let api = new modalAdmin(data);
		api.save(function (err, api) {
	      if (err) return cb(err , null);
	      return cb(null, api);
	    });
	},
	getListSetup(  cb ) {
		modalAdmin.find({})
			.limit(1)
			.exec(function(err, listSetup){
				if (err) return cb(err ,null);
        	return cb(null , listSetup )
		});
	},

	handleDelete( id_AdSetup   ,cb ) {
		modalAdmin.findOneAndRemove( {id_AdSetup : id_AdSetup}, function(err , deleteSuccess) { 
			if ( deleteSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , deleteSuccess )
		});
	},

	getAdminSetup() {
		let self = this;
		return new Promise(function(resolve, reject) { 
			self.getListSetup(function ( err , adminSetUp){
				if(err) return reject(err);
				return resolve(adminSetUp);
			})
		});
	},

	handleUpdate( id  , data, cb ) {
		let conditions = { id_AdSetup : id };
		const update   = data;
		modalAdmin.findOneAndUpdate(  conditions , { $set: update } , { upsert: false } , function(err , updateSuccess) { 
			if ( updateSuccess == null ) {
				return cb(true ,null);
			} 
			if (err) return cb(err ,null);
        	return cb(null , updateSuccess )
		});
	},
	getAdminSetupV2(req, res, setup = 'default') {
		return new Promise((reslove, reject) => {
			modalAdmin.findOne({}, function ( err , doc){
				if(err){
					return res.json( {code : 400 , message: 'Đã có lỗi xảy ra' } );
				};
				if(!doc || !doc[setup]) return res.json( {code : 400 , message: 'Setup admin' } );
				return reslove(doc);
			})
		})
	}

}
module.exports = AdminService ;