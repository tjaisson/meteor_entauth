AccountsEntCore.registerService = function (server, url) {
	Accounts.oauth.registerService('entcore' + server);
	EntCore.registerService(server, url);
	Accounts.registerClientLoginFunction('entcore' + server, function(options, callback) {
	    // support a callback without options
	    if (! callback && typeof options === "function") {
	      callback = options;
	      options = null;
	    }
	    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
	    EntCore.requestCredential(server, options, credentialRequestCompleteCallback);
	});

	Meteor['loginWithEntcore' + server] = function () {
	  return Accounts.applyLoginFunction('entcore' + server, arguments);
	};

};
