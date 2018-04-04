  const loginWithEntcorepcn = function(options, callback) {
	    // support a callback without options
	    if (! callback && typeof options === "function") {
	      callback = options;
	      options = null;
	    }

	    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
	    EntCore.requestCredential(options, credentialRequestCompleteCallback, 'pcn');
	  };
		  
  Accounts.registerClientLoginFunction('entcorepcn', loginWithEntcorepcn);
  Meteor.loginWithEntcorepcn = function () {
    return Accounts.applyLoginFunction('entcorepcn', arguments);
  };
