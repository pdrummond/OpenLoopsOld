Meteor.publish('channels', function () {
    return Channels.find();
});

Meteor.publish('milestones', function () {
    return Milestones.find();
});

Meteor.publish('filters', function () {
    return Filters.find();
});

Meteor.publish('boards', function () {
    return Boards.find();
});

Meteor.publish('boardMembers', function() {
    return BoardMembers.find();
});

Meteor.publish('singleMessage', function (id) {
    return Messages.find(id);
});

Meteor.publish('comments', function(messageId) {
    return Comments.find({messageId: messageId});
});

Meteor.publish('messages', function (opts) {
	//console.log("opts: " + JSON.stringify(opts));	
	check(opts.filter, Object);
	check(opts.limit, Number);
	if(opts.limit > Messages.find().count()) {
		opts.limit = 0;
	}
    var filter = {
        $or: [
            {$and: [{type: 'task'},         _.extend({boardId: opts.board._id}, opts.filter)]},
            {$and: [{type: 'activity'},     _.extend({boardId: opts.board._id}, opts.filter)]},
            {$and: [{type: 'message'},      _.extend({boardId: opts.board._id, channel: opts.channel}, opts.filter)]}
        ]
    };
    console.log("FILTER: " + JSON.stringify(filter, null, 4));
    return Messages.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,    
    "profileImage": 1,
    "services.github.username": 1
  }});
});