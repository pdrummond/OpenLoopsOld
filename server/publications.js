Meteor.publish('channels', function () {
    return Channels.find();
});

Meteor.publish('milestones', function (boardId) {    
    return Milestones.find({boardId: boardId});
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

Meteor.publish('comments', function(actionId) {
    return Comments.find({actionId: actionId});
});

Meteor.publish('messages', function (opts) {

    var filter = {
        $or: [
            {type: 'activity', boardId: opts.board._id, },
            {type: 'message',  boardId: opts.board._id, channel: opts.channel}
        ]
    };
    console.log("MESSAGES FILTER: " + JSON.stringify(filter, null, 4));
    return Messages.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
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
    var filter = _.extend({boardId: opts.board._id, archived: false}, opts.filter);
    //console.log("ACTION FILTER: " + JSON.stringify(filter, null, 4));

    Counts.publish(this, 'action-open-count', Actions.find(_.extend({boardId: opts.board._id, archived: false}, opts.filter)), { noReady: true });
    Counts.publish(this, 'action-archived-count', Actions.find(_.extend({boardId: opts.board._id, archived: true}, opts.filter)), { noReady: true });
    
    return Actions.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,    
    "profileImage": 1,
    "services.github.username": 1
  }});
});