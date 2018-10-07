EntcoreDirect = {};
EntcoreDirect.goHome = () => {
	if(EntcoreDirect.home) {
		FlowRouter.go(EntcoreDirect.home);
	} else {
		window.location = '/';
	}
};
EntcoreDirect.goErr = () => {
	FlowRouter.go('entcore.login', {service: '_err'});
};
EntcoreDirect.display = (p) => {
	if(EntcoreDirect.layout) {
        var op = {};
	    op[EntcoreDirect.contentRegion] = 'entcoreDirect' + p;
	    BlazeLayout.render(EntcoreDirect.layout, op);
    }
};