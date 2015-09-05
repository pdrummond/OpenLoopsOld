Template.header.events({
	'click #toggle-right-sidebar-button': function() {
		if($('#actions-wrapper').css('right') == '0px') {
			$('#actions-wrapper').css('right', '-500px');
			$('#toggle-right-sidebar-button i').removeClass('right').addClass('left');
			$('.app-header').css('right', 0);
			$('.main-wrapper').css('padding-right', '0px');
			$('.footer').css('right', '0px');
		} else {
			$('#actions-wrapper').css('right', '0px');
			$('#toggle-right-sidebar-button i').removeClass('left').addClass('right');
			$('.app-header').css('right', '500px');
			$('.main-wrapper').css('padding-right', '500px');
			$('.footer').css('right', '500px');
		}
	}
});