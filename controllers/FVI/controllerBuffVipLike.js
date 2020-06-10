const axios = require('axios');
/*----------- SERVICE -----------------*/
let serviceBuffVipLike = require('../../service/FVI/serviceBuffVipLike.js');
let serviceAdmin = require('../../service/Admin/');
let VipLike = require('../../schema/FVI/VipLike');

const tool = require('../../tool/index.js');
module.exports = {
    create: async function (req, res, next) {
        try {
            let fb_id = tool.convertUrlToID(req.body.fb_id);
            if (!fb_id) return res.status(400).json({
                code: 400,
                message: 'Fb id không hợp lệ'
            });
            let typeBuff = req.body.type_buff.toString();
            let arrBuff = typeBuff.split(";");
            let like = arrBuff[0] && arrBuff[0] != '' ? parseInt(arrBuff[0]) : 0;
            let love = arrBuff[1] && arrBuff[1] != '' ? parseInt(arrBuff[1]) : 0;
            let haha = arrBuff[2] && arrBuff[2] != '' ? parseInt(arrBuff[2]) : 0;
            let wow = arrBuff[3] && arrBuff[3] != '' ? parseInt(arrBuff[3]) : 0;
            let sad = arrBuff[4] && arrBuff[4] != '' ? parseInt(arrBuff[4]) : 0;
            let angry = arrBuff[5] && arrBuff[5] != '' ? parseInt(arrBuff[5]) : 0;
            let quantity = like + love + haha + wow + sad + angry;

            let adminSetup = await serviceAdmin.getAdminSetupV2(req, res, 'price_vip_like');

            let timeOneDay = 60 * 60 * 24 * 1000;
            let time_vip_like =  req.body.time_vip_like ? parseInt(req.body.time_vip_like) : 1;
            let dayExpired = new Date().getTime() + (timeOneDay * time_vip_like);
            let total_price = adminSetup.price_vip_like * quantity * time_vip_like;
            let data = {
                fb_id: fb_id,
                owner: req.user.name,
                type_buff: {
                    like: like,
                    love: love,
                    haha: haha,
                    wow: wow,
                    sad: sad,
                    angry: angry,
                },
                user_id: req.user.user_id,
                quantity: quantity,
                price: adminSetup.price_vip_like,
                total_price_pay: total_price,
                time_type: req.body.time_type,
                time_value: req.body.time_value,
                note: req.body.note,
                time_create: new Date().getTime(),
                resources_cookie: req.body.resources_cookie,
                gender_cookie: req.body.gender_cookie,
                type_service: req.body.type_service ? req.body.type_service : 2,
                time_expired: dayExpired ? dayExpired : 0,
                time_vip_like: time_vip_like
            }
            
            serviceBuffVipLike.detail( { user_id: req.user.user_id, status: {$in: [0, 1]}, fb_id: fb_id, type_service: data['type_service']}, async function (err, doc) {
                if(err) return res.status(400).json({ code: 400, message: 'Bad request', errors: err});
                if(doc) return res.json({ code: 400, message: 'Đơn hàng đã tồn tại'});
                let payment = await axios.post(`${process.env.API_ACCOUNT_VNP}/api/users/services/payment?jwt=${req.token}`, {
                    amount: total_price,
                    description: `Mua dịch vụ vip like cho fb id ${fb_id}`,
                    type_service: 'buff_like'
                });
                let data_save = await VipLike.create(data);

                return res.json({ code : 200, message: 'success', data: data_save});
            })
        } catch (err) {
            console.log(err);
            err = err.response && err.response.data ? err.response.data.err : err;
            return res.json({
                code: 400,
                message: err ? err : 'Bad request'
            });
        }
    },
    list: function (req, res, next) {
        let user_id = req.user.level != 99 ? req.user.user_id : false;
        let _limit = req.query.limit ? parseInt(req.query.limit) : 20;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let status = parseInt(req.query.status);
        let sort_name = req.query.sort_name;
        let sort_value = req.query.sort_value;
        let conditions = {};
        if (user_id) conditions['user_id'] = user_id;
        if (req.query.search) conditions['$text'] = {
            $search: req.query.search
        };
        if (status) conditions['status'] = status;

        serviceBuffVipLike.list(conditions, _limit, page, sort_name, sort_value, function (err, docs) {
            if (err) {
                return res.json({
                    code: 404,
                    err: err
                });
            } else {
                return res.json({
                    code: 200,
                    data: docs,
                    page: page,
                    limit: _limit,
                    total: 0
                });

            }
        })
    },
    order: function (req, res, next) {
        serviceBuffVipLike.order(function (err, doc) {
            if (err) {
                return res.json({
                    code: 404,
                    data: {
                        msg: 'Order Not Found'
                    }
                });
            } else {
                return res.json({
                    code: 200,
                    data: doc
                });
            }
        })
    },
    detail: function (req, res, next) {
        serviceBuffVipLike.detail({
            vip_like_id: req.params.id
        }, function (err, doc) {
            if (err) {
                return res.json({
                    code: 404,
                    err: err
                });
            } else {
                return res.json({
                    code: 200,
                    data: doc
                });
            }
        })
    },
    delete: function (req, res, next) {
        serviceBuffVipLike.delete(req.params.id, function (err, doc) {
            if (err) {
                return res.json({
                    code: 404,
                    err: err
                });
            } else {
                return res.json({
                    code: 200,
                    data: doc
                });
            }
        })
    },
    update: async function (req, res, next) {
        try {
            let data = req.body;
            data.time_update = new Date().getTime();
            if (req.body.fb_id){
                let fb_id = tool.convertUrlToID(req.body.fb_id);
                if(!fb_id){
                    return res.status(400).json({
                        code: 400,
                        message: 'Fb id không hợp lệ'
                    });        
                }
                data['fb_id'] = fb_id;
            }
            let doc = await VipLike.findOneAndUpdate({
                vip_like_id: req.params.id
            }, {
                $set: data
            }, {new: true})
            return res.json({
                code: 200,
                message: 'success',
                data: doc
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({ code: 400, message: 'Bad request', errors: err});
        }
    },
    serviceCreateBuff: async function (req, res, next) {
        try {
            let data = req.body;
            serviceBuffVipLike.createBuffLike(req.params.id, data.data, function (err, doc) {
                if (err) return res.status(400).json({ code: 400, message: 'Bad request'});
                return res.json({
                    code: 200,
                    data: doc
                });
            })
        } catch (err) {
            return res.status(400).json({ code: 400, message: 'Bad request', errors: err});
        }
    }
}