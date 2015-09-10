Template.footer.events({
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
		
	}
})

Template.footer.helpers({
	subjectSuggestions: function() {
		return Session.get('subjectSuggestions');
	}
})