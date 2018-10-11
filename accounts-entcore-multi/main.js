EntcoreMulti = {
};
EntCore.Extended = true;
EntcoreUi.router.route('/newaccount', {
	name: 'entcore.multi.new',
	action(p, q) {
	    EntcoreUi.display('NewAccount');
	}
});
