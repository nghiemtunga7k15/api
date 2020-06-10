var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var SeedingCommentSchema =  mongoose.Schema({
    key_word         	                  :   { type: String , required: true },
    content_seeding_post                  :   { type: Array  , required: true }, // User muốn nhập 
    quantity_seeding_comment              :   { type: Number , required: true }, // Số kịch bản 
    total_comment                         :   { type: Number , required: true }, 
    quantity_post                         :   { type: Number , required: true },  // Số bài viết muốn Comment 
    time_delay_reply                      :   { type: Number , default: 60 },  
    total_price_pay                       :   { type: Number , required: true }, 
    content_send_comment                  :   { type: Array  , "default": [] }, // Đã Send 
    status                                :   { type: Number , default : 0 },
    time_create                           :   { type: Number },
    time_done                             :   { type: Number },
    time_update                           :   { type: Number , default : 0 },
});

SeedingCommentSchema.plugin(AutoIncrement, {inc_field: 'idSeedingCmt'});

module.exports = mongoose.model('seeding_comment', SeedingCommentSchema);
