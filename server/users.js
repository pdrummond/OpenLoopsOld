Accounts.onCreateUser(function(user) {	
	console.log("newUser: " + JSON.stringify(user));
	user.profileImage = Gravatar.imageUrl(user.email, {size: 34,default: 'retro'});
	return user;
});