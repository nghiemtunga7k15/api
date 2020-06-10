var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var FaceBookUserSchema =  mongoose.Schema({
    user_id             :  	{ type: String, required: true },
    user_agent          :   { type: String, default : '' },     
    fb_dtsg             :   { type: String, default : '' },     
    status              :   { type: Number, default : 0  },
    note         		:   { type: String, default : 'Description'},
    type                :   { type: Number , default : 0 },
    last_time_use       :   { type: Number},
    last_time_check     :   { type: Number},
    time_create         :   { type: Number},
    cookie              :   { type: String , required: true },
    
});

FaceBookUserSchema.plugin(AutoIncrement, {inc_field: 'idUser'});

module.exports = mongoose.model('fb_users', FaceBookUserSchema);
