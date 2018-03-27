Accounts.oauth.registerService('entcorepcn');
Accounts.oauth.registerService('entcoremln');

if (Meteor.isClient) {
	  const loginWithEntcorepcn = function(options, callback) {
		    // support a callback without options
		    if (! callback && typeof options === "function") {
		      callback = options;
		      options = null;
		    }

		    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
		    EntCore.requestCredential(options, credentialRequestCompleteCallback, 'pcn');
		  };
		  
	  const loginWithEntcoremln = function(options, callback) {
	    // support a callback without options
	    if (! callback && typeof options === "function") {
	      callback = options;
	      options = null;
	    }

	    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
	    EntCore.requestCredential(options, credentialRequestCompleteCallback, 'mln');
	  };
			  
  Accounts.registerClientLoginFunction('entcorepcn', loginWithEntcorepcn);
  Meteor.loginWithEntcorepcn = function () {
    return Accounts.applyLoginFunction('entcorepcn', arguments);
  };
  
  Accounts.registerClientLoginFunction('entcoremln', loginWithEntcoremln);
  Meteor.loginWithEntcoremln = function () {
    return Accounts.applyLoginFunction('entcoremln', arguments);
  };
} else {
  /*Accounts.addAutopublishFields({
    forLoggedInUser: _.map(
      // publish access token since it can be used from the client (if
      // transmitted over ssl or on
      // localhost). https://developers.google.com/accounts/docs/OAuth2UserAgent
      // refresh token probably shouldn't be sent down.
      Google.whitelistedFields.concat(['accessToken', 'expiresAt']), // don't publish refresh token
      function (subfield) { return 'services.google.' + subfield; }),

    forOtherUsers: _.map(
      // even with autopublish, no legitimate web app should be
      // publishing all users' emails
      _.without(Google.whitelistedFields, 'email', 'verified_email'),
      function (subfield) { return 'services.google.' + subfield; })
  });*/
}
