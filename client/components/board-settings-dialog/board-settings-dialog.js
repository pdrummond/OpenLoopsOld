Template.boardSettingsDialog.onRendered(function() {
	this.$('.menu .item').tab();
});

Template.boardSettingsDialog.helpers({
	boardMembers: function() {
		return Boards.findOne(Session.get('currentBoardId')).members;
	},

	boardStatusSlots: function() {
		return Boards.findOne(Session.get('currentBoardId')).statusSlots;
	}
});


Template.boardMember.onRendered(function() {
	this.$('#board-member-dropdown').dropdown({
		action: 'hide'
	});
});

Template.boardMember.events({
	'click #new-member-button': function() {
		var memberName = prompt("Board Member Name:");		
		if(memberName != null && memberName.length > 0) {
			var user = Meteor.users.findOne({username: memberName});
			if(user == null) {
				alert("No user found with that name.  Please try again"); 
			} else {
				Meteor.call('createBoardMember', {
					boardId: Session.get('currentBoardId'),
					userId: user._id,
					role: 'USER'
				}, function(error, result) {
					if(error) {
						alert("Error: " + error);
					}
				});
			}
		}
	},

	'click #set-admin-user': function() {
		Meteor.call('updateBoardMemberRole', Session.get('currentBoardId'), this.userId, "ADMIN", function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #set-normal-user': function() {
		Meteor.call('updateBoardMemberRole', Session.get('currentBoardId'), this.userId, "USER", function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #remove-member-button': function() {		
		Meteor.call('deleteBoardMember', Session.get('currentBoardId'), this.userId, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},		
});

Template.boardMember.helpers({
	roleName: function() {
		return this.role === 'ADMIN'?'Admin':'User';
	},

	roleIcon: function() {
		return this.role === 'ADMIN'?'spy':'user';
	}
});

Template.statusSlotItem.events({
	'click #new-status-slot-button': function() {
		Meteor.call('createStatusSlot', Session.get('currentBoardId'), {
			label: '',
			value: '',
			color: 'gray'
		}, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #remove-status-slot-button': function() {		
		Meteor.call('deleteStatusSlot', Session.get('currentBoardId'), this.value, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	}
});

