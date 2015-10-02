Template.podSettings.events({
	"click #save-pod-settings": function(e) {
		e.preventDefault();
		var input = $("#pod-prefix-input").val();
		if(input != null && input.length > 0) {
			Meteor.call('updatePodPrefix', input);
		}
	}
});