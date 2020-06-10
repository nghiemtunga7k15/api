const Notify = require('../../schema/Notify');
let Service = {
	save(data , cb ) {
		new Notify(data).save(function (err, doc) {
	      if (err) return cb(err , null);
	      return cb(null, doc);
	    });
	},
	detail(conditions , cb ) {
		Notify.findOne(conditions , function(err , doc) { 
			if (err) return cb(err ,null);
			if (doc == null) return cb(null, null);
        	return cb(null , doc )
		}); 
    },
    list(conditions, limit = 20, page = 1, cb ) {
		Notify.find(conditions).limit(limit)
        .skip((limit * page ) - limit)
        .sort({ time_create: -1 }).exec((err, docs) => {
            if (err) return cb(err ,null);
        	return cb(null , docs )
        }); 
    }
}
module.exports = Service ;