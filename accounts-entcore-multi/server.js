var origUpdateOrCreateUserFromExternalService =
	Accounts.updateOrCreateUserFromExternalService;

updateOrCreateUserFromExternalService = function(serviceName, serviceData, options) {
	var conf = ServiceConfiguration.configurations.findOne({service: serviceName});
	if((!conf) || (!conf.entcore))
		return origUpdateOrCreateUserFromExternalService.apply(this, arguments);

	//return origUpdateOrCreateUserFromExternalService.apply(this, arguments);

	
	console.log('updateOrCreateUserFromExternalService');
	console.log('TODO: check if user exists');
	console.log('Service : ' + 	serviceName);
	console.log('serviceData :');
	console.log(serviceData);
	console.log('options :');
	console.log(options);
	
	const ret = {
		tk: EntcoreMulti.keys.seal(options.tk),
		lastName: options.lastName,
		firstName: options.firstName,
		login: options.login,
		service: serviceName
	};
	
	return {
		type: serviceName,
		error: new Meteor.Error(
			'Entcore.Multi.NoAccount',
			'No associated account',
			ret
		)
	};

}

Accounts.updateOrCreateUserFromExternalService =
	updateOrCreateUserFromExternalService;
