Meteor.publish('channels', function () {
    return Channels.find();
});

Meteor.publish('messages', function (opts) {
	console.log("opts: " + JSON.stringify(opts));	
	check(opts.filter, Object);
	check(opts.limit, Number);
	if(opts.limit > Messages.find().count()) {
		opts.limit = 0;
	}

    return Messages.find(opts.filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,
    "services.github.username": 1
  }});
});