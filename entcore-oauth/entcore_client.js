EntCore.configs = {};
EntCore.configsArray = [];

const dep = new Tracker.Dependency;
var ready = false;

EntCore.ready = () => {
	dep.depend();
	return ready;
};

Tracker.autorun((c) => {
	if(!ready && Accounts.loginServicesConfigured()) {
		c.stop();
		ServiceConfiguration.configurations.find({entcore: true}, {fields : {service: 1, url: 1, name: 1, loginStyle: 1, clientId: 1}}).forEach(r => {
			EntCore.configs[r.service] = r;
			EntCore.configsArray.push(r);
		});
		ready = true;
		dep.changed();
	}
});




// Request Entcore credentials for the user
// @param service "entcoremln" or "entcorepcn"
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
EntCore.requestCredential = function (service, options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }
  var config = EntCore.configs[service];
  var loginUrl = config.url + '/auth/oauth2/auth';

  var credentialToken = Random.secret();

  var loginStyle = OAuth._loginStyle(service, config, options);

  loginUrl = loginUrl +
    '?client_id=' + config.clientId +
    '&scope=userinfo' +
    '&response_type=code' +
    '&approval_prompt=auto' +
    '&redirect_uri=' + OAuth._redirectUri(service, {"loginStyle": loginStyle}) +
    '&state=' + OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

  OAuth.launchLogin({
    loginService: service,
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: 450}
  });
};
