const axios = require('axios');
let Service = {
	async createBuff (data ) {
		return new Promise(async (reslove, reject) => {
            try{
                let response = await axios.post(`${process.env.API_PARTNER}/2T_modun/request.php`, data, {
                    headers: {
                        'x-access-token' : process.env.TOKEN_PARTNER
                    }
                });
                response = response.data;
                if(response.error) return reject(response.msg)
                return reslove(response);
            } catch(err){
                return reject(err);
            }
        })
	}
}
module.exports = Service ;