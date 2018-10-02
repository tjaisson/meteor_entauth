var dep = new Tracker.Dependency;
var ready = false;

AccountsEntCore.ready = () => {
	dep.depend();
	return ready;
};

AccountsEntCore.registerService = function(service) {
	Accounts.oauth.registerService(service);
	Accounts.registerClientLoginFunction(service, function(options, callback) {
	    // support a callback without options
	    if (! callback && typeof options === "function") {
	      callback = options;
	      options = null;
	    }
	    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
	    EntCore.requestCredential(service, options, credentialRequestCompleteCallback);
	});
	let s = service.charAt(0).toUpperCase() + service.slice(1); 
	Meteor['loginWith' + s] = function () {
	  return Accounts.applyLoginFunction(service, arguments);
	};
};

Tracker.autorun((c) => {
	if(EntCore.ready()) {
		c.stop();
		console.log('accounts-entcore - list services');
		var services = Accounts.oauth.serviceNames();
		_.each(EntCore.configs, v => {
			let service = v.service;
			if(_.contains(services, service)) {
				console.log(' - ' + service);
			} else {
				AccountsEntCore.registerService(service);
				console.log(' + ' + service);
			}
		});
		console.log('accounts-entcore - fin list services');
		ready = true;
		dep.changed();
	} else {
		console.log('EntCore not ready');
	}
});