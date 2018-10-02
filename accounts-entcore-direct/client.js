EntcoreDirect = {};
EntcoreDirect.goHome = () => {
	if(EntcoreDirect.home) {
		FlowRouter.go(EntcoreDirect.home);
	} else {
		window.location = '/';
	}
};