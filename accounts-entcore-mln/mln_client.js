  const loginWithEntcoremln = function(options, callback) {
    // support a callback without options
    if (! callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    EntCore.requestCredential(options, credentialRequestCompleteCallback, 'mln');
  };
			  
  Accounts.registerClientLoginFunction('entcoremln', loginWithEntcoremln);
  Meteor.loginWithEntcoremln = function () {
    return Accounts.applyLoginFunction('entcoremln', arguments);
  };
