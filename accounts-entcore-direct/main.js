FlowRouter.route('/_entcore/:service', {
	name: 'entcore.login',
	action(p, q) {
		if(p.service === "wait") {
			Tracker.autorun((c) => {
				if(Meteor.user()) {
					c.stop();
					EntcoreDirect.goHome();
				}
			});
			if(EntcoreDirect.layout) {
			    var op = {};
			    op[EntcoreDirect.contentRegion] = 'entcoreDirectWait';
    		    BlazeLayout.render(EntcoreDirect.layout, op);
            }
		} else {
			if(!q.code){
				Meteor.logout(() => {
					Tracker.autorun((c) => {
						if(AccountsEntCore.ready()) {
							c.stop();
							var conf = EntCore.configs['entcore' + p.service];
							if(!conf) {
								throw new Error(`Unknown entcore service : ${p.service}`);
							}
							conf.applyLogin({
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

