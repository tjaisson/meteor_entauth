EntcoreUi.router.goHome = function() {
	if(EntcoreUi.home) {
		FlowRouter.go(EntcoreUi.home);
	} else {
		FlowRouter.go('/');
	}
};
EntcoreUi.router.goErr = function() {
	FlowRouter.go('entcore.err');
};
EntcoreUi.router.go = function() {
	FlowRouter.go.apply(FlowRouter, arguments);
}
EntcoreUi.router.goWRS = function() {
	FlowRouter.withReplaceState(() => {
		FlowRouter.go.apply(FlowRouter, arguments);
	});
}
EntcoreUi.router.url = function() {
	return FlowRouter.url.apply(FlowRouter, arguments);
}
EntcoreUi.display = function(l, t, p) {
	const o = {
			templ: 'entcore' + t,
			...p
	}
	BlazeLayout.render('entcoreLayout' + l, o);
};
const HomeEvent = {
"click button": function(event, t) {
    event.preventDefault();
    event.currentTarget.blur();
	EntcoreUi.router.goHome();
}};
Template.entcoreBack.events(HomeEvent);
Template.entcoreContinue.events(HomeEvent);
