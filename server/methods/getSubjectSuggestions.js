Meteor.methods({
	getSubjectSuggestions: function(opts) {
		opts = opts || {};
		var suggestions = Items.find(
			{$and: [{$or: [{type: 'bug'}, {type:'task'}]}, {title: {$regex:opts.subjectText}}]},
			{limit: 20, sort: {timestamp: -1}}
		).fetch();
		return suggestions;
	}
});