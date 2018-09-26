EntCore.registerService = function(s) {
	let service = 'entcore' + s.server;
	OAuth.registerService(service, 2, null, function(query) {
		return handleOauthRequest(service, query);
		});
};

EntCore.configureService = function(s) {
	ServiceConfiguration.configurations.upsert({
		service: 'entcore' + s.server
		}, {
			$set: {
				loginStyle : 'popup',
				clientId: s.appId,
				secret: s.secret,
				entcore: true,
				name: s.name,
				url: s.url
			}
		});
}

var services = new Set();
if (Meteor.settings.entcoreOauth) {
	var len = Meteor.settings.entcoreOauth.length;
	for (var i = 0; i < len; i++) {
		var s = Meteor.settings.entcoreOauth[i];; 
		services.add('entcore' + s.server);
		EntCore.registerService(s);
		EntCore.configureService(s);
	}
}
var notFound = new Set();
ServiceConfiguration.configurations.find({entcore: true}, {fields : {service: 1}}).forEach(r => {
	if (! services.has(r.service)) {
		notFound.add(r._id);
	}
});
for (let s of notFound.values()) {
	ServiceConfiguration.configurations.remove( {_id: s} );
}


//@param query (For OAuth2 only) {Object} parameters passed in query string
//@param server {string} 'pcn' or 'mln'
//- return value is:
//  - {serviceData:, (optional options:)} where serviceData should end
//    up in the user's services[name] field
//  - `null` if the user declined to give permissions
//
var handleOauthRequest = function(service, query) {
	  var config = ServiceConfiguration.configurations.findOne({service: service});
	  if (!config)
	    throw new ServiceConfiguration.ConfigError();
	
	  var accessToken = getAccessToken(config, query);
	  var identity = getIdentity(config, accessToken);
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

var getAccessToken = function (config, query) {

  var serverUrl = config.url + '/auth/oauth2/token';

  var response;
  try {
    response = HTTP.post(
		serverUrl, {
		auth: config.clientId + ':' + config.secret, 
        headers: {
          Accept: 'application/json',
          "User-Agent": "MozillaXYZ/1.0"
        },
        params: {
          grant_type: "authorization_code",
          code: query.code,
          redirect_uri: OAuth._redirectUri(config.service, config)
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

var getIdentity = function (config, accessToken) {
  var serverUrl = config.url + '/auth/oauth2/userinfo';
  var response;

  try {
	  response = 
     HTTP.get(
    	serverUrl, {
        headers: {"User-Agent": "MozillaXYZ/1.0",
        		Authorization: "Bearer " + accessToken},
      }).data;
	  return response;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from EntCore. " + err.message),
                   {response: err.response});
  }
};

EntCore.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
