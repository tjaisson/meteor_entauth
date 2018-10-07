FlowRouter.route('/_entcore/d/:service', {
	name: 'entcore.login',
	action(p, q) {
	    EntcoreDirect.display('Wait');
		if(p.service === "_wait") {
			Tracker.autorun((c) => {
				if(Meteor.user()) {
					c.stop();
					EntcoreDirect.goHome();
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

