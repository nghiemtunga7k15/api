const jwt = require('jsonwebtoken');
const User = require('../../schema/User/User');
const bcrypt = require('bcrypt');

module.exports = {
	register : function(req, res) {
		req.body.created = Date.now();
		req.body.password = req.body.password ? req.body.password : '123456';
		if ( parseInt(req.body.level) == 2 ) {
			if ( req.user.level != 99 ) {
				return res.status(401).json({code: 401, message: 'Unauthorized user!' });
			}
		}
		if ( parseInt(req.body.level) == 3 ) {
			if ( req.user.level != 99 ) {
				return res.status(401).json({code: 401, message: 'Unauthorized user!' });
			}
		}
		var newUser = new User(req.body);
		    newUser.password = req.body.password ? bcrypt.hashSync(req.body.password, 10) : '';
		    newUser.save(function(err, user) {
		    if (err) {
		      return res.status(400).send({
		      	code: 400,
		        message: err.message,
		        errors: err.errors
		      });
		    } else {
		      user.password = undefined;
		      return res.json({
		      		code: 200,
		      		token: jwt.sign({ 
		      			email: req.body.email, 
		      			level: req.body.level ? req.body.level  : 1, 
		      			full_name:  req.body.level,
		      			_id: user._id
		      		}, 'RESTFULAPIs') 
		      	});
		    }
		});
	},
	update : async (req, res) => {

		let results = results_api[200];
		if(req.user.level != 99){
			delete req.body.role;
			delete req.body.level;
			delete req.body.status;
		}
		
		if(req.body.password){
			req.body.password =  bcrypt.hashSync(req.body.password, 10);
		}

		User.findOneAndUpdate({email: req.body.email},	{$set : req.body})
		.then( (doc) => {
			doc['password'] = undefined;
			if(req.user.level != 99){
				doc['role'] = undefined;
				doc['level'] = undefined;
			}
			results['data'] = doc;
			return res.json(results);
		})
		.catch( (err) => {
			results = results_api[400];
			if(err.errmsg){
				results['message'] = err.errmsg;
			}
			return res.json(results);
		});
	},
	sign_in : function(req, res) {
		User.findOne({
		   email: req.body.email
		}, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.status(401).json({ code: 401, message: 'Authentication failed.' });
			} else if (user) {
				if (!user.comparePassword(req.body.password)) {
					res.status(401).json({code: 401, message: 'Authentication failed.' });
				} else {
					user.password = undefined;
					return res.json({code: 200, data: {user: user,token: jwt.sign({  user_id : user.user_id ,email: user.email, level: user.level, full_name: user.full_name, _id: user._id}, 'RESTFULAPIs')}});
				}
			}
		});
	},
	list : async function(req, res) {
		// let limit = req.query.limit ? parseInt(req.query.limit) : 12;
		// let page = req.query.page ? parseInt(req.query.page) : 1;
		// let skip = page > 1 ? (limit * page) - limit : 0;
		// let query = {};
		// let select = {
		// 	password: 0
		// };
		// let user = req.user;
		// if(req.query.status){
		// 	query['status'] = req.query.status;
		// }
		// if(user.email){
		// 	query['email'] = {$ne: user.email};
		// }
		// if(req.query.email){
		// 	query['email']['$regex'] = '.*'+req.query.email+'*.';
		// }
		// let total = await User.find(query).count();
		// let data = await User.find(query, select).skip(skip).limit(limit).sort('-created').exec();

		// let result = {
		// 	'data' : data,
		// 	'total' : total,
		// 	'page' : page,
		// 	'last_page' : Math.ceil(total / limit),
		// 	'limit' : limit
		// }
		// res.send(result);
		User.find({} ,  function(err , success) {
			res.status(200).json({ code: 200, data: success });
		})
	},
	remove : async (req, res) => {
		var data = await User.findOneAndRemove({email : req.query.email});
		let results = results_api[200];
		if(!data){
			results = results_api[400];
		}
		res.send(results);
	},
	detail : async (req, res) => {
		var data = await User.findOne({email : req.query.email});
		var results = data;
		if(!data){
			results = results_api[400];
		} else{
			results['password'] = undefined
		}
		if(req.user.level != 99){
			results['role'] = undefined;
			results['level'] = undefined;
		}
		res.send({data: results});
	}
}