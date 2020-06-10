var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcrypt');

var schema =  mongoose.Schema({
    full_name: {
	    type: String,
	    trim: true,
	    required: true
	},
	balance : {
		type: Number,
		default: 9999999
	},
	email: {
	    type: String,
	    unique: true,
	    lowercase: true,
	    trim: true,
	    required: true
	},
	password: {
	    type: String,
	    required: true
	},
	avatar: {
		type: String,
		default: ''
	},
	age: {
		type: Number,
		required: false
	},
	level: {
		type: Number,
		default: 1
	},
	status: {
		type: Number,
		default: 1
	},
	created: {
	    type: Number,
	    default: ''
	},
	role: {
		type: Array,
		default: ''
	}
});

schema.index({created: 1});

schema.plugin(AutoIncrement, {inc_field: 'user_id'});

schema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('users', schema);
