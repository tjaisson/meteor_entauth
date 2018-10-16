EntcoreMulti = {
};
EntCore.Extended = true;
EntcoreUi.router.route('/newaccount', {
	name: 'entcore.multi.new',
	action(p, q) {
	    EntcoreUi.display('Small', 'M');
	}
});
EntcoreUi.router.route('/newaccount/merged', {
	name: 'entcore.multi.new.merged',
	action(p, q) {
	    EntcoreUi.display('Small', 'MMerged');
	}
});
