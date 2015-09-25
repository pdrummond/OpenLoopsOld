Template.zenEditor.onRendered( function() {
	var self = this;
	this.autorun(function() {	

		var editorContent = Session.get('zenEditorContent')

		Meteor.promise( "convertMarkdown", Emoji.convert(editorContent))
		.then( function( html ) {
			$( "#preview" ).html( html );
			self.editor.focus();
		})

		self.$("#editor").val(editorContent);

		self.editor = CodeMirror.fromTextArea( self.find( "#editor" ), {
			lineNumbers: false,
			fixedGutter: false,
			mode: "markdown",
			lineWrapping: true,
			indentWithTabs:false		
		});	
	});
});

Template.zenEditor.events({
	'keyup .CodeMirror': function( event, template ) {
		var text = template.editor.getValue();

		if ( text !== "" ) {	
			var self = this;
			Meteor.promise( "convertMarkdown", Emoji.convert(text))
			.then( function( html ) {
				$( "#preview" ).html( html );				
			})
			.catch( function( error ) {
				alert(error.reason);
			});
		}
	},

	'click #close-zen-editor-button': function(event, template) {
		var el = Session.get('zenEditorTargetInput');
		$(el).val(template.editor.getValue());
		$("#zenEditor").hide();		
	}
});

