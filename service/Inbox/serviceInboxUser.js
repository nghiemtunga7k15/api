const InboxUser= require('../../schema/Inbox/InboxUser.js');
let InboxService = {
	save(data , cb ) {
		InboxUser.insertMany(data, function (err, api) { 
	      	if (err) return cb(err , null);
	      	return cb(null, api);
		 });
	}
}
module.exports = InboxService ;