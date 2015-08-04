Accounts.onCreateUser(function(options, user) {	
	console.log("newUser: " + JSON.stringify(user));
	user.profileImage = Gravatar.imageUrl(user.emails[0].address, {size: 34,default: 'retro'});
	// We still want the default hook's 'profile' behavior.
	if (options.profile) {
		user.profile = options.profile;
	}
	return user;
});