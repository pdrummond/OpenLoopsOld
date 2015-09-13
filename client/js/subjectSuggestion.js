Template.subjectSuggestion.events({
	'click': function() {
		Session.set('newSubjectItemId', this._id);
		Session.set('newSubjectItemType', this.type);
		//$("#subject-input").val(OpenLoops.getSidLabel(this) + " " + this.title);
		$("#subjectSuggestionPopup").fadeOut();
		$("#message-input").focus();
	}
});