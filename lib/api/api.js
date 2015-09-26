OpenLoops = {

	getSidLabel: function(item) {
		return "#" + Boards.findOne(item.boardId).prefix + "-" + item.sid;
	},

	getItemIcon: function(item) {
		switch(item.type) {
			case 'message': return 'comment';
			case 'discussion': return 'comments outline';
			case 'task': return 'warning circle'; 
			case 'bug': return 'bug';
			case 'post': return 'mail';
			case 'todo': return 'check';
		}
	},

	onMessageFilterInput: function() {

		var self = this;
		if(this.messageKeyTimer) {
			clearTimeout(this.messageKeyTimer);
		}
		this.messageKeyTimer = setTimeout(function() {			
			Session.set("messageFilterString", $(".message-filter-input").val());
		}, 1000);
	},

	onActionFilterInput: function() {
		var self = this;
		if(this.keyTimer) {
			clearTimeout(this.keyTimer);
		}
		this.keyTimer = setTimeout(function() {
			Session.set("actionFilterString", $(".input-box_filter").val());
		}, 1000);
	},

	getMessageFilter: function(filterString) {
		var filter = {};		
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {	   
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			filter[field] = value; 
			match = re.exec(filterString);			
		}
		if(remainingText && remainingText.length > 0) {
			console.log("REMAINING TEXT: " + remainingText);
			filter["$or"] = [{text: {$regex:remainingText}}, {subject: remainingText.replace('[','').replace(']','')} ];
		}
		//filter.channel = Session.get('channel');		
		console.log("Current MESSAGE filter is: " + JSON.stringify(filter));
		return filter;
	},

	getActionFilter: function(filterString) {
		var filter = {};		
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-@]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {	   
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			
			if(field == "member") {
				field = "members";
			} else if(field == "milestone") {
				//if the filter is milestone:sprint1 then we need to convert this to the milestoneId:<milestoneId>
				field = "milestoneId";
				var milestones = Milestones.find({title:value}).fetch();
				if(milestones.length > 0) {
					value = milestones[0]._id;
				}
			} 
			filter[field] = value; 
			match = re.exec(filterString);			
		}
		if(remainingText && remainingText.length > 0) {
			filter["$or"] = [{title: {$regex:remainingText}}, {description: {$regex:remainingText}}, {text: {$regex:remainingText}}];
		}
		//filter.channel = Session.get('channel');		
		console.log("Current ACTION filter is: " + JSON.stringify(filter));
		return filter;
	},

	scrollBottom: function() {
		$('.message-history').scrollTop($('.message-history')[0].scrollHeight);
		OpenLoops.atBottom = true;
		Session.set('newMessageCount', 0);
	},

	scrollToElement: function(wrapperEl, el) {
		$('html, body').animate({
			scrollTop: $(el).offset().top
		}, 200);
	},

	scrollBottomAnimate: function() {
		$(".message-history").stop().animate({scrollTop:$('.message-history')[0].scrollHeight}, 500, 'swing');
	},

	createHabotMessage: function(text) {
		Meteor.call('createHabotMessage', {
			boardId: Session.get('currentBoardId'),
			channel: Session.get('channel'),			
			text: text,  
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			} else {
				OpenLoops.scrollBottomAnimate();
			}
		});
	},

	createAction: function(type,title, subjectItemId) {
		OpenLoops.createItem(type, 'action', title, '', '', subjectItemId);
	},

	createMessage: function(text, subjectItemId) {
		subjectItemId = subjectItemId || '';
		Meteor.call('createMessage', {
			type: 'chat-message',
			boardId: Session.get('currentBoardId'),
			text: text,
			subjectItemId: subjectItemId
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			} else {
				OpenLoops.scrollBottomAnimate();
			}
		});
	},

	createItem: function(type, itemType, title, text, members, subjectItemId) {
		subjectItemId = subjectItemId || '';
		type = type || 'task';

		var memberList = [];
		if(members != null && members.length > 0) {
			if(members.indexOf(',') != -1) {
				memberList = members.split(',');
			} else {
				memberList.push(members);
			}
		}

		Meteor.call('createItem', {
			itemType: itemType,	
			type: type,
			boardId: Session.get('currentBoardId'),
			title: title,
			text: text,
			members: memberList,
			subjectItemId: subjectItemId
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			} else {
				OpenLoops.scrollBottomAnimate();
			}
		});
	},

	Notify: {
		init: function() {
			if(notify.permissionLevel() == notify.PERMISSION_DEFAULT) {
				notify.requestPermission();
			}
		},

		show: function(notification) {
			var fromUser = Meteor.users.findOne(notification.fromUserId);
			console.log("notification: " + notification.messageId);
			var n;
			if(notification.type == 'new-message-mention') {
				var body = '';
				var msg = Messages.findOne(notification.messageId);
				if(msg) {
					body = msg.text;
				}
				n = notify.createNotification('OpenLoops Mention', {
					icon: 'https://www.openloopz.com/images/openloopz-o.png',
					body: "@" + fromUser.username + ": " + body,
					tag: notification._id
				});
			} else if(notification.type == 'new-item-member') {
				var item = Items.findOne(notification.itemId);

				if(notification.itemType == 'post') {	
					n = notify.createNotification('OpenLoops New Post', {
						icon: 'https://www.openloopz.com/images/openloopz-o.png',
						body: "@" + fromUser.username + ':' + item.text,
						tag: notification._id
					});
				} else {					
					n = notify.createNotification('OpenLoops ' + item.type, {
						icon: 'https://www.openloopz.com/images/openloopz-o.png',
						body: "@" + fromUser.username + ': You are a member of ' + OpenLoops.getSidLabel(item),
						tag: notification._id
					});
				}
			}
			if(n != null) {
				Meteor.call('deleteNotification', notification._id);
			}
		}
	},

	TaskStatus: {
		'new': {label: 'New', color: 'teal'},
		'open': {label: 'Open', color: 'green'},
		'in-progress': {label: 'In Progress', color: 'purple'},
		'blocker': {label: 'Blocker', color: 'red'},
		'in-test': {label: 'In-Test', color: 'yellow'},
		'done': {label: 'Done', color: 'blue'}
	},

	DEFAULT_STATUS_VALUE: "new",
	MESSAGE_LIMIT_INC: 30,
	COMMENT_LIMIT_INC: 50,

	atBottom: true
}