var express = require('express');
var router = express.Router();

/*----------------- CONTROLLERS---------------------*/
var controllerAdmin         = require('../controllers/Admin/index.js');
var controllerBuffEye      = require('../controllers/FVI/controllerBuffEye.js');
var controllerBuffComment  = require('../controllers/FVI/controllerBuffComment.js');
var controllerBuffLike  = require('../controllers/FVI/controllerBuffLike.js');
var controllerBuffVipEye  = require('../controllers/FVI/controllerBuffVipEye.js');
var controllerScanCommentOrder  = require('../controllers/ST/controllerScanCommentOrder.js');
var controllerInbox  = require('../controllers/Inbox/index.js');
var controllerInboxUser  = require('../controllers/Inbox/controllerInboxUser.js');
var controllerBuffSub  = require('../controllers/FVI/controllerBuffSub');
var controllerLikePage  = require('../controllers/FVI/controllerLikePage');
var controllerSeeding  = require('../controllers/Seeding');
var controllerSeedingScript  = require('../controllers/Seeding/scriptController');
var controllerBuffVipLike  = require('../controllers/FVI/controllerBuffVipLike');
var StatitiscalController  = require('../controllers/StatitiscalController');

/*----------------- AUTH ---------------------------*/
// var authentication  = require('../authentication/');
var authMiddleware = require("../middleware/authMiddleware");
var userController = require('../controllers/Auth/controllerAuth');
var userController_v2 = require('../controllers/User_v2');

/*--------------notify-----------*/
var controllerNotify = require('../controllers/Notify');

//api auth
router.route('/users/register').post(userController.register);
router.route('/users/update').post(userController.update);
router.route('/users/login').post(userController.sign_in);
router.route('/users/list').get(userController.list);
router.route('/users/remove').get(userController.remove);
router.route('/users/detail').get(userController.detail);

/*BUFF EYE*/
router.post('/v1/buff-eye/create'       ,  authMiddleware.loginRequired ,   controllerBuffEye.partnerTest);
router.get('/v1/buff-eye/fb-live'       ,  authMiddleware.loginRequired ,    controllerBuffEye.scan_buff_eye);
router.put('/v1/buff-eye/update/:id'    ,  authMiddleware.loginRequired ,    controllerBuffEye.update);
router.get('/v1/buff-eye/fb-user'       ,  authMiddleware.loginRequired ,  controllerBuffEye.fb_user);
router.get('/v1/buff-eye/list'          ,  authMiddleware.loginRequired   ,    controllerBuffEye.list);
router.get('/v1/buff-eye/detail-order'  ,  controllerBuffEye.order);
router.get('/v1/buff-eye/detail/:id'    ,  authMiddleware.loginRequired ,   controllerBuffEye.detail);
router.delete('/v1/buff-eye/delete/:id' ,  authMiddleware.loginRequired ,   controllerBuffEye.delete);
router.get('/v1/buff-eye/search'        ,  authMiddleware.loginRequired ,  controllerBuffEye.search );
router.get('/v1/buff-eye/search-owner'  ,  controllerBuffEye.search_owner );

router.put('/v2/service/buff-eye/update/:video_id'   ,  authMiddleware.middlewareService ,    controllerBuffEye.updateV2);
router.get('/v2/service/buff-eye/check'   ,  authMiddleware.middlewareService ,    controllerBuffEye.checkBuffEye);

//test
router.post('/v1/partner/test'       ,  authMiddleware.loginRequired ,   controllerBuffEye.partnerTest);

/*BUFF COMMENT*/
router.post('/v1/buff-cmt/create'       ,  	authMiddleware.loginRequired ,  controllerBuffComment.create);
router.get('/v1/buff-cmt/list'          ,   authMiddleware.loginRequired  ,  controllerBuffComment.list);
router.get('/v1/buff-cmt/detail-order'  ,  	controllerBuffComment.order);
router.put('/v1/buff-cmt/update/:id'  	,  	authMiddleware.loginRequired  ,  controllerBuffComment.update);
router.get('/v1/buff-cmt/detail/:id'    ,   authMiddleware.loginRequired  , controllerBuffComment.detail);
router.delete('/v1/buff-cmt/delete/:id' ,   authMiddleware.loginRequired  , controllerBuffComment.delete);
router.get('/v1/buff-cmt/search'        ,   authMiddleware.loginRequired  , controllerBuffComment.search);
router.get('/v1/buff-cmt/search-owner'  ,   controllerBuffComment.search_owner);
router.put('/v2/buff-cmt/update/:id'  	,  	authMiddleware.loginRequired  ,  controllerBuffComment.updateV2);

