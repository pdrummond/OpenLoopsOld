Meteor.publish('channels', function () {
    return Channels.find();
});

Meteor.publish('messages', function (opts) {
	console.log("opts: " + JSON.stringify(opts));	
	check(opts.channel, String);
	check(opts.limit, Number);
	if(opts.limit > Messages.find().count()) {
		opts.limit = 0;
	}

    return Messages.find({channel: opts.channel}, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,
    "services.github.username": 1
  }});
});