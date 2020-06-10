/*----------- SERVICE -----------------*/
let serviceNotify = require('../../service/Notify');

module.exports = {
	create : function(req, res, next) {
		let data = req.body;
		data['time_create'] = new Date().getTime();
		serviceNotify.save(data, function (err , doc) {
			if(err)  {
				return res.json( {code : 400 , message: 'Thất Bại' } );
			} else { 
				return res.json( {code : 200 , data : doc } );
			}
		})
	},
	list : function(req, res, next) {
        let limit = req.query.limit ? parseInt(req.query.limit) : 20;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let query = {
            type: 2
        }
		serviceNotify.list(query, limit, page, function ( err , docs){
			if(err) {
				return res.json( {code : 400 , message: 'Thất bại', error: err } );
			} else{
				return res.json( {code : 200 , data : docs } );
			}
		})
	}
}  