module.exports = {
	loginRequired : function(req, res, next) {;
		if (req.user) {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	},
	middlewareUser : function(req, res, next) {
		if (req.user && req.user.email == req.body.email || req.user && req.user.email == req.query.email || req.user && req.user.level == 99 ||  req.user && req.user.level == 1  || req.user && req.user.level == 2 ) {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	},
	middlewareUserVip : function(req, res, next) {
		if (req.user && req.user.email == req.body.email || req.user && req.user.email == req.query.email || req.user && req.user.level == 99 ||  req.user && req.user.level == 2 || req.user && req.user.level == 3 ) {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	},
	middlewareAdmin : function(req, res, next) {
		if (req.user && req.user.level == 99) {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	},
	checkLogin : function(req, res, next) {
		if (req.user) {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	},
	middlewareService : function(req, res, next){
		if (req.user && req.type_get_api == 'service') {
			next();
		} else {
			return res.status(401).json({code: 401, message: 'Unauthorized user!' });
		}
	}
}