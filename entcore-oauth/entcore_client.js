EntCore = {};

// Request Entcore credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
// @param server "mln" or "pcn"
EntCore.requestCredential = function (options, credentialRequestCompleteCallback, server) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var loginUrl;
  switch(server) {
  case 'pcn':
	  loginUrl = "https://ent.parisclassenumerique.fr/auth/oauth2/auth";
	  break;
  case 'mln':
	  //loginUrl = "https://ent.iledefrance.fr/auth/oauth2/auth";
	  loginUrl = "https://formation.ent.iledefrance.fr/auth/oauth2/auth";
	  break;
  default:
	  credentialRequestCompleteCallback && credentialRequestCompleteCallback(
		new ServiceConfiguration.ConfigError());
  	  return;
  }
  
  
  var credentialToken = Random.secret();

  var loginStyle = "redirect";//OAuth._loginStyle('github', config, options);

  loginUrl = loginUrl +
    '?client_id=test-tj-meteor' +
    '&scope=userinfo' +
    '&response_type=code' +
    '&approval_prompt=auto' +
    '&redirect_uri=' + OAuth._redirectUri('entcore-' + server, {"loginStyle": loginStyle}) +
    '&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

  OAuth.launchLogin({
    loginService: "entcore-" + server,
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: 450}
  });
};
