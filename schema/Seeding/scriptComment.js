var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var SeedingCommentSchema =  mongoose.Schema({
    id_order : {
        type: Number,
        required: true
    },
    content : {
        type: String,
        required: true
    },
    id_post : {
        type: String,
        required: true
    },
    parent_id : {
        type: Number,
        default: 0
    },
    parent_cmt_id_on_fb : {
        type: String,
        default: null
    },
    result_id_cmt_on_fb : {
        type: String,
        default: null
    },
    last_time_get : {
        type: Number,
        default: 0
    },
    last_cmt_time: {
        type: Number,
        default: 0
    },
    count_get : {
        type: Number,
        default: 0
    },
    status : {
        type: Number,
        default: 0
    },
    uid_fb_cmt : {
        type: String,
        default: ''
    },
    note : {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    resources_cookie:   { type: Number, default : 1 },
    gender_cookie:   { type: Number, default : 1 },
    user_vnp: { type: Object, required: true },
});

SeedingCommentSchema.plugin(AutoIncrement, {inc_field: 'id_script_seeding_cmt'});

module.exports = mongoose.model('script_seeding_comments', SeedingCommentSchema);
