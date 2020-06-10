require('dotenv').config()
var mongoose = require('mongoose');
const ScanComment = require('../schema/ST/ScanComment.js');
const ScanCommentBackup = require('../schema/ST/ScanBackup.js');

// Connect To Database
const MONGODB_URI = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
const authData =  {
    "user": `${process.env.DB_USERNAME}`,
    "pass": `${process.env.DB_PASSWORD}`,
    "useNewUrlParser": true,
    "useCreateIndex": true
}; 
mongoose.connect(
    MONGODB_URI, 
    authData,
    (err) => {
        if (!err) { console.log('MongoDB connection succeeded.'); }
        else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
    }
);

async function run(){
    try{
        let scan = await ScanCommentBackup.findOne().select({_id: 0});

        if(scan){
            let move = await new ScanComment({
                owner: scan.owner,
                total_comment: scan.total_comment,
                total_price_pay: scan.total_price_pay && scan.total_price_pay != undefined ? parseInt(scan.total_price_pay) : 0,
                name_fanpage: scan.name_fanpage,
                note: scan.note,
                log_time: scan.log_time,
                status: scan.status == 1? 0 : scan.status,
                last_time: scan.last_time,
                time_delete: scan.time_delete && scan.time_delete != undefined ? parseInt(scan.time_delete) : 0,
                time_stop: scan.time_stop && scan.time_stop != undefined ? parseInt(scan.time_stop) : 0,
                time_update: scan.time_update && scan.time_update != undefined ? parseInt(scan.time_update) : 0,
                fb_id: scan.fb_id,
                user_id: scan.user_id,
                minutes: scan.minutes && scan.minutes != undefined ? parseInt(scan.minutes) : 0,
                time_create: scan.time_create && scan.time_create != undefined ? parseInt(scan.time_create) : 0,
                time_expired: scan.time_expired && scan.time_expired != undefined ? parseInt(scan.time_expired) : 0,
                type_order: scan.type_order && scan.type_ordern != undefined ? scan.type_order : {},
                idScanCmt: scan.idScanCmt,
                type: scan.type,
                price_pay: scan.price_pay
              }).save();
              await ScanCommentBackup.deleteOne({
                idScanCmt: scan.idScanCmt
              })
            console.log('done');
        } else{
            console.log('success')
        }
    } catch(err){
        console.log('error----------', err);
    }
}
setInterval(() => {
    run();
}, 300)
// run();