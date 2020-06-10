var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var BuffEyeSchema =  mongoose.Schema({
    video_id         	:   { type: String, required: true },
    view         	    :   { type: Number, required: true },
    owner               :   { type: String , default: '' },
    price_one_eye       :   { type: Number, required: true },
    total_price_pay     :   { type: Number, required: true },
    user_id             :   { type: Number, required: true },
    time_type           :   { type: Number, default: 0 },  // 0 is time delay 1 is time buff done
    time_value          :   { type: Number, default: 5 },
    id_vip              :   { type: String  , default : '' }, 
    note         		:   { type: String, default : 'Description'},
    status              :   { type: Number, default : 0 },
    view_max            :   { type: Number },
    time_create         :   { type: Number},
    time_done           :   { type: Number, default : 0 },
    time_start          :   { type: Number, default : 0 },
    time_update         :   { type: Number, default : 0 },
    last_time_check     :   { type: Number, default : 0 },
    resources_cookie    :   { type: Number, default : 1 },
    lock_row            :   { type: Number, default : 0 },
    last_time_scan      :   { type: Number, default : 0 },
    viewer_start        :   { type: Number, default : 0 },
    time_buff           :   { type: Number, default : 0 },
    type_service_buff   :   { type: Number, default : 1 },
});
// BuffEyeSchema.index({'$**': 'text'});

BuffEyeSchema.plugin(AutoIncrement, {inc_field: 'id'});
// mongoose.model('buff_eye', BuffEyeSchema).collection.dropIndex('id', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });
module.exports = mongoose.model('buff_eye', BuffEyeSchema);
