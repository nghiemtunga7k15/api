/*----------- SERVICE -----------------*/
let serviceAdmin = require('../../service/Admin/');

module.exports = {
	create : function(req, res, next) {
		// console.log(req.body);
		let data = { 
			price_one_eye               :		req.body.price_one_eye ,
			view_max                    :		req.body.view_max ,
			price_comment_randum        :		req.body.price_comment_randum ,
			price_comment_choose        :		req.body.price_comment_choose ,
			comment_max                 :		req.body.comment_max ,
			price_like                  :		req.body.price_like ,
			like_max                    :		req.body.like_max ,
			price_vip_eye               :		req.body.price_vip_eye ,
			price_seeding_cmt           :       req.body.price_seeding_cmt,
			price_scan_cmt_start		:		req.body.price_scan_cmt_start,
			price_scan_cmt_success		:		req.body.price_scan_cmt_success,
			time_create     			: 		new Date().getTime(),
		}
		serviceAdmin.handleCreate(data, function (err , api) {
			if(err)  {
				return res.json( {code : 404 , data : { msg : 'Thất Bại'} } );
			} else { 
				return res.json( {code : 200 , data : api } );
			}
		})
	},
	list : function(req, res, next) {
		serviceAdmin.getListSetup(  function ( err , list){
			if(err) {
				return res.json( {code : 404 , data : [] } );
			} else{
						return res.json( {code : 200 , data : list } );
			}
		})
	},
	delete : function(req, res, next) {
		let id_AdSetup = parseInt(req.params.id);
		serviceAdmin.handleDelete(  id_AdSetup , function ( err , list){
			if(err) {
				return res.json( {code : 404 , data : [] } );
			} else{
						return res.json( {code : 200 , data : list } );
			}
		})
	},
	update : function(req, res, next) {
		let id = parseInt(req.params.id);
		// if(req.body.sub_basic){
		// 	req.body.sub_basic = JSON.parse(req.body.sub_basic);
		// }
		// if(req.body.sub_maxspeed){
		// 	req.body.sub_maxspeed = JSON.parse(req.body.sub_maxspeed);
		// }
		
		// console.log(req.body);
		serviceAdmin.handleUpdate( id , req.body ,function ( err , updateSuccess){
			if(err)  {
				return res.json( {code : 404 , data : { msg : 'Thất Bại'}  } );
			} else {
				return res.json( {code : 200 , data : { msg : 'Success'} } );
			}
		})
	}
}  