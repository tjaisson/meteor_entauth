FlowRouter.route('/_entcore/:service', {
	name: 'entcore.login',
	action(p, q) {
		if(p.service == "wait") {
			Tracker.autorun((c) => {
				if(Meteor.user()) {
					c.stop();
					EntcoreDirect.goHome();
				}
			});
			
		} else {
			if(!q.code){
				Meteor.logout(() => {
					Tracker.autorun((c) => {
						if(AccountsEntCore.ready()) {
							c.stop();
							var config = EntCore.configs['entcore' + p.service];
							if(!config) {
								throw new Error(`Unknown entcore service : ${p.service}`);
							}
							Meteor['loginWithEntcore' + p.service]({
								loginStyle: "redirect",
								redirectUrl: FlowRouter.url('entcore.login', {service: 'wait'})
							});
						}
					});
				});
			}
		}
	}
});