/*BUFF LIKE*/
router.post('/v1/buff-like/create'      , 		authMiddleware.loginRequired ,  controllerBuffLike.create);
router.get('/v1/buff-like/list'  		, 		authMiddleware.loginRequired  ,  controllerBuffLike.list);
router.get('/v1/buff-like/detail-order' ,  	 	controllerBuffLike.order);
router.put('/v1/buff-like/update/:id'   ,  	    authMiddleware.loginRequired  , controllerBuffLike.update);
router.get('/v1/buff-like/detail/:id'   ,   	authMiddleware.loginRequired  , controllerBuffLike.detail);
router.delete('/v1/buff-like/delete/:id',   	authMiddleware.loginRequired  , controllerBuffLike.delete);
router.get('/v1/buff-like/search'    	,   	authMiddleware.loginRequired  , controllerBuffLike.search);
router.get('/v1/buff-like/search-owner' ,       controllerBuffLike.search_owner);


/*BUFF VIP EYE*/
router.post('/v1/buff-vip-eye/create'		, 	authMiddleware.loginRequired ,   controllerBuffVipEye.create);
router.post('/v1/buff-vip/eye/create'       ,   authMiddleware.loginRequired  ,   controllerBuffVipEye.createVideo);
router.get('/v1/buff-vip-eye/list'  		,  	authMiddleware.loginRequired  ,   controllerBuffVipEye.list);
router.post('/v1/buff-vip-eye/update/:id'  	,   authMiddleware.middlewareAdmin  , controllerBuffVipEye.update);
router.get('/v1/buff-vip-eye/detail/:id'  	,   authMiddleware.loginRequired  , controllerBuffVipEye.detail);
router.delete('/v1/buff-vip-eye/delete/:id' ,   authMiddleware.loginRequired  , controllerBuffVipEye.delete);
//api service
router.get('/v1/buff-vip-eye/detail-order'  ,   authMiddleware.middlewareService  ,   controllerBuffVipEye.order);

/*SCAN COMMENT*/
router.post('/v1/scan-cmt/create'			,   authMiddleware.loginRequired ,  controllerScanCommentOrder.create);
router.get('/v1/scan-cmt/list'  			,   controllerScanCommentOrder.list);
router.get('/v1/scan-cmt/list-all'  		,   controllerScanCommentOrder.list_all);
router.get('/v1/scan-cmt/detail/:id'   		,   authMiddleware.loginRequired  , 	controllerScanCommentOrder.detailV2);
router.get('/v1/scan-cmt/detail-order'      ,   controllerScanCommentOrder.order);
router.delete('/v1/scan-cmt/delete/:id'   	,  	authMiddleware.loginRequired  , 	controllerScanCommentOrder.delete);
router.get('/v1/scan-cmt/search-owner'      ,   controllerScanCommentOrder.search_owner);
router.get('/v1/scan-cmt/list-phone'   		,  	controllerScanCommentOrder.list_phone);
router.get('/v1/scan-cmt/list-post'   		,   authMiddleware.loginRequired  ,  controllerScanCommentOrder.list_comment);
/*------------UPDATE TOTAL COMMENT AND TOTAL COMMENT SUCCESS*/
router.put('/v1/scan-cmt/update-scan-cmt/:id'   	,  controllerScanCommentOrder.updateLogTime);
router.put('/v1/scan-cmt/update-comment-post/:id'   ,  controllerScanCommentOrder.updateAddrees);
router.put('/v1/scan-cmt/update/:id'  		        ,  controllerScanCommentOrder.updateTotalCommentV2);
router.post('/v1/scan-cmt/update/:id'  		        ,  controllerScanCommentOrder.updateOrder);
/* ---------------- api service */
router.get('/v1/scan-cmt/list-cmt', authMiddleware.middlewareService, controllerScanCommentOrder.listAll);
router.post('/v1/scan-cmt/list-cmt/update_many', authMiddleware.middlewareService, controllerScanCommentOrder.updateMany);

/* ADMIN */
router.post('/admin/create', authMiddleware.middlewareAdmin, controllerAdmin.create);
router.get('/admin/list'   , authMiddleware.loginRequired, controllerAdmin.list);
router.delete('/admin/:id' , authMiddleware.middlewareAdmin, controllerAdmin.delete);
router.get('/setup/service/list' , controllerAdmin.list);
router.put('/setup/service/update/:id', controllerAdmin.update);

