Template.teamMemberList.helpers({
	teamMembers: function() {
		return TeamMembers.find();
	}
})

Template.teamMember.onRendered(function() {
	this.$('#team-member-dropdown').dropdown({
		action: 'hide'
	});
});

Template.teamMember.events({
	'click #new-member-button': function(e) {
		e.preventDefault();
		var memberEmail = prompt("Team Member Email:");
		if(memberEmail != null && memberEmail.length > 0) {			
			Meteor.call('createTeamMember', {					
				_id: memberEmail,
				role: 'USER'
			}, function(error, result) {
				if(error) {
					alert("Error: " + error);
				}
			});			
		}
	},

	'click #set-admin-user': function(e) {
		e.preventDefault();
		this.role = "ADMIN";
		Meteor.call('updateTeamMember', this, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #set-normal-user': function(e) {
		e.preventDefault();
		this.role = "USER";
		Meteor.call('updateTeamMember', this, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	},

	'click #remove-member-button': function(e) {	
		e.preventDefault();	
		Meteor.call('deleteTeamMember', this._id, function(error, result) {
			if(error) {
				alert("Error: " + error);
			}
		});
	}
});

Template.teamMember.helpers({
	roleName: function() {
		return this.role === 'ADMIN'?'Admin':'User';
	},

	roleIcon: function() {
		return this.role === 'ADMIN'?'spy':'user';
	}	
});