FlowRouter.route('/_entcore/d/:service', {
	name: 'entcore.login',
	action(p, q) {
	    EntcoreDirect.display('Wait');
		if(p.service === "_wait") {
			Accounts.onPageLoadLogin((info) => {
				if(info.allowed) {
					EntcoreDirect.goHome();
				} else {
					const err = info.error;
	                if (err && err instanceof Accounts.LoginCancelledError) {
	                	EntcoreDirect.goErr();
	                }
	                else if (err && (err instanceof Error) && (err.error === "Entcore.Multi.NoAccount")) {
	                    console.log(err);
	                }
                }
			});
		} else if(p.service === "_err") {
		    EntcoreDirect.display('Err');
		} else {
			if(!q.code){
				Meteor.logout(() => {
					Tracker.autorun((c) => {
						if(AccountsEntCore.ready()) {
							c.stop();
							var conf = AccountsEntCore.getConfigs()['entcore' + p.service];
							if(!conf) {
							    EntcoreDirect.goErr();
							} else {
    							conf.applyLogin({
	    								loginStyle: "redirect",
	    								redirectUrl: FlowRouter.url('entcore.login', {service: '_wait'})
	    							});
						  }
						}
					});
				});
			}
		}
	}
});

