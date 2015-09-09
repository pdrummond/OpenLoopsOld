Template.newChannelOverlay.events({
	'submit #new-channel-overlay': function(e) {
		e.preventDefault();
		e.stopPropagation();
		var name = $('input[name="name"]').val();
		if(name && name.length > 0) {

			var channel = {
				boardId: Session.get('currentBoard')._id,
				name: name,
				type: $('input[name="type"]').val(),
				members: $('input[name="members"]').val().split(","),
				description: $('textarea[name="description"]').val(),
			};			
			$('#new-channel-overlay').fadeOut();			
			Meteor.call('createChannel', channel);
			Session.set('channel', name);
		}
	}
});	