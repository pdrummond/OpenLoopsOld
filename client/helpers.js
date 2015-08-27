
Template.registerHelper('actionIcon', function (action) {	
	switch(action.type) {
		case 'task': return 'check circle outline'; 
		case 'bug': return 'bug';
		default: return 'circle';
	}
});

Template.registerHelper('actionUid', function (action) {
	return "#" + Boards.findOne(action.boardId).prefix + "-" + action.uid;
});

Template.registerHelper('actionStatusLabel', function (action) {	
	return OpenLoops.ActionStatusMeta[action.status].label || 'ERR: No Status';
});

Template.registerHelper('actionStatusColor', function (action) {	
	return OpenLoops.ActionStatusMeta[action.status].color || 'ERR: No Color';
});

Template.registerHelper('boards', function (context) {
	return Boards.find();
});

Template.registerHelper('currentBoardId', function (context) {
	return Session.get('currentBoard')._id;
});

Template.registerHelper('channels', function (context) {
	return Channels.find({boardId: Session.get('currentBoard')._id});
});

Template.registerHelper('filters', function (context) {
	return Filters.find({
		boardId: Session.get('currentBoard')._id, 
		channel: Session.get('channel')
	});
});

Template.registerHelper('currentBoardTitle', function (context) {
	return Session.get('currentBoard').title;
});

Template.registerHelper('profileImage', function (context) {
	if(context) {
		var userId = _.isObject(context) ? context._id : context;		
		return Meteor.users.findOne(userId).profileImage;
	}
});

Template.registerHelper('milestones', function() {
	return Milestones.find();
});

Template.registerHelper('currentChannel', function () {
	return Session.get('channel');
});

Template.registerHelper("timestampToTime", function (timestamp) {
	var date = new Date(timestamp);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
});

Template.registerHelper("truncateCommentText", function (obj, text, maxSize) {	
	if(text.length > maxSize) {
		return parseMarkdown(text.substring(0, maxSize)).replace(/^<p>/, '').replace(/<\/p>$/,'') + 
		"... (<a href='/board/" + 
			Session.get('currentBoard')._id + "/task/" + obj.task._id + 
			"/comments/" + obj.comment._id + "'> Read More </a>)";	
} else {
	return parseMarkdown(text).replace(/^<p>/, '').replace(/<\/p>$/,'');
}
});

Template.registerHelper("currentUserName", function () {
	var user = Meteor.user();
	if(user != null) {
		return user.username;
	}
});

Template.registerHelper("usernameFromId", function (userId) {
	var user = Meteor.users.findOne({_id: userId});
	if (typeof user === "undefined") {
		return "Anonymous";
	}
	if (typeof user.services.github !== "undefined") {
		return user.services.github.username;
	}
	return user.username;
});

Template.registerHelper('comments', function (context) {
	return Comments.find({actionId: Session.get('selectedAction')._id});
});
