Template.missionControl.events({
	'click #boards-menu-item': function() {
		Session.set('missionControl.activeTabTemplate', 'boardList');
	},
	
	'click #team-members-menu-item': function() {
		Session.set('missionControl.activeTabTemplate', 'teamMemberList');
	},
	
	'click #pod-settings-menu-item': function() {
		Session.set('missionControl.activeTabTemplate', 'podSettings');
	},

	'click #debug-options-menu-item': function() {
		Session.set('missionControl.activeTabTemplate', 'debugOptions');
	},


	'click #logout-menu-item': function() {
		Meteor.logout();
	},
})

Template.missionControl.helpers({
	activeTabTemplate: function() {
		return Session.get('missionControl.activeTabTemplate');
	},

	activeTab: function(tabName) {
		return Session.get('missionControl.activeTabTemplate') == tabName ? 'active':'';
	}
});