var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var AdminSchema =  mongoose.Schema({
    time_update              :   { type: Number, default : 0 },
    token              :   { type: String},
});

AdminSchema.plugin(AutoIncrement, {inc_field: 'test'});

module.exports = mongoose.model('test', AdminSchema);
