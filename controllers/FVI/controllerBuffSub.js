const axios = require('axios');
/*----------- SERVICE -----------------*/
const serviceBuffSub = require('../../service/FVI/serviceBuffSub.js');
const serviceAdmin = require('../../service/Admin/');

const serviceApiPartner = require('../../service/Autofb');

const tool   = require('../../tool/index.js');

//schema
const BuffSub = require('../../schema/FVI/BuffSub');

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

		serviceBuffSub.list( conditions ,  _limit , page , sort_name , sort_value  , function ( err , docs){
			if ( err ) {
   				return res.json( {code : 404 , err : err } );
   			} else {
				return res.json( {code : 200 , data : docs ,  page : page , limit : _limit, total: 0  } );
   			}
		})
	},
	detail : function ( req , res , next ){
		let id = parseInt(req.params.id);
		serviceBuffSub.detail( id ,function ( err , doc){
			if(err)  {
				return res.json( {code : 404 , data : [] } );
			} else {
				return res.json( {code : 200 , data : doc } );
			}
		})
	},
	delete : function ( req , res , next ){
		let id = parseInt(req.params.id);
		serviceBuffSub.delete( id ,function ( err , doc){
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
			let check_fb = await BuffSub.findOne({fb_id: fb_id});
			if(check_fb) return res.json( {code : 400 , message: 'Fb id đã tồn tại' } );

            let checkSubscribers = await tool.checkSubscribers(fb_id);
            if(!checkSubscribers){
                return res.json( {code : 400 , message: 'Id không hợp lệ'} );
            } else if(!checkSubscribers.summary){
                return res.json( {code : 400 , message: 'Nick của bạn phải để công khai' } );
            } else if(checkSubscribers.summary == 0){
                return res.json( {code : 400 , message: 'Hãy tạo 1 nick clone để theo dõi nick của bạn' } );
			}
			// sub || subspeed
            let type_sub = req.body.type_sub ? req.body.type_sub : 'sub';
			let adminSetup = null;
			if(type_sub == 'subspeed'){
				adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'sub_maxspeed');
				adminSetup = adminSetup.sub_maxspeed;
			} else {
				adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'sub_basic');
				adminSetup = adminSetup.sub_basic;
			}

            let num_sub = req.body.num_sub ? parseInt(req.body.num_sub) : 0;
			let num_sub_start = checkSubscribers.summary.total_count;
			
			let price_one_sub = parseInt(adminSetup.price);
			if(num_sub < parseInt(adminSetup.min) || num_sub > parseInt(adminSetup.max)){
				return res.status(400).json({code: 400, message: `Min ${adminSetup.min} Max ${adminSetup.max}`});
			}
			if(num_sub % parseInt(adminSetup.min) != 0){
				return res.status(400).json({code: 400, message: 'Chỉ Được Mua sub Là Bội số Của '+adminSetup.min});
			}

            let total_price = price_one_sub * num_sub;

			let data = {
				fb_id: fb_id,
				owner: req.user.name,
				user_id: req.user.user_id,
				total_price_pay: total_price,
				note: req.body.note,
                time_create: new Date().getTime(),
                price_one_sub: price_one_sub,
                type_sub: type_sub,
                num_sub: num_sub,
                status: 1,
                num_sub_start: num_sub_start
			}

			let error_type = 1;
			let order_id = '';
			try {
				let payment = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
					amount: total_price,
					description: `Mua dịch vụ buff (${num_sub} sub) cho fb id ${fb_id}`,
					type_service: 'buff_sub'
				});
				order_id = payment.data.payment.order_id;
				
				if(process.env.PRODUCTION != 'dev'){
					error_type = 2;
					await serviceApiPartner.createBuff(`t=buy-buff-sub&id=${fb_id}&slsub=${num_sub}&note=&other=${type_sub}`);	
				}
				serviceBuffSub.save(data, function (err, doc) {
					if (err) {
						return res.json({ code: 400, err: err, message: 'Bad request' });
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
				return res.json({ code: 400, message: err || 'Bad request'});
			}
		} catch (err){
			err = err.response && err.response.data ? err.response.data.err : err;
			return res.json({ code: 400, message: err || 'Bad request'});
		}
		
	}
}  