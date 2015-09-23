Accounts.onCreateUser(function(options, user) {	
	console.log("newUser: " + JSON.stringify(user));
	
	var email = user.emails[0].address;

	if(TeamMembers.find().count() == 0) {
		TeamMembers.insert({
			_id: email,
			role: 'ADMIN'
		});
		console.log("Added Team Member " + email + ": " + TeamMembers.find().count() == 1);
	} else {
		var teamMember = TeamMembers.findOne(email);
		if(teamMember == null) {
			throw new Meteor.Error("create-user-failed-001", "You aren't a team member of this OpenLoops Team - please contact paul.drummond@iode.co.uk and ask to be added as a team member");
		}
	}

	user.profileImage = Gravatar.imageUrl(email, {size: 34,default: 'retro'});
	// We still want the default hook's 'profile' behavior.
	if (options.profile) {
		user.profile = options.profile;
	}

	

	return user;
});