var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    content: { type: String, required: true},
    id_user_vnp_sw: { type: String, required: true},
    active: { type: Number, default: 0},
    time_create: {type: Number, default: 0},
    type: {type: Number, default: 1}
});

schema.plugin(AutoIncrement, {inc_field: 'notify_id'});

module.exports = mongoose.model('notifications', schema);
