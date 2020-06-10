const Payment = require('../../schema/User_v2/payment.js');
let PaymentService = {
	save(data , cb ) {
		let api = new Payment(data);
		api.save(function (err, api) {
	      if (err) return cb(err , null);
	      return cb(null, api);
	    });
	},
	list( cb ) {
		Payment.find({})
			.exec(function(err, data){
				if (err) return cb(err ,null);
        	return cb(null , data )
		});
	},
}
module.exports = PaymentService ;