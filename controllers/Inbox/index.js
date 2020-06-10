/*----------- SERVICE -----------------*/
let serviceInbox = require('../../service/Inbox/index.js');
/*------------ MODAL ------------------*/
const Inbox = require('../../schema/Inbox/index.js');

module.exports = {
	create : function(req, res, next) {
		let json = JSON.stringify(req.body);
		let data =  JSON.parse(json);
		serviceInbox.save(data, function (err , api) {
			if(err)  {
				return res.json( {code : 404 , err : err } );
									} else { 
				return res.json( {code : 200 , data : api } );
			}
		})
	},
	list : function(req, res, next) {
		let _limit = req.query.limit ?  parseInt(req.query.limit) : 20;
		let page = req.query.page ?  parseInt(req.query.page) : 1;
		let status = req.query.status ?  parseInt(req.query.status) : 0;
		serviceInbox.list( _limit , page , status ,  function ( err , listBuffEye){
			if(err) {
				return res.json( {code : 404 , data : [] } );
			} else {
				Inbox.count({ status : status }, function( err, totalRecord){
   					if ( err ) {
   						return res.json( {code : 404 , data : [] } );
   					} else {
						return res.json( {code : 200 , data : listBuffEye ,  page : page , limit : _limit , total : totalRecord } );
   					}
				})

			}
		})
	},
	detail : function(req, res, next) {
		let id = req.params.id;
		let status = req.query.status ?  parseInt(req.query.status) : 0;
		serviceInbox.detail( id , status ,function ( err , data){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : data } );
			}
		})
	},
	create_detail : function(req, res, next) {
		let json = JSON.stringify(req.body);
		let data =  JSON.parse(json);
		serviceInbox.save(data, function (err , api) {
			if(err)  {
				return res.json( {code : 404 , err : err } );
									} else { 
				return res.json( {code : 200 , data : api } );
			}
		})
	},
}  