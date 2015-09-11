Meteor.methods({
	getSubjectSuggestions: function(opts) {
		opts = opts || {};
		var suggestions = Items.find(
			{text: {$regex:opts.subjectText}},
			{limit: 20, sort: {timestamp: -1}}
		).fetch();
		return suggestions;
	}
});