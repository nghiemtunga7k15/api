var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    fb_id               :   { type: String , required: true },
    owner               :   { type: String , required: true },
    user_id             :   { type: Number, required: true },
    total_price_pay     :   { type: Number , required: true },
    price_one_sub       :   { type: Number , required: true },
    status              :   { type: Number, default : 0 },
    time_create        	:   { type: Number },
    time_update         :   { type: Number, default : 0 },
    num_sub             :   { type: Number, required: true},
    num_sub_start       :   { type: Number, default: 0},
    type_sub            :   { type: String, default: 'sub'},
    note                :   { type: String, default: ''}
});

schema.plugin(AutoIncrement, {inc_field: 'buff_sub_id'});

module.exports = mongoose.model('buff_sub', schema);
