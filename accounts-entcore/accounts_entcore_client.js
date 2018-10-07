var dep = new Tracker.Dependency;
var ready = false;

AccountsEntCore.ready = () => {
	dep.depend();
	return ready;
};

AccountsEntCore.getConfigsArray = () => {
	if(EntCore.ready()) {
		return EntCore.configsArray;
	} else {
		return [];
	}
};

AccountsEntCore.getConfigs = () => {
	if(EntCore.ready()) {
		return EntCore.configs;
	} else {
		return {};
	}
};

AccountsEntCore.registerService = function(conf) {
	let service = conf.service;
	Accounts.oauth.registerService(service);
	conf.login = function(options, callback) {
	    // support a callback without options
	    if (! callback && typeof options === "function") {
	      callback = options;
	      options = null;
	    }
	    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
	    EntCore.requestCredential(this.service, options, credentialRequestCompleteCallback);
	};
	Accounts.registerClientLoginFunction(service, (options, callback) => {
		conf.login(options, callback);
	});
	conf.applyLogin = function() {
		return Accounts.applyLoginFunction(this.service, arguments);
	};
	let s = service.charAt(0).toUpperCase() + service.slice(1); 
	Meteor['loginWith' + s] = function() {
	  return conf.applyLogin.apply(conf, arguments);
	};
};

Tracker.autorun((c) => {
	if(EntCore.ready()) {
		c.stop();
		console.log('accounts-entcore - list services');
		var services = Accounts.oauth.serviceNames();
		_.each(EntCore.configsArray, conf => {
			let service = conf.service;
			if(_.contains(services, service)) {
				console.log(' - ' + service);
			} else {
				AccountsEntCore.registerService(conf);
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