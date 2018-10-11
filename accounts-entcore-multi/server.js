var origUpdateOrCreateUserFromExternalService =
	Accounts.updateOrCreateUserFromExternalService;

updateOrCreateUserFromExternalService = function(serviceName, serviceData, options) {
	const conf = ServiceConfiguration.configurations.findOne({service: serviceName});
	if((!conf) || (!conf.entcore))
		return origUpdateOrCreateUserFromExternalService.apply(this, arguments);
	const sel = {};
	sel['services.' + serviceName + '.id'] = serviceData.id;
	let user = Meteor.users.findOne(sel, {fields: {_id: 1}});
	//let user = false;
	if (user) {
		return origUpdateOrCreateUserFromExternalService.apply(this, arguments);
	} else {
		const cId = DDP._CurrentMethodInvocation.get().connection.id;
		const ret = {
			stk: EntcoreMulti.keys.seal(cId + '.' + options.tk),
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
}

Accounts.updateOrCreateUserFromExternalService =
	updateOrCreateUserFromExternalService;


//Listen to calls to `login` with an entcore option set. This is where
//users actually get logged in to meteor via oauth.
Accounts.registerLoginHandler(options => {
if (!options.entcore)
 return undefined; // don't handle
check(options.entcore, {
	service: String,
	stk: String
});
const opts = options.entcore;
const conf = ServiceConfiguration.configurations.findOne({service: opts.service});
if((!conf) || (!conf.entcore))
	throw new Meteor.Error('Entcore.Multi.UnknownService', 'Unknown service');
const otk = EntcoreMulti.keys.open(opts.stk);
if(!otk)
	throw new Meteor.Error('Entcore.Multi.BadToken', 'Bad token');
var tk, cId;
[cId, tk] = otk.split(/\.(.+)/,2);
if (cId !== DDP._CurrentMethodInvocation.get().connection.id)
	throw new Meteor.Error('Entcore.Multi.BadConnection', 'Bad connection');
const ident = EntCore.getIdentity(conf, tk);
if((!ident) || (!ident.externalId))
	throw new Meteor.Error('Entcore.Multi.BadResponse', 'Bad response from server');
		  // Create a new user with the service data.
const sel = {};
sel['services.' + opts.service + '.id'] = ident.externalId;
let user = Meteor.users.findOne(sel, {fields: {_id: 1}});
//let user = false;
if (!user) {
	user = {
			profile: {fullname: ident.lastName},
			services: {[opts.service]: {
				id: ident.externalId,
			}}
	};
	Accounts.insertUserDoc({}, user);
}
return origUpdateOrCreateUserFromExternalService.apply(Accounts, [opts.service, {id: ident.externalId}, {}]);
}
);
