EntcoreMulti._createNewAccountAndLogin = function(service, stk, cb)  {
	const options = {
		entcore: {
			service: service,
			stk: stk
		}	
	};
	Accounts.callLoginMethod({
		methodArguments: [options],
		userCallback: cb && (err => cb(err)),
	});
};

EntcoreMulti.createNewAccount = function(cb)  {
	if(this.d) {
		this._createNewAccountAndLogin(this.d.service, this.d.stk, cb);
	}
};

EntcoreMulti.handleNewAccount = function(d) {
	this.d = d;
	EntcoreUi.router.go('entcore.multi.new');
}

Template.entcoreNewAccount.events({
    "click button": function(event, t) {
        event.preventDefault();
        event.currentTarget.blur();
        if(EntcoreMulti.d) {
        	EntcoreMulti.createNewAccount(function(e) {
        		if(e) {
        			EntcoreUi.router.goErr();
        		}
        		else {
        			EntcoreUi.router.goHome();
        		}
        		console.log('new account done');
        		console.log(arguments);
        	});
        } else {
        	EntcoreUi.router.goErr();
        }
    }
});