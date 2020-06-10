const axios = require('axios');
/*----------- SERVICE -----------------*/
const serviceLikePage = require('../../service/FVI/serviceLikePage.js');
const serviceAdmin = require('../../service/Admin/');

const serviceApiPartner = require('../../service/Autofb');

const tool   = require('../../tool/index.js');

//shema
const LikePage = require('../../schema/FVI/LikePage.js');

module.exports = {
	list : function(req, res, next) {
		let _limit = req.query.limit ? parseInt(req.query.limit) : 20;
		let page = req.query.page ? parseInt(req.query.page) : 1;
		let status =   req.query.status ? req.query.status : '';
		let sort_name = req.query.sort_name;
		let sort_value = req.query.sort_value;
		let user_id = req.user.level != 99 ? req.user.user_id : false ; 
		let key_search = req.query.search ? req.query.search : '';
		let conditions = {};
		if(user_id) conditions['user_id'] = user_id;
		if(key_search) conditions['$text'] = {$search: key_search};
		if(status) conditions['status'] = status;

		serviceLikePage.list( conditions ,  _limit , page , sort_name , sort_value  , function ( err , docs){
			if ( err ) {
   				return res.json( {code : 404 , err : err } );
   			} else {
				return res.json( {code : 200 , data : docs ,  page : page , limit : _limit, total: 0  } );
   			}
		})
	},
	detail : function ( req , res , next ){
		let id = parseInt(req.params.id);
		serviceLikePage.detail( id ,function ( err , doc){
			if(err)  {
				return res.json( {code : 404 , data : [] } );
			} else {
				return res.json( {code : 200 , data : doc } );
			}
		})
	},
	delete : function ( req , res , next ){
		let id = parseInt(req.params.id);
		serviceLikePage.delete( id ,function ( err , doc){
			if(err)  {
				return res.json( {code : 404 , err : err } );
			} else {
				return res.json( {code : 200 , data : { msg : 'Thành Công '} } );
			}
		})
	},
	create : async function(req, res, next) {
		try {
            let fb_id = req.body.fb_id;
            let checkPage = await tool.checkIdPostFromGraph(fb_id);
            if(!checkPage){
                return res.json( {code : 400 , data : { err : true , msg : 'Id không hợp lệ'} } );
            } else if(!checkPage.is_published){
				return res.json( {code : 400 , data : { err : true , msg : 'Page phải để chế độ công khai'} } );
			}
			let check_fb = await LikePage.findOne({fb_id: fb_id});
			if(check_fb) return res.json( {code : 400 , data : { err : true , msg : 'Fb id đã tồn tại'} } );
			let adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'like_page');
            let num_like = req.body.num_like ? parseInt(req.body.num_like) : 0;
            let num_like_start = checkPage.likes;
            
			let price_one_like = parseInt(adminSetup.like_page.price);
			if(num_like < adminSetup.like_page.min || num_like > adminSetup.like_page.max){
				return res.status(400).json({code: 400, data : { err : true , msg : `Min ${adminSetup.like_page.min} Max ${adminSetup.like_page.max}`} });
			}
            let total_price = price_one_like * num_like;

			let data = {
				fb_id: fb_id,
				owner: req.user.name,
				user_id: req.user.user_id,
				total_price_pay: total_price,
				note: req.body.note,
                time_create: new Date().getTime(),
                price_one_like: price_one_like,
                num_like: num_like,
                status: 2,
                num_like_start: num_like_start
			}
			let error_type = 1;
			let order_id = '';
			try {
				let payment = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
					amount: total_price,
					description: `Mua dịch vụ buff (${num_like} like) cho page ${fb_id}`,
					type_service: 'like_page'
				});
				order_id = payment.data.payment.order_id;
				
				if(process.env.PRODUCTION != 'dev'){
					error_type = 2;
					await serviceApiPartner.createBuff(`t=buy-like-page-v2&id=${fb_id}&other=0&Likes=${num_like}`);
				}
	
				serviceLikePage.save(data, function (err, doc) {
					if (err) {
						return res.json({ code: 400, err: err });
					} else {
						return res.json({ code: 200, data: doc });
					}
				})
			} catch (err) {
				if(error_type == 2) {
					let repay = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/${req.user.user_id}/payment/repay`, {
						amount: total_price,
						order_id: order_id
					}, {
						headers: {
							'Authorizations': `${process.env.API_ACCOUNT_VNP_KEY}`
						}
					});
					// console.log(repay);
				}
				err = err.response && err.response.data ? err.response.data.err : err;
				return res.json({ code: 400, data : { err : true , msg : err}});
			}
		} catch (err){
			err = err.response && err.response.data ? err.response.data.err : err;
			return res.json({ code: 400, data : { err : true , msg : err}});
		}
		
	}
}  