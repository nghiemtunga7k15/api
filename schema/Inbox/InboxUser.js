var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var InboxUserSchema =  mongoose.Schema({
    token             :   { type: String }, 
    content           :   { type: String , required: true },
    to_id             :   { type: String , required: true },
    request_id        :   { type: String , required: true },
    type              :   { type: String },
    time_create       :   { type: Number }
});
mongoose.model('inbox_user', InboxUserSchema).collection.dropAllIndexes(function (err, results) {
  if (err) console.log('Not Success');
});

InboxUserSchema.plugin(AutoIncrement, {inc_field: 'inbox_user_id'});

module.exports = mongoose.model('inbox_user', InboxUserSchema);
