EntCore = {};

OAuth.registerService('entcorepcn', 2, null, function(query) {
	return handleOauthRequest(query, 'pcn')
	});

OAuth.registerService('entcoremln', 2, null, function(query) {
		return handleOauthRequest(query, 'mln')
	});

if (!(ServiceConfiguration.configurations.findOne({service: 'entcorepcn'}))) {
	var options = {
			"service": "entcorepcn",
			"loginStyle" : "popup"
	};
  ServiceConfiguration.configurations.insert(options);
}

if (!(ServiceConfiguration.configurations.findOne({service: 'entcoremln'}))) {
	var options = {
			"service": "entcoremln",
			"loginStyle" : "popup"
	};
  ServiceConfiguration.configurations.insert(options);
}



//@param query (For OAuth2 only) {Object} parameters passed in query string
//@param server {string} 'pcn' or 'mln'
//- return value is:
//  - {serviceData:, (optional options:)} where serviceData should end
//    up in the user's services[name] field
//  - `null` if the user declined to give permissions
//
var handleOauthRequest = function(query, server) {
	//console.log("handleOauthRequest " + server);
	  var accessToken = getAccessToken(query, server);
	  var identity = getIdentity(accessToken, server);
		console.log("Identity " + JSON.stringify(identity));
	  var response = 
	  {
	    serviceData: {
	      id: identity.externalId,
	      accessToken: OAuth.sealSecret(accessToken),
	      username: identity.login,
	    },
	    options: {
		    profile: {
		    	  fullname: identity.firstName + ' ' + identity.lastName,
		    }
	    }
	  };
		console.log("Response " + JSON.stringify(response));
	  return response;
}

var getAccessToken = function (query, server) {
  var config = ServiceConfiguration.configurations.findOne({service: 'entcore' + server});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

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
          redirect_uri: OAuth._redirectUri('entcore' + server, config)
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with EntCore. " + err.message),
                   {response: err.response});
  }
  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with EntCore. " + response.data.error);
  } else {
		//console.log("Got access token from " + server);
		//console.log("Token " + response.data.access_token);
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken, server) {
	var serverUrl;
	var response;
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
	  response = 
     HTTP.get(
    	serverUrl, {
        headers: {"User-Agent": "MozillaXYZ/1.0",
        		Authorization: "Bearer " + accessToken},
      }).data;
		//console.log("Got identity from " + server);
		//console.log("Identity " + JSON.stringify(response));
	  return response;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from EntCore. " + err.message),
                   {response: err.response});
  }
};

EntCore.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
