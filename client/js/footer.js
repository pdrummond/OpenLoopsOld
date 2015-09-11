Template.footer.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.footer.helpers({
	messageCreationType: function() {
		return Session.get('messageCreationType') || "message";
	},

	subjectSuggestions: function() {
		return Session.get('subjectSuggestions');
	},

	newItemIcon: function() {
		return OpenLoops.getItemIcon({type:Session.get('newItemType')});
	}
});

Template.footer.events({
	'click #logout-menu-item': function() {
		Meteor.logout();
	},

	'click #create-box-message-menu-item': function() {
		Session.set('messageCreationType', 'message');
	},

	'click #create-box-task-menu-item': function() {
		Session.set('messageCreationType', 'task');
	},

	'click #create-box-milestone-menu-item': function() {
		Session.set('messageCreationType', 'milestone');
	},

	'keypress .input-box_text': function(e) {
		$("#subjectSuggestionPopup").fadeOut();
		var inputVal = $('.input-box_text').val();
		var subjectVal = $('#subject-input').val();
		if(!!inputVal) {
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if (charCode == 13) {
				e.stopPropagation();
				if(inputVal.indexOf('/') == 0) {
					var commandData = inputVal.match(/\/(\w+) (\w+) (.*)/);
					if(commandData && commandData.length == 4) {
						var command = commandData[1];
						var itemType = commandData[2];
						var commandContent = commandData[3];

						switch(command) {
							case 'create': {
								if(itemType == "milestone") {
									OpenLoops.createMilestone(commandContent, function(error, result) {
										if(error) {
											alert("Error: " + error);
										}
									});	
								} else {
									OpenLoops.createAction(itemType, commandContent, subjectVal, function(error, result) {
										if(error) {
											alert("Error: " + error);
										}
									});
								}
								break;
							}
						}
						console.log("command:" + JSON.stringify(commandData));
					}   
				} else {
					OpenLoops.createMessage(inputVal, subjectVal);
				}
				$('.input-box_text').val("");
				return false;
			}    
		}
	},

	'keyup #subject-input': function() {
		var subjectText = $("#subject-input").val();
		if(subjectText != null && subjectText.length > 0) {
			Meteor.call('getSubjectSuggestions', {subjectText: subjectText}, function(error, result) {			
				if(!error) {
					Session.set('subjectSuggestions', result);
					$("#subjectSuggestionPopup").fadeIn();
				}
			});
		} else {
			$("#subjectSuggestionPopup").fadeOut();
		}	
	},

	'click #new-item-icon': function() {		
		var type = Session.get('newItemType');
		switch(type) {
			case 'message': type = 'discussion'; break;
			case 'discussion': type = 'task'; break;
			case 'task': type = 'bug'; break;
			case 'bug': type = 'message'; break;
			default: type = 'message'; break;
		}
		Session.set('newItemType', type);
	}
});
