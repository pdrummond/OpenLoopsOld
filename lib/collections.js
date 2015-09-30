Boards = new Mongo.Collection("boards");
Messages = new Mongo.Collection('messages');
Items = new Mongo.Collection("items");
TeamMembers = new Mongo.Collection("teamMembers");
Notifications = new Mongo.Collection("notifications");
PodSettings = new Mongo.Collection("podSettings");

Meteor.startup(function() {
	if(PodSettings.find().count() == 0) {
		PodSettings.insert({
			_id: 'default',
			podPrefix: '???'
		});
	}
});

Sortable.collections = ['items'];

Items.allow({ insert: function (userId, doc) { return true; } });
Items.allow({ update: function (userId, doc) { return true; } });