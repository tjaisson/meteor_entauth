EntCore = {};

OAuth.registerService('entcore-pcn', 2, null, function(query) {
	return handleOauthRequest(query, 'pcn')
	});

OAuth.registerService('entcore-mln', 2, null, function(query) {
		return handleOauthRequest(query, 'mln')
	});

// http://developer.github.com/v3/#user-agent-required
var userAgent = "Meteor";
if (Meteor.release)
  userAgent += "/" + Meteor.release;


//@param query (For OAuth2 only) {Object} parameters passed in query string
//@param server {string} 'pcn' or 'mln'
//- return value is:
//  - {serviceData:, (optional options:)} where serviceData should end
//    up in the user's services[name] field
//  - `null` if the user declined to give permissions
//
var handleOauthRequest = function(query, server) {
	  var accessToken = getAccessToken(query, server);
	  var identity = getIdentity(accessToken, server);

	  return {
	    serviceData: {
	      id: identity.id,
	      accessToken: OAuth.sealSecret(accessToken),
	      username: identity.login,
	    },
	    options: {profile: {name: identity.name}}
	  };
}


var getAccessToken = function (query, server) {
  //var config = ServiceConfiguration.configurations.findOne({service: 'github'});
  //if (!config)
  //  throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://github.com/login/oauth/access_token", {
        headers: {
          Accept: 'application/json',
          "User-Agent": userAgent
        },
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
          redirect_uri: OAuth._redirectUri('github', config),
          state: query.state
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Github. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with GitHub. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken, server) {
  try {
    return HTTP.get(
      "https://api.github.com/user", {
        headers: {"User-Agent": userAgent}, // http://developer.github.com/v3/#user-agent-required
        params: {access_token: accessToken}
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Github. " + err.message),
                   {response: err.response});
  }
};

EntCore.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