/* USER */
router.get('/users/facebook-info'  ,  userController_v2.get_user_facebook);
router.post('/users/validate-token'  ,  userController_v2.validate_token);
router.post('/users/register/bk' ,      userController_v2.register);
router.post('/users/login/bk'    ,      userController_v2.login);
// router.get('/users/check-active/:id' ,  userController_v2.check_active);
router.get('/users/detail/bk'    ,      authMiddleware.loginRequired  , userController_v2.detail);
router.post('/webhooks/'         ,      userController_v2.webhooks_bao_kim);
router.post('/payment-bk/'       ,      userController_v2.order_pay);
router.get('/bpm/list'           ,      userController_v2.list_bank);
router.get('/list-payment/'      ,      userController_v2.list_payment);
router.get('/sso_callback/'      ,      userController_v2.sso_callback);
router.get('/check-login/'       ,      authMiddleware.checkLogin ,  userController_v2.check_login);
// router.post('/users/update/bk'   ,      authMiddleware.checkLogin ,  userController_v2.update);
 
/* INBOX */
router.post('/v1/inbox/create'        , controllerInbox.create);
router.post('/v1/inbox/create-detail' , controllerInbox.create_detail);
router.get('/v1/inbox/list'           , controllerInbox.list);
router.get('/v1/inbox/detail/:id'     , controllerInbox.detail);

/* INBOX USER */
router.post('/v1/inbox-user/create'   , controllerInboxUser.create);

// notify
router.post('/v1/notify' , authMiddleware.middlewareService, controllerNotify.create);
router.get('/v1/notify/list'          , authMiddleware.middlewareAdmin, controllerNotify.list);

/*BUFF Sub*/
router.post('/v1/buff-sub/create'       ,  authMiddleware.loginRequired ,   controllerBuffSub.create);
router.get('/v1/buff-sub/list'          ,  authMiddleware.loginRequired   ,    controllerBuffSub.list);
router.get('/v1/buff-sub/detail/:id'    ,  authMiddleware.loginRequired ,   controllerBuffSub.detail);
router.delete('/v1/buff-sub/delete/:id' ,  authMiddleware.loginRequired ,   controllerBuffSub.delete);

/*BUFF like page*/
router.post('/v1/buff-like-page/create'       ,  authMiddleware.loginRequired ,   controllerLikePage.create);
router.get('/v1/buff-like-page/list'          ,  authMiddleware.loginRequired   ,    controllerLikePage.list);
router.get('/v1/buff-like-page/detail/:id'    ,  authMiddleware.loginRequired ,   controllerLikePage.detail);
router.delete('/v1/buff-like-page/delete/:id' ,  authMiddleware.loginRequired ,   controllerLikePage.delete);

/*--------------- create by huy --------------------*/
//đơn hàng seeding cmt
router.post('/v1/order/seeding/comment/add', authMiddleware.loginRequired, controllerSeeding.add);
router.put('/v1/order/seeding/comment/update/:id_order', authMiddleware.middlewareService, controllerSeeding.update);
router.get('/v1/order/seeding/comment/delete/:id_order', authMiddleware.loginRequired, controllerSeeding.delete);
router.get('/v1/order/seeding/comment/list', authMiddleware.loginRequired, controllerSeeding.list);
router.get('/v1/order/seeding/comment/detail', authMiddleware.loginRequired, controllerSeeding.detail);
router.get('/v1/seeding/comment/list', authMiddleware.loginRequired, controllerSeedingScript.list);

//lay ra kịch bản để thực hiện service
router.get('/v1/order/seeding/comment/scan', controllerSeeding.list_scan);

router.get('/v1/seeding/comment/scan', controllerSeedingScript.list_scan);
router.get('/v1/seeding/comment/check_user', controllerSeedingScript.check_user);
router.get('/v1/seeding/comment/check_script', controllerSeedingScript.check_cmt_script);
router.put('/v1/seeding/comment/update/:id_script', controllerSeedingScript.update);

/*BUFF VIP LIKE*/
router.post('/v1/buff-vip-like/create'		, 	authMiddleware.loginRequired ,   controllerBuffVipLike.create);
router.get('/v1/buff-vip-like/list'  		,  	authMiddleware.loginRequired  ,   controllerBuffVipLike.list);
router.post('/v1/buff-vip-like/update/:id'  	,   authMiddleware.middlewareAdmin  , controllerBuffVipLike.update);
router.get('/v1/buff-vip-like/detail/:id'  	,   authMiddleware.loginRequired  , controllerBuffVipLike.detail);
router.delete('/v1/buff-vip-like/delete/:id' ,   authMiddleware.loginRequired  , controllerBuffVipLike.delete);
//api service
router.get('/v1/buff-vip-like/detail-order'  ,   authMiddleware.middlewareService  ,   controllerBuffVipLike.order);
router.post('/v1/service/buff-vip-like/create/:id'  ,   authMiddleware.middlewareService  ,   controllerBuffVipLike.serviceCreateBuff);

// statitiscal
router.get('/v1/statitiscal/buff', authMiddleware.middlewareAdmin, StatitiscalController.buff);

module.exports = router;
