let axios = require('axios');
var requestify = require('requestify'); 

module.exports = {
    // convertUrlToID: function(string) {
    // 	let result;
	// 	const regex_1 = /[a-z0-9]\/videos\/(.*?)\//;
	// 	const regex_2 = /gm.(.*?)&+/;
	// 	const regex_3 = /photos\/a.(.*?)\//;
	// 	const regex_4 = /permalink\/(.*?)\//;
	// 	const regex_5 = /permalink\.php\?story_fbid=(.*?)&/;
	// 	const regex_6 = /posts\/(.*)/;
	// 	const regex_7 = /posts\/(.*?)\?/;
	// 	const regex_8 = /[0-9]{13,20}/;
	// 	let matching  =  string.match(regex_1) ||  string.match(regex_2) || string.match(regex_3) || string.match(regex_4) || string.match(regex_5) || string.match(regex_7)  || string.match(regex_6) ;
	// 	let matchID  = string.match(regex_8);
	// 	if ( matching ) {
	// 		matching.forEach((match, groupIndex) => {
	// 		    if(groupIndex > 0) {
	// 		    	result = match;
	// 	     	}	     
	// 		});
	// 	}
	// 	if (matchID) {
	// 		matchID.forEach((match, groupIndex) => {
	// 		    	result = match;     
	// 		});
	// 	}
	// 	return result
	// },
	convertUrlToID: function(string) {
    	let result = false;
		let regex_2 = /videos\/(.*?)\//;
		let regex_3 = /photos\/a..*?\/(.*?)\//;
		let regex_4 = /permalink\/(.*?)\//;
		let regex_5 = /permalink\.php\?story_fbid=(.*?)&/;
		let regex_6 = /posts\/(.*?)/;
		let regex_7 = /posts\/(.*?)\?/;
		let regex_8 = /[0-9]{10,30}/;
		let matching  =  string.match(regex_2) || string.match(regex_3) || string.match(regex_4) || string.match(regex_5) || string.match(regex_7)  || string.match(regex_6) ;
		let matchID  = string.match(regex_8);
		if ( matching ) {
			matching.forEach((match, groupIndex) => {
			    if(groupIndex > 0) {
			    	result = match;
		     	}    
			});
		}else if (matchID) {
			matchID.forEach((match, groupIndex) => {
					result = match;     
			});
		}
		return result ? result.replace(/\D/g, '') : '';
    },
    checkIdPostFromGraph : async function (id) {
    	try{
			let token = await this.getToken();
			let response = await axios.get(`https://graph.facebook.com/${id}?access_token=${token}`);
			return response.data;
		} catch(err){
			return false;
		}
	},
	checkSubscribers : async function (id) {
    	try{
			let token = await this.getToken();
			let response = await axios.get(`https://graph.facebook.com/${id}/subscribers?access_token=${token}`);
			return response.data;
		} catch(err){
			return false;
		}
    },
    getToken : function () {
  	 	return new Promise(function(resolve) { 
	    	requestify.request(`${process.env.GET_TOKEN_URL}/api/v1/fb/user/get_one_token`, {
			    method: 'GET',
			    headers: {
			        'Authorization': `${process.env.TOKEN_DEFAULT_GET_TOKEN}`
			    },	
			})
			.then(function(response) {
			  	return resolve(JSON.parse(response.body).data.token);
			})
		})
    },
    getListToken : function (status , limit , action ) {
  	 	return new Promise(function(resolve , reject) { 
	    	requestify.request(`${process.env.GET_TOKEN_URL}/api/v1/fb/user/list?status=${status}&limit=${limit}&action=${action}`, {
			    method: 'GET',
			    headers: {
			        'Authorization': `${process.env.TOKEN_DEFAULT_GET_TOKEN}`
			    },	
			})
			.then(function(response) {
				return resolve(response);
			})
			.catch(err=>{
				return reject(err);
			})
		})
	},
	convertPageId: (link) => {
		let result = false;
		let regex_1 = /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?([\w-.]*)?/gm;
		let m;
		while ((m = regex_1.exec(link)) !== null) {
			if (m.index === regex_1.lastIndex) {
				regregex_1x.lastIndex++;
			}
			m.forEach((match, groupIndex) => {
				if(groupIndex > 0) {
					if(match.search('-') != -1){
						result = match.slice(match.lastIndexOf('-') + 1);
					} else {
						result = match;
					}
		     	} 
			});
		}
		let matchID  = link.match(/[0-9]{10,30}/gm);
		if(!result && matchID) {
			matchID.forEach((match, groupIndex) => {
					result = match;     
			});
		}
		return result;
	},
    sleep : (ms) => {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}