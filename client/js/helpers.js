
Template.registerHelper('itemIcon', function (item) {	
	return OpenLoops.getItemIcon(item);
});


Template.registerHelper('itemIconColor', function (item) {	
	switch(item.type) {
		case 'task': return 'green'; 
		case 'bug': return 'red';
		default: return 'green';
	}
});

Template.registerHelper('itemTitle', function (item) {
	return item.title;
});

Template.registerHelper('itemHideIfNoMilestone', function (item) {
	var milestone = Milestones.findOne(item.milestoneId);
	return milestone == null?'hide':'';
});

Template.registerHelper('itemMilestoneTitle', function (item) {
	var milestone = Milestones.findOne(item.milestoneId);	
	return milestone == null?"No Milestone":milestone.title;
});

Template.registerHelper('sidLabel', function (item) {
	return OpenLoops.getSidLabel(item);
});

Template.registerHelper('subjectLabel', function (item) {
	var subjectLabel = '';
	if(item.subjectItemId) {
		var subjectItem = Items.findOne(item.subjectItemId);
		if(subjectItem) {
			subjectLabel = "[" + OpenLoops.getSidLabel(subjectItem) + " " + subjectItem.title + "]: ";
		}
	} 
	return subjectLabel;
});

Template.registerHelper('itemStatusLabel', function (item) {	
	return OpenLoops.ActionStatusMeta[item.status].label || 'ERR: No Status';
});

Template.registerHelper('itemStatusColor', function (item) {	
	return OpenLoops.ActionStatusMeta[item.status].color || 'ERR: No Color';
});

Template.registerHelper('boards', function (context) {
	return Boards.find();
});

Template.registerHelper('currentBoardId', function (context) {
	return Session.get('currentBoard')._id;
});

Template.registerHelper('channelName', function () {	
	return Session.get('channel');
});

Template.registerHelper('channelMid', function () {	
	var channelUid = '';
	var channel = Channels.findOne({name: Session.get('channel'), boardId: Session.get('currentBoard')._id});	
	if(channel.type == 'action-channel') {
		channelUid = "#" + Boards.findOne(channel.action.boardId).prefix + "-" + channel.action.mid;
	}
	return channelUid;
});

Template.registerHelper('channelDescription', function (name) {	
	var channel = Channels.findOne({name: name || Session.get('channel'), boardId: Session.get('currentBoard')._id});
	return channel.description || "No Description";
});


Template.registerHelper('channelIcon', function (name) {	
	var channel = Channels.findOne({name: name || Session.get('channel'), boardId: Session.get('currentBoard')._id});
	return channel.type == 'action-channel'?'tasks': 'comments outline';
});

Template.registerHelper('channelTypeLabel', function (name) {	
	var channel = Channels.findOne({name: name || Session.get('channel'), boardId: Session.get('currentBoard')._id});
	return channel.type == 'action-channel'?'Action': 'Discussion';
});

Template.registerHelper('channels', function (context) {
	return Channels.find({boardId: Session.get('currentBoard')._id}, {sort: {timestamp: 1}});
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
		if(userId == 'habot') {
			return '/images/loopy.png';
		} else {
			return Meteor.users.findOne(userId).profileImage;
		}
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
			Session.get('currentBoard')._id + "/action/" + obj.action._id + 
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
	if(userId === 'habot') {
		return 'Habot';
	} else {
		var user = Meteor.users.findOne({_id: userId});
		if (typeof user === "undefined") {
			return "Anonymous";
		}
		if (typeof user.services.github !== "undefined") {
			return user.services.github.username;
		}
		return user.username;
	}
});

Template.registerHelper('comments', function (context) {
	return Comments.find({actionId: Session.get('selectedAction')._id});
});


Template.registerHelper('timeAgo', function (context, options) {
	Session.get("time");
	if (context) {
		return moment(context).fromNow();
	}
});

Meteor.setInterval(function() {
	Session.set("time", new Date().getTime());
}, 60000);