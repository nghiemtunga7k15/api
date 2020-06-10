var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var VipEyeSchema =  mongoose.Schema({
    user_id             :   { type: Number, required: true },
    owner               :   { type: String , default: '' },
    fb_id         	    :   { type: String, required: true },
    type_buff           : 	{
        like   : { type: Number, required: true },
        love   : { type: Number, required: true },
        haha   : { type: Number, required: true },
        wow    : { type: Number, required: true },
        sad    : { type: Number, required: true },
        angry  : { type: Number, required: true },
    },
    quantity            :   { type: Number , required: true },     
    price               : 	{ type: Number , required: true },
    total_price_pay     :   { type: Number , required: true },     
    time_type           :   { type: String, default: 'delay'  },  //  delay and time buff done
    time_value          :   { type: Number },
    note                :   { type: String, default : '' },
    status              :   { type: Number, default : 0 },
    time_create        	:   { type: Number },
    time_done           :   { type: Number, default : 0 },
    time_update         :   { type: Number, default : 0 },
    resources_cookie    :   { type: Number, default : 1 },
    gender_cookie       :   { type: Number, default : 1 },
    last_time_get       :   { type: Number, default : 0 },
    time_expired        :   { type: Number, default: 0},
    log                 :   { type: String},
    type_service        :   { type: Number, default : 1 },
    time_vip_like       :   { type: Number, default: 0}
});

VipEyeSchema.plugin(AutoIncrement, {inc_field: 'vip_like_id'});

module.exports = mongoose.model('buff_vip_like', VipEyeSchema);
