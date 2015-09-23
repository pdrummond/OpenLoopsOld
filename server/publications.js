Meteor.publish('teamMembers', function () {
    return TeamMembers.find();
});

Meteor.publish('boards', function () {
    return Boards.find({'members.userId': this.userId});
});

Meteor.publish('messages', function (opts) {
    var filter = _.extend(opts.filter, {boardId: opts.boardId});
    return Messages.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish('subjectSuggestions', function(opts) {    
    console.log("subjectSuggestions PUBLISHED");
    if(opts && opts.subjectText && opts.subjectText.length > 0) {
        return Items.find({boardId: opts.boardId, title: {'$regex': subjectText}}, {limit: 20, sort: {timestamp: -1}});
    } else {
        return Items.find({boardId: opts.boardId}, {limit: 20, sort: {timestamp: -1}});
    }
});

Meteor.publish('singleAction', function (id) {
    return Items.find(id);
});

Meteor.publish('itemMessages', function (opts) {    
    return Messages.find({boardId: opts.boardId, subjectItemId: opts.subjectItemId}, {limit: opts.limit, sort: {timestamp: 1}});
});

Meteor.publish('actions', function (opts) {
	//console.log("opts: " + JSON.stringify(opts));	
	check(opts.filter, Object);
	check(opts.limit, Number);
	if(opts.limit > Items.find().count()) {
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
    var filter = _.extend({boardId: opts.boardId, itemType: 'action', archived: false}, opts.filter);
    //console.log("ACTION FILTER: " + JSON.stringify(filter, null, 4));

    //Counts.publish(this, 'action-open-count', Actions.find(_.extend({boardId: opts.board._id, archived: false}, opts.filter)), { noReady: true });
    //Counts.publish(this, 'action-archived-count', Actions.find(_.extend({boardId: opts.board._id, archived: true}, opts.filter)), { noReady: true });
    
    return Items.find(filter, {limit: opts.limit, sort: {timestamp: -1}});
});

Meteor.publish("allUsernames", function () {
  return Meteor.users.find({}, {fields: {
    "username": 1,    
    "profileImage": 1,
    "services.github.username": 1
}});
});