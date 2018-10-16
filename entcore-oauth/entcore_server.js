const _registerService = function(s) {
	let service = 'entcore' + s.server;
	OAuth.registerService(service, 2, null, function(query) {
		return _handleOauthRequest(service, query);
		});
};

const _configureService = function(s) {
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
};

(() => {
	const services = new Set();
	if (Meteor.settings.entcoreOauth) {
		var len = Meteor.settings.entcoreOauth.length;
		for (var i = 0; i < len; i++) {
			var s = Meteor.settings.entcoreOauth[i];; 
			services.add('entcore' + s.server);
			_registerService(s);
			_configureService(s);
		}
	}
	const notFound = new Set();
	ServiceConfiguration.configurations.find({entcore: true}, {fields : {service: 1}}).forEach(r => {
		if (! services.has(r.service)) {
			notFound.add(r._id);
		}
	});
	for (let s of notFound.values()) {
		ServiceConfiguration.configurations.remove( {_id: s} );
	}
})();

//@param query (For OAuth2 only) {Object} parameters passed in query string
//@param server {string} 'pcn' or 'mln'
//- return value is:
//  - {serviceData:, (optional options:)} where serviceData should end
//    up in the user's services[name] field
//  - `null` if the user declined to give permissions
//
const _handleOauthRequest = function(service, query) {
	  const config = ServiceConfiguration.configurations.findOne({service: service});
	  if (!config)
	    throw new ServiceConfiguration.ConfigError();
	  const accessToken = _getAccessToken(config, query);
	  const res = _getIdentity(config, accessToken);
	  //console.log("Response " + JSON.stringify(res));
	  return res;
}

const _getAccessToken = function (config, query) {
  const serverUrl = config.url + '/auth/oauth2/token';
  var r;
  try {
    r = HTTP.post(
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
  if (r.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with EntCore. " + r.data.error);
  } else {
    return r.data.access_token;
  }
};

const _getIdentity = function(config, accessToken) {
  const serverUrl = config.url + '/auth/oauth2/userinfo';
  var r;
  try {
	r = HTTP.get(
		serverUrl, {
	    headers: {"User-Agent": "MozillaXYZ/1.0",
        		Authorization: "Bearer " + accessToken},
      }).data;
	  
	const res = {serviceData: {id: r.externalId}};
	if (EntCore.Extended) {
		  res.options = {
	    	tk: accessToken,
	    	firstName: r.firstName,
	    	lastName: r.lastName,
	    	login: r.login,
	    	uai: r.uai,
	    	type: r.type
	    }
	  }
	  return res;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from EntCore. " + err.message),
                   {response: err.response});
  }
};

EntCore.getIdentity = function(conf, tk) {
	return _getIdentity(conf, tk);
}
