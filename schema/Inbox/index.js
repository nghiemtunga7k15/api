var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var InboxSchema =  mongoose.Schema({
    Id_mess        :   { type: String , required: true  }, 
    Sender         :   { type: String },
    Mess           :   { type: String , required: false  },
    Id_cookie      :   { type: String , required: false  },
    Time           :   { type: String },
    Time_now       :   { type: String },
    Timestamp      :   { type: String },
    Is_new         :   { type: Boolean },
    Link_old_mess  :   { type: String },
    status         :   { type: Number },
    Content :   {
        text                 :     { type: String },
        sticker_id           :     { type: String },
        sticker_package_id   :     { type: String },
    },   
    time_create    :   { type: Number }
});
mongoose.model('inbox', InboxSchema).collection.dropAllIndexes(function (err, results) {
  if (err) console.log('Not Success');
});

InboxSchema.plugin(AutoIncrement, {inc_field: 'inbox_id'});

module.exports = mongoose.model('inbox', InboxSchema);
