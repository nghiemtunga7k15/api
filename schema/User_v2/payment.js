var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var Payment =  mongoose.Schema({
    user_id             :   { type: String , required: true },
    mrc_order_id        :   { type: String , required: true  } ,
    description         :   { type: String , required: true },
    total_amount        :   { type: Number , required: true },
    amount              :   { type: Number , required: true },
    fee_amount          :   { type: Number },
    url_success         :   { type: String },
    url_cancel          :   { type: String },
    url_detail          :   { type: String },
    webhooks            :   { type: String },
    customer_name       :   { type: String },
    customer_email      :   { type: String },
    customer_phone      :   { type: String },
    time_create         :   { type: Number },

});

Payment.plugin(AutoIncrement, {inc_field: 'payment_id'});

module.exports = mongoose.model('payment', Payment);
