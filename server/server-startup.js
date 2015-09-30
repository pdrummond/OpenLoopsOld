Meteor.startup(function() {

});

function reorderAllItems() {
	var order = 0;
	Items.find().forEach(function(item) {
		Items.update(item._id, {$set: {order: ++order}});
	});
}