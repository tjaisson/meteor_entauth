EntCore.configs = {};

var dep = new Tracker.Dependency;

EntCore.getDep = () => dep;

Tracker.autorun(() => {
	EntCore.configs = {};
	console.log('entcore-oauth - list services');
	ServiceConfiguration.configurations.find({entcore: true}, {fields : {service: 1, url: 1, name: 1, loginStyle: 1}}).forEach(r => {
		EntCore.configs[r.service] = r;
		console.log(' - ' + r.service);
	});
	console.log('entcore-oauth - fin list services');
	dep.changed();
});


// Request Entcore credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
// @param service "entcoremln" or "entcorepcn"
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
    '?client_id=test-tj-meteor' +
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
