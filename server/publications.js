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

Meteor.publish('singleAction', function (id) {
    return Actions.find(id);
});

Meteor.publish('comments', function(messageId) {
    return Comments.find({messageId: messageId});
});

Meteor.publish('messages', function (opts) {
    return Messages.find({}, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish('actions', function (opts) {
	//console.log("opts: " + JSON.stringify(opts));	
	check(opts.filter, Object);
	check(opts.limit, Number);
	if(opts.limit > Actions.find().count()) {
		opts.limit = 0;
	}
    /*var filter = {
        $or: [
            {$and: [{type: 'task'},         _.extend({boardId: opts.board._id}, opts.filter)]},
            {$and: [{type: 'task'},         _.extend({boardId: opts.board._id}, opts.filter)]},
            {$and: [{type: 'activity'},     _.extend({boardId: opts.board._id}, opts.filter)]},
            {$and: [{type: 'message'},      _.extend({boardId: opts.board._id, channel: opts.channel}, opts.filter)]}
        ]
    };*/
    console.log("FILTER: " + JSON.stringify(opts.filter, null, 4));
    return Actions.find(opts.filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,    
    "profileImage": 1,
    "services.github.username": 1
  }});
});