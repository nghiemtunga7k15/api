require('dotenv').config();
const mongoose = require('mongoose');

var url_connect = 'mongodb://'+process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME+'?authSource=admin';
//2 connect
const authData =  {
    "user": `${process.env.DB_USERNAME}`,
    "pass": `${process.env.DB_PASSWORD}`,
    "useNewUrlParser": true
}; 
mongoose.connect(url_connect, authData, function(err){
	if(!err){
		console.log('Successfully connected db');
	} else{
		console.log(err);
	}
});