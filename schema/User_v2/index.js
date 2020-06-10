var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var UserV2Schema =  mongoose.Schema({
    user_id             :   { type: Number , required: true },
    email               :   { type: String , required: true  , unique: true },
    phone               :   { type: String , required: true  } ,
    password            :   { type: String , required: true },
    name                :   { type: String , required: true },
    // account_code        :   { type: String , required: true  , unique: true },
    // birthday            :   { type: String , required: true },
    // full_name           :   { type: String , required: true },
    // sex                 :   { type: String , required: true },
    address             :   {
        city               : { type: String },
        province           : { type: String },
        commune            : { type: String },
        apartment_number   : { type: String },
    }, 
    level               :   { type: Number , default: 1},
    role                :   { type: Array , default : [] },
    balance             :   { type: Number , default : 0 },
    is_active           :   { type: Boolean  , default : false },
    // code_user           :   { type: Array , default : [] },
    time_create         :   { type: Number }
});
mongoose.model('user_v2', UserV2Schema).collection.dropAllIndexes(function (err, results) {
  if (err) console.log('Not Success');
});

UserV2Schema.plugin(AutoIncrement, {inc_field: 'user'});

module.exports = mongoose.model('user_v2', UserV2Schema);
