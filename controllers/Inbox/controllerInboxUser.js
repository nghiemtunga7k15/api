/*----------- SERVICE -----------------*/
let serviceInboxUser = require('../../service/Inbox/serviceInboxUser.js');
/*------------ MODAL ------------------*/

module.exports = {
	create : function(req, res, next) {
		let json = JSON.stringify(req.body);
		let data =  JSON.parse(json);
		serviceInboxUser.save(data, function (err , api) {
			if(err)  {
				return res.json( {code : 404 , err : err } );
									} else { 
				return res.json( {code : 200 , data : api } );
			}
		})
	}
}  