OpenLoops = {

	/*
		Get description of the provided channel name.  If no name is provided, then 
		the current session channel is assumed.
	*/
	getChannelDescription: function(name) {
		console.log('getChannelDescription');
		var channel = Channels.findOne({name: name || Session.get('channel'), boardId: Session.get('currentBoard')._id});
		return channel.description || "";
	},	

	onFilterInput: function() {
		var self = this;
		if(this.keyTimer) {
			clearTimeout(this.keyTimer);
		}
		this.keyTimer = setTimeout(function() {
			Session.set("filterString", $(".input-box_filter").val());
		}, 1000);
	},

	getFilter: function(filterString) {
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
			if(field == "milestone") {
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
		console.log("Current filter is: " + JSON.stringify(filter));
		return filter;
	},

	scrollBottom: function() {
		$('.message-history').scrollTop($('.message-history')[0].scrollHeight);
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
			boardId: Session.get('currentBoard')._id,
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

	createMessage: function(messageType, text) {
		messageType == messageType || 'message';
		Meteor.call('createMessage', {
			boardId: Session.get('currentBoard')._id,
			channel: Session.get('channel'),
			type: messageType,
			text: text,  
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			} else {
				OpenLoops.scrollBottomAnimate();
			}
		});
	},

	createAction: function(actionType, title) {
		actionType == actionType || 'task';
		Meteor.call('createAction', {
			boardId: Session.get('currentBoard')._id,			
			type: actionType,
			title: title
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	createMilestone: function(title, callback) {
		Meteor.call('createMilestone', {
			boardId: Session.get('currentBoard')._id,			
			title: title, 
		}, Session.get('channel'), callback);
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
}