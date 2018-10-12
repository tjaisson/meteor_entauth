EntcoreUi = {
	router: FlowRouter.group({prefix: '/_entcore', name: 'entcore'})
};

EntcoreUi.router.route('/err', {
	name: 'entcore.err',
	action() {
		EntcoreUi.display("Small", "Err");
	}
});