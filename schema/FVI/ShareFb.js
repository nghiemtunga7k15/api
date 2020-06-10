var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    fb_id               :   { type: String , required: true },
    owner               :   { type: String , required: true },
    user_id             :   { type: Number, required: true },
    total_price_pay     :   { type: Number , required: true },
    price_one_post      :   { type: Number , required: true },
    note                :   { type: String },
    status              :   { type: Number, default : 0 },
    time_create        	:   { type: Number },
    time_update         :   { type: Number, default : 0 },
    num_share             :   { type: Number, required: true},
    note                :   { type: String, default: ''}
});

schema.plugin(AutoIncrement, {inc_field: 'share_fb_id'});

module.exports = mongoose.model('share_fb', schema);
