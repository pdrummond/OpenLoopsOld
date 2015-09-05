Template.channelDescriptionView.events({
	'dblclick .preview-wrap': function(e) {		
		doEditMode(e);		
	},	
});

doEditMode = function(e) {
	e.preventDefault();
	$(".preview-wrap").toggleClass('full-width');
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {  // IE?
		document.selection.empty();
	}
}