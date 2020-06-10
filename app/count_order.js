require('../db');
const tool = require('../tool');

const Statitiscal = require('../schema/Statitiscal');
const CountOrder = require('../schema/CountOrder');

const BuffEye = require('../schema/FVI/BuffEye');
const BuffLike = require('../schema/FVI/BuffLike');
const BuffComment = require('../schema/FVI/BuffComment');
const BuffSub = require('../schema/FVI/BuffSub');
const LikePage = require('../schema/FVI/LikePage');
const Seeding = require('../schema/Seeding');
const VipLike = require('../schema/FVI/VipLike');
const VipEye = require('../schema/FVI/VipEye');
const setup = process.argv[2] ? parseInt(process.argv[2]) : 0;

var timestamps = 0;
async function run_statitiscal(timestamps) {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(timestamps);
            let query = {
                time_create: {
                    $lt: timestamps + (60 * 60 * 1000 * 24),
                    $gte: timestamps
                }
            }

            let date_string = new Date(timestamps);
            let date = date_string.getDate();
            let month = date_string.getMonth() + 1;
            let year = date_string.getFullYear();
            date = date < 10 ? '0' + date : date;
            month = month < 10 ? '0' + month : month;
            let full_date = `${date}-${month}-${year}`;
            let data = {
                date: full_date,
                buff_eye: await countData('buff_eye', { ...query, id_vip: { $in: [null, ''] } }),
                buff_like: await countData('buff_like', { ...query, vip_id: { $in: [null, ''] } }),
                buff_comment: await countData('buff_comment', query),
                buff_sub: await countData('buff_sub', query),
                buff_like_page: await countData('buff_like_page', query),
                seeding: await countData('seeding', query),
                vip_like: await countData('vip_like', query),
                vip_eye: await countData('vip_eye', query)
            }
            let results = await Statitiscal.findOneAndUpdate({
                date: full_date
            }, { $set: data }, { new: true, upsert: true });
            return resolve({ status: true, results: results });
        } catch (err) {
            return reject({ status: false, error: err });
        }
    })
}
async function countAll() {
    return new Promise(async (resolve, reject) => {
        try {
            let bulkWrite = [
                {
                    "updateOne": {
                        "filter": { type: 'buff_eye' },
                        "update": { $set: { total: await countData('buff_eye'), type_name: 'Buff mắt' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'buff_like' },
                        "update": { $set: { total: await countData('buff_like'), type_name: 'Buff cảm xúc' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'buff_comment' },
                        "update": { $set: { total: await countData('buff_comment'), type_name: 'Buff comment' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'buff_sub' },
                        "update": { $set: { total: await countData('buff_sub'), type_name: 'Buff sub' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'buff_like_page' },
                        "update": { $set: { total: await countData('buff_like_page'), type_name: 'Like page' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'seeding' },
                        "update": { $set: { total: await countData('seeding'), type_name: 'Seeding comment' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'vip_like' },
                        "update": { $set: { total: await countData('vip_like'), type_name : 'Vip cảm xúc' } },
                        "upsert": true
                    }
                },
                {
                    "updateOne": {
                        "filter": { type: 'vip_eye' },
                        "update": { $set: { total: await countData('vip_eye'), type_name: 'Vip mắt' } },
                        "upsert": true
                    }
                }
            ];
            let result = await CountOrder.bulkWrite(bulkWrite, { ordered: false });

            return resolve({ status: true });
        } catch (err) {
            return reject({ status: false, error: err });
        }
    })
}
async function countData(model = '', query = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            switch (model) {
                case 'buff_eye':
                    model = BuffEye;
                    break;
                case 'buff_like':
                    model = BuffLike;
                    break;
                case 'buff_comment':
                    model = BuffComment;
                    break;
                case 'buff_sub':
                    model = BuffSub;
                    break;
                case 'buff_like_page':
                    model = LikePage;
                    break;
                case 'seeding':
                    model = Seeding;
                    break;
                case 'vip_like':
                    model = VipLike;
                    break;
                case 'vip_eye':
                    model = VipEye;
                    break;

            }
            let count = model ? await model.count(query) : 0;
            return resolve(count);
        } catch (err) {
            return reject(err);
        }
    })
}

async function run() {
    try {
        if(setup) {
            console.log(setup);
            let promise = [];
            let now = new Date();
                now.setHours(0, 0, 0, 0);
            timestamps = now.getTime();
            for(let i = 0; i < setup; i++){
                timestamps = timestamps - (60 * 60 * 1000 * 24);
                promise.push(new Promise(async (resolve, reject) => {
                    try {
                        let result = await run_statitiscal(timestamps);
                        console.log(result);
                        return resolve({status: true});
                    } catch (err) {
                        return reject(err);
                    }
                }))
            }
            await Promise.all(promise);
            console.log('done');
            process.exit();
        } else {
            while (true) {
                console.log('start----', Date.now());
                let now = new Date();
                now.setHours(0, 0, 0, 0);
                if (timestamps != now.getTime()) {
                    timestamps = now.getTime();
                    await run_statitiscal(timestamps - (60 * 60 * 1000 * 24));
                }
                await run_statitiscal(timestamps);
                await countAll();
                console.log('done');
                await tool.sleep(process.env.TIME_COUNT_ORDER ? parseInt(process.env.TIME_COUNT_ORDER) * (60 * 1000) : 60 * 1000 * 60);
            }
        }
    } catch (err) {
        console.log('Log tong ', err);
    }
}

run();