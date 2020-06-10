var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var VipEyeSchema =  mongoose.Schema({
    user_id             :   { type: Number, required: true },
    owner               :   { type: String , default: '' },
    fb_id         	    :   { type: String, required: true },
    name         	    :   { type: String, required: true },
    choose_option_eye   :   { type: Number, required: true },
    time_vip_eye        :   { type: Number, required: true }, // Day
    total_price_pay     :   { type: Number }, 
    note         		:   { type: String, default : 'Description'},
    status              :   { type: Number, default : 0 },
    time_expired        :   { type: Number},
    time_done           :   { type: Number , default : 0},
    last_time_use       :   { type: Number , default : 0},
    time_create         :   { type: Number},
    time_update         :   { type: Number, default : 0 },
    link_fb             :   {type: String, require: true},
    convert_fbid        :   { type: Number, default: 0},
    resource_type       :   { type: Number, default : 1 },
    price_one_eye       :   { type: Number, required: true }
});

VipEyeSchema.plugin(AutoIncrement, {inc_field: 'idVipEye'});

// mongoose.model('buff_vip_eye', VipEyeSchema).collection.dropIndex('idVipEye', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });
module.exports = mongoose.model('buff_vip_eye', VipEyeSchema);
