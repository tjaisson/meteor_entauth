EntcoreUi.router.route('/login/:service/wait', {
	name: 'entcore.login.wait',
	action(p, q) {
	    EntcoreUi.display('Small', 'Wait');
		Accounts.onPageLoadLogin((info) => {
			if(info.allowed) {
				EntcoreUi.router.goHome();
			} else {
				const err = info.error;
                if (err && err instanceof Accounts.LoginCancelledError) {
                	EntcoreUi.router.goErr();
                }
                else if (err && (err instanceof Error) && (err.error === "Entcore.Multi.NoAccount")) {
                    EntcoreMulti.handleNewAccount(err.details);
                }
            }
		});
	}
});

EntcoreUi.router.route('/login/:service', {
	name: 'entcore.login',
	action(p, q) {
		EntcoreUi.display('Small', 'Wait');
		if(!q.code) {
			Meteor.logout(() => {
				Tracker.autorun((c) => {
					if(AccountsEntCore.ready()) {
						c.stop();
						var conf = AccountsEntCore.getConfigs()['entcore' + p.service];
						if(!conf) {
						    EntcoreUi.router.goErr();
						} else {
							conf.applyLogin({
    								loginStyle: "redirect",
    								redirectUrl: EntcoreUi.router.url('entcore.login.wait', {service: p.service})
    							});
						}
					}
				});
			});
		}
	}
});
