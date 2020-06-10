var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var AdminSchema =  mongoose.Schema({
    // Buff Eye
    price_one_eye            :   { type: Number , required: true },
    view_max                 : 	 { type: Number , required: true },
    // Buff COMMENT
    price_comment_randum     : 	 { type: Number , required: true },  
    price_comment_choose     : 	 { type: Number , required: true },  
    comment_max              : 	 { type: Number , required: true }, 
    // Buff Like
    price_like               :   { type: Number , required: true },  
    like_max                 :   { type: Number , required: true }, 
    // VIP EYE
    combo_vip_eye            :   { type: Array , required: true  },     
    price_vip_eye            :   { type: Number , required: true },
    // SCAN COMMENT
    price_scan_cmt_start     :   { type: Number , default: 0 },
    price_scan_cmt_success   :   { type: Number , default: 0 },
    // quantity_scan_cmt        :   { type: Array , "default": [] },
    list_combo_scan_cmt      :   { type: Array , required: true  },
    // SEEDING COMMENT
    price_seeding_cmt        :   { type: Number , required: true },
    time_option              :   { type: Array , required: true  },     
    time_create              :   { type: Number },   
    time_update              :   { type: Number, default : 0 },
    price_eye_time           :   { type: Number , required: true, default: 0},
    price_one_like_page      :   { type: Number , required: true},
    like_page                :   { type: Object},
    sub_basic                :   { type: Object},
    sub_maxspeed             :   { type: Object},
    price_vip_like           :   { type: Number}

});

AdminSchema.plugin(AutoIncrement, {inc_field: 'id_AdSetup'});

module.exports = mongoose.model('admin', AdminSchema);
