var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var ScanCommentSchema =  mongoose.Schema({
    fb_id         	      :   { type: String, required: true },
    owner                 :   { type: String , default: '' },
    total_comment         :   { type: Number, default : 0 },
    // content                  :    { type: Array , "default": [] },
    type_order :   {
        name              :     { type: String },
        limit_post        :     { type: String },
        price_pay_buy     :     { type: String },
        price_pay_cmt     :     { type: String },
    },
    type                     :   { type: String },
    user_id                  :   { type: Number, required: true },
    total_price_pay          :   { type: Number , default : 0 }, 
    price_pay                :   { type: Number , default : 0 }, 
    name_fanpage             :   { type: String , default : '' }, 
    note                     :   { type: String , default : '' }, 
    log_time                 :   { type: Array , "default": [] }, 
    status                   :   { type: Number , default : 0 },
    last_time                :   { type: Number , default : 0 },
    time_create              :   { type: Number , default: 0 },
    time_delete              :   { type: Number , default : 0 },
    minutes                  :   { type: Number , default: 0},
    time_expired             :   { type: Number, default: 0 },
    time_stop                :   { type: Number , default : 0 },
    time_update              :   { type: Number, default : 0 },
    payment_end              :   { type: Number, default: 0},
    last_time_get            :   { type: Number, default: 0},
    device_scan              :   { type: String, default: ''}
});

// ScanCommentSchema.plugin(AutoIncrement, {inc_field: 'idScanCmt'});

// mongoose.model('scan_comment', ScanCommentSchema).collection.dropIndex('idScanCmt', function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });

module.exports = mongoose.model('scan_comment_backup', ScanCommentSchema);
