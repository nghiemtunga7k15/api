var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    fb_id               :   { type: String , required: true },
    owner               :   { type: String , required: true },
    user_id             :   { type: Number, required: true },
    total_price_pay     :   { type: Number , required: true },
    price_one_like      :   { type: Number , required: true },
    note                :   { type: String },
    status              :   { type: Number, default : 0 },
    time_create        	:   { type: Number },
    time_update         :   { type: Number, default : 0 },
    num_like            :   { type: Number, default: 0 },
    num_like_start      :   { type: Number, default: 0 },
    note                :   { type: String, default: ''}
});

schema.plugin(AutoIncrement, {inc_field: 'like_page_id'});

module.exports = mongoose.model('like_page', schema);
