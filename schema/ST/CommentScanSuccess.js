var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var ScanCommentSuccessSchema =  mongoose.Schema({
    fb_id         	         :   { type: String, required: true , unique: false },
    comment_id         	     :   { type: String },
    user_name         	     :   { type: String },
    user_id         	     :   { type: String },
    message         	     :   { type: String },
    like_count         	     :   { type: String },
    user_phone         	     :   { type: String },
    phone_comment         	 :   { type: String },
    is_post         	     :   { type: Boolean },
    is_page         	     :   { type: String },
    address_comment          :   { type: String  , default : ''  },
    created_time             :   { type: String },
    created_timestamp        :   { type: Number , default : 0  },
    address_post :   {
        add_full             :     { type: String },
        add_county           :     { type: String },
        add_district         :     { type: String },
    },
    // user_id_current          :   { type: Number  , required: true},
    id_province              :   { type: String },
    type                     :   { type: String },
    id_district              :   { type: String },
    status                   :   { type: Number, default : 0 },
    time_update_phone        :   { type: Number, default : 0 },
    time_scan                :   { type: Number, default: 0},
    scan_phone               :   { type: Number, default: 0 }
});
// ScanCommentSuccessSchema.index({'$**': 'text'});


ScanCommentSuccessSchema.plugin(AutoIncrement, {inc_field: 'idScanCmtSuccess'});

// mongoose.model('scan_comment_success', ScanCommentSuccessSchema).collection.dropIndex('$**_text', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });


module.exports = mongoose.model('scan_comment_success', ScanCommentSuccessSchema);
