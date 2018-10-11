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
EntcoreUi.router.url = function() {
	return FlowRouter.url.apply(FlowRouter, arguments);
}
EntcoreUi.display = function(p) {
	if(this.layout) {
        var op = {};
	    op[this.contentRegion] = 'entcore' + p;
	    BlazeLayout.render(this.layout, op);
    }
};
