Meteor.methods({
	getSubjectSuggestions: function() {
		var suggestions = Items.find({type: {$not: "activity"}}, {limit: opts.limit, sort: {timestamp: -1}}).fetch();
		return suggestions;
	}
});