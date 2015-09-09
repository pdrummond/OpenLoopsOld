Template.editor.onRendered( function() {
	var self = this;

	var description = this.data.description || '';//OpenLoops.getChannelDescription(Session.get('channel'));

	Meteor.promise( "convertMarkdown", description).then( function( html ) {
		if(description == null || description.trim().length == 0) {
			$("#preview").html("<strong>Double click here to add a description</strong>");
		} else {
			$("#preview").html( html );
		}
	});

	this.editor = CodeMirror.fromTextArea( this.find( "#editor" ), {
		lineNumbers: false,
		fixedGutter: false,
		mode: "markdown",
		lineWrapping: true,
		indentWithTabs:false,
		//cursorHeight: 0.85,
		placeholder: "Type Description here"
	});
});

Template.editor.events({
	'keyup .CodeMirror': function( event, template ) {
		var text = template.editor.getValue();

		if ( text !== "" ) {	
			var self = this;
			Meteor.promise( "convertMarkdown", text)
			.then( function( html ) {
				$( "#preview" ).html( html );
				return Meteor.promise( "updateActionDescription", this.data._id, text);
			})
			.catch( function( error ) {
				Bert.alert( error.reason, "danger" );
			});
		}
	}
});

