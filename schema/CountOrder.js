var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var schema =  mongoose.Schema({
    type: { type: String, required: true, unique: true},
    type_name: { type: String, required: true},
    total: { type: Number, default: 0}
});

// schema.plugin(AutoIncrement, {inc_field: 'notify_id'});

module.exports = mongoose.model('count_order', schema);
