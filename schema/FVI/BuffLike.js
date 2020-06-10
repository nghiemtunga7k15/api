var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var BuffLikeSchema =  mongoose.Schema({
    video_id            :   { type: String , required: true },
    owner               :   { type: String , default: '' },
    type_buff           : 	{
        like   : { type: Number },
        love   : { type: Number },
        haha   : { type: Number },
        wow    : { type: Number },
        sad    : { type: Number },
        angry  : { type: Number },
    }, 
    user_id             :   { type: Number, required: true },
    quantity            :   { type: Number , required: true },     
    price               : 	{ type: Number , required: true },
    total_price_pay     :   { type: Number , required: true },     
    time_type           :   { type: String  },  //  delay and time buff done
    time_value          :   { type: Number, default: 0 },
    note                :   { type: String, default : 'Descript' },
    status              :   { type: Number, default : 0 },
    like_max            :   { type: Number },
    time_create        	:   { type: Number },
    time_done           :   { type: Number, default : 0 },
    time_update         :   { type: Number, default : 0 },
    resources_cookie    :   { type: Number, default : 1 },
    gender_cookie       :   { type: Number, default : 1 },
    type_service        :   { type: Number, default : 1 }, // 1 live stream 2 post le
    last_time_get       :   { type: Number, default : 0 },
    lock_row            :   { type: Number, default : 0 },
    buff_done           :   { type: Number, default : 0 },
    count_get           :   { type: Number, default : 0 },
    vip_id              :   { type: String },
    page_id              :   { type: String } 
});

// BuffLikeSchema.index({'$**': 'text'});


BuffLikeSchema.plugin(AutoIncrement, {inc_field: 'idLike'});
// mongoose.model('buff_like', BuffLikeSchema).collection.dropIndex('idLike', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });
module.exports = mongoose.model('buff_like', BuffLikeSchema);
