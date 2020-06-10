var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    date: { type: String, required: true, unique: true},
    buff_eye: { type: Number, default: 0},
    buff_like: { type: Number, default: 0},
    buff_comment: { type: Number, default: 0},
    buff_sub: { type: Number, default: 0},
    buff_like_page: { type: Number, default: 0},
    seeding: { type: Number, default: 0},
    vip_like: { type: Number, default: 0},
    vip_eye: { type: Number, default: 0}
});

// schema.plugin(AutoIncrement, {inc_field: 'notify_id'});

module.exports = mongoose.model('statitiscal', schema);
