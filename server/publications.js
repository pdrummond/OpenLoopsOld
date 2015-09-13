Meteor.publish('messages', function (opts) {    
    return Messages.find(opts.filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish('singleAction', function (id) {
    return Actions.find(id);
});


Meteor.publish('actionDetailMessages', function (opts) {    
    console.log("PUBLISHING 'actionDetailMessages' for channel: " + opts.channel);
    return Messages.find({boardId: opts.board._id, channel: opts.channel}, {limit: opts.limit, sort: {timestamp: 1}});
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
    var filter = _.extend({boardId: opts.board._id, type: 'action', archived: false}, opts.filter);
    //console.log("ACTION FILTER: " + JSON.stringify(filter, null, 4));

    Counts.publish(this, 'action-open-count', Actions.find(_.extend({boardId: opts.board._id, archived: false}, opts.filter)), { noReady: true });
    Counts.publish(this, 'action-archived-count', Actions.find(_.extend({boardId: opts.board._id, archived: true}, opts.filter)), { noReady: true });
    
    return Items.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,    
    "profileImage": 1,
    "services.github.username": 1
  }});
});