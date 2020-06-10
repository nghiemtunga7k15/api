var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var BuffCommentSchema =  mongoose.Schema({
    video_id            :   { type: String , required: true },
    owner               :   { type: String , default: '' },
    type_buff           : 	{ type: String , required: true },
    comments            :   { type: Array , "default": [] },     
    comments_count      :   { type: Number , required: true },     
    total_price_pay     :   { type: Number , required: true },   
    user_id             :   { type: Number, required: true },
    time_type           :   { type: Number  , default : 0},  // 0 is time delay 1 is time buff done
    time_value          :   { type: Number  , default : 0  },
    note                :   { type: String, default : 'Descript' },
    status              :   { type: Number, default : 0 },
    comment_max         :   { type: Number },
    time_create        	:   { type: Number },
    time_done           :   { type: Number, default : 0 },
    time_update         :   { type: Number, default : 0 },
    resources_cookie    :   { type: Number, default : 1 },
    gender_cookie       :   { type: Number, default : 1 },
    last_time_get       :   { type: Number, default : 0 },
    lock_row            :   { type: Number, default : 0 },
    buff_done           :   { type: Number, default : 0 },
    count_get           :   { type: Number, default : 0 }
});

BuffCommentSchema.plugin(AutoIncrement, {inc_field: 'idVideo'});
// mongoose.model('buff_comment', BuffCommentSchema).collection.dropIndex('idVideo', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });
module.exports = mongoose.model('buff_comment', BuffCommentSchema);
