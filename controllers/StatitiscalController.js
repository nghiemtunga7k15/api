/*----------- SERVICE -----------------*/
let Statitiscal = require('../schema/Statitiscal');
let CountOrder = require('../schema/CountOrder');

module.exports = {
	buff : async function(req, res) {
		try {
            let type = req.query.type ? req.query.type : 'day';
            let format = '%Y-%m-%d';
            let limit = req.query.limit && req.query.limit < 20 ? parseInt(req.query.limit) : 7;

            switch(type){
                case 'day':
                    format = '%Y-%m-%d';
                    break;
                case 'month': 
                    format = '%Y-%m';
                    break;
                case 'year': 
                    format = '%Y';
                    break;
                default:
            }
            let statitiscals = await Statitiscal.aggregate(
                [
                    {
                        $addFields: { convert_date: { $toDate: "$date" } }
                    },
                    {
                        $addFields: {
                            year: { $year: "$convert_date" },
                            month: { $month: "$convert_date" },
                            day: { $dayOfMonth: "$convert_date" },
                            hour: { $hour: "$convert_date" },
                            minutes: { $minute: "$convert_date" },
                            seconds: { $second: "$convert_date" },
                            milliseconds: { $millisecond: "$convert_date" },
                            dayOfYear: { $dayOfYear: "$convert_date" },
                            dayOfWeek: { $dayOfWeek: "$convert_date" },
                            week: { $week: "$convert_date" },
                            date_format: { $dateToString: { format: format, date: "$convert_date" } }
                        }
                    },
                    {
                        $group: {
                            _id: "$date_format",
                            buff_eye: {$sum: "$buff_eye"},
                            buff_like: {$sum: "$buff_like"},
                            buff_comment: {$sum: "$buff_comment"},
                            buff_sub: {$sum: "$buff_sub"},
                            buff_like_page: {$sum: "$buff_like_page"},
                            seeding: {$sum: "$seeding"},
                            vip_like: {$sum: "$vip_like"},
                            vip_eye: {$sum: "$vip_eye"}
                        }
                    },
                    { $addFields: {date: "$_id"}},
                    { $project: {_id: 0} },
                    { $sort: { date: -1 } },
                    { $limit: limit },
                    { $sort: { date: 1 } }
                ]
            )
            let counts = await CountOrder.find({});
            return res.json({
                code: 200,
                data: {
                    statitiscal: statitiscals,
                    count: counts
                }
            })
        } catch (err) {
            return res.status(400).json({ code: 400, message: 'Bad request', error: err});
        }
	}
}  