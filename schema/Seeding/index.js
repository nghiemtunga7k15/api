var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var SeedingCommentSchema =  mongoose.Schema({
    keyword : {
        type: String,
        default: ''
    },
    script_cmt: {
        type: String,
        required: true
    },
    script_cmt_arr: {
        type: Array,
        default: []
    },
    links : {
        type: Array
    },
    post_ids: {
        type: Array
    },
    num_scripts : {
        type: Number,
        default: 0
    },
    num_cmt : {
        type: Number,
        default: 0
    },
    num_post : {
        type: Number,
        default: 0
    },
    time_delay_cmt : {
        type: Number,
        default: 0
    },
    total_price : {
        type: Number,
        default: 0
    },
    status : {
        type: Number,
        default: 0
    },
    note : {
        type: String,
        default: ''
    },
    time_create : {
        type: Number,
        default: 0
    },
    time_update : {
        type: Number,
        default: 0
    },
    time_done : {
        type: Number,
        default: 0
    },
    last_time_use : {
        type: Number,
        default: 0
    },
    scan_post_seeding: {
        type: Number,
        default: 0
    },
    file_name: {
        type: String,
        default: ''
    },
    count_get: {
        type: Number,
        default: 0
    },
    user_vnp: {
        type: Object,
        required: true
    },
    type_service_cookie: {
        type: Number,
        default: 1
    },
    resources_cookie    :   { type: Number, default : 1 },
    gender_cookie       :   { type: Number, default : 1 },
    price_one_cmt       :   { type: Number, required: true },
    total_price_pay     :   { type: Number, required: true },
});

SeedingCommentSchema.plugin(AutoIncrement, {inc_field: 'id_order_seeding_cmt'});

module.exports = mongoose.model('order_seeding_comments', SeedingCommentSchema);
