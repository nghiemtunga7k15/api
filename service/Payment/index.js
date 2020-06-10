const axios = require('axios');

let Service = {
	async payment(options) {
		return new Promise(async (resolve, reject) => {
            try {
                // console.log(options);
                let payment = process.env.PRODUCTION != 'dev' ? await axios.post(`${process.env.API_ACCOUNT_VNP}/api/v2/users/services/payment?jwt=${options['token']}`, {
                    amount: options['amount'],
                    description: options['description'],
                    type_service: options['type_service']
                }) : {code: 0};
                return resolve({
                    status: true,
                    message: 'success',
                    payment: payment.data
                })
            } catch (err) {
                // console.log(err.response.data);
                return reject({
                    status: false,
                    message: err.response && err.response.data && err.response.data.message? err.response.data.message : err.message ? err.message : 'Bad request'
                })
            }
        })
	}

}
module.exports = Service ;