EntCore = {};

OAuth.registerService('entcore-pcn', 2, null, function(query) {
	return handleOauthRequest(query, 'pcn')
	});

OAuth.registerService('entcore-mln', 2, null, function(query) {
		return handleOauthRequest(query, 'mln')
	});


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

var serverUrl;
switch(server) {
	case 'pcn':
		serverUrl = "https://ent.parisclassenumerique.fr/auth/oauth2/token";
		break;
	case 'mln':
		//loginUrl = "https://ent.iledefrance.fr/auth/oauth2/token";
		serverUrl = "https://formation.ent.iledefrance.fr/auth/oauth2/token";
		break;
	default:
		throw new ServiceConfiguration.ConfigError();
		return;
}

  var response;
  try {
    response = HTTP.post(
		serverUrl, {
		auth: "test-tj-meteor:moncodesecret", 
        headers: {
          Accept: 'application/json',
          "User-Agent": "MozillaXYZ/1.0"
        },
        params: {
          grant_type: "authorization_code",
          code: query.code,
          redirect_uri: OAuth._redirectUri('github', config)
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with EntCore. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with EntCore. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken, server) {
	var serverUrl;
	switch(server) {
		case 'pcn':
			serverUrl = "https://ent.parisclassenumerique.fr/auth/oauth2/userinfo";
			break;
		case 'mln':
			//loginUrl = "https://ent.iledefrance.fr/auth/oauth2/userinfo";
			serverUrl = "https://formation.ent.iledefrance.fr/auth/oauth2/userinfo";
			break;
		default:
			throw new ServiceConfiguration.ConfigError();
			return;
	}

  try {
    return HTTP.get(
    	serverUrl, {
        headers: {"User-Agent": "MozillaXYZ/1.0",
        		Authorization: "Bearer " + accessToken},
      }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from EntCore. " + err.message),
                   {response: err.response});
  }
};

EntCore.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
