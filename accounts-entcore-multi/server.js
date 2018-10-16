const origUpdateOrCreateUserFromExternalService =
	Accounts.updateOrCreateUserFromExternalService;

const updateOrCreateUserFromExternalService = function(serviceName, serviceData, options) {
	const conf = ServiceConfiguration.configurations.findOne({service: serviceName});
	if((!conf) || (!conf.entcore))
		return origUpdateOrCreateUserFromExternalService.apply(this, arguments);
	const sel = {};
	sel['services.' + serviceName + '.id'] = serviceData.id;
	let user = Meteor.users.findOne(sel, {fields: {_id: 1}});
	if (user) {
		// update
	    const updt = {
	    		$set: {'profile.fullname': options.firstName + " " + options.lastName,
	    			['services.' + serviceName + '.type']: options.type,
	    			['services.' + serviceName + '.uai']: options.uai}
	    };
	    Meteor.users.update({_id: user._id}, updt);
		return origUpdateOrCreateUserFromExternalService.apply(this, [serviceName, serviceData]);
	}
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

Accounts.updateOrCreateUserFromExternalService =
	updateOrCreateUserFromExternalService;


const _buildUniqueUsername = function(login) {
	let u = Meteor.users.findOne({username: login}, {fields: {_id: 1}});
	if(!u) return login;
	login = login.replace(/\d+$/, "");
	u = Meteor.users.findOne({username: login}, {fields: {_id: 1}});
	if(!u) return login;
	let i = 1;
	while(true) {
		l = login + i;
		u = Meteor.users.findOne({username: l}, {fields: {_id: 1}});
		if(!u) return l;
		i++;
	}
}


//Listen to calls to `login` with an entcore option set. This is where
//users actually get logged in to meteor via oauth.
Accounts.registerLoginHandler(options => {
if (!options.entcore)
    return undefined; // don't handle
check(options.entcore, {
	service: String,
	stk: String,
	act: String,
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
if((!ident) || (!ident.serviceData) || (!ident.serviceData.id))
	throw new Meteor.Error('Entcore.Multi.BadResponse', 'Bad response from server');

const sel = {};
sel['services.' + opts.service + '.id'] = ident.serviceData.id;
let user = Meteor.users.findOne(sel, {fields: {_id: 1}});
const act = opts.act
if (act === 'new') {
    // Create a new user with the service data.
    if (!user) {
    	//choose a username for the user
    	user = Meteor.users.findOne(sel, {fields: {_id: 1}});
    	const newUser = {
		username: _buildUniqueUsername(ident.options.login),
	    profile: {fullname: ident.options.firstName + " " + ident.options.lastName},
	    services: {[opts.service]: {
	    	id: ident.serviceData.id,
	    	type: ident.options.type,
	    	uai: ident.options.uai,
	    	}}
		};
    	Accounts.insertUserDoc({}, newUser);
    }
    return origUpdateOrCreateUserFromExternalService.apply(Accounts, [opts.service, {id: ident.serviceData.id}, {}]);
} else if (act === 'merge') {
    const userId = DDP._CurrentMethodInvocation.get().userId;
    if (!userId)
	   throw new Meteor.Error('Entcore.Multi.NoUserToMerge', 'No user to merge with');
    if (user)
	   throw new Meteor.Error('Entcore.Multi.MergedWithAnother', 'Aready merged account');
    const updt = {
    		$set: {'profile.fullname': ident.options.firstName + " " + ident.options.lastName,
    			['services.' + opts.service]: {id: ident.serviceData.id, 
    				type:ident.options.type,
    				uai: ident.options.uai}}
    };
    Meteor.users.update({_id: userId}, updt);
	return {
		type: opts.service,
		error: new Meteor.Error(
			'Entcore.Multi.MergedOk',
			'Accounts merged'
		)
	};
} else {
	throw new Meteor.Error('Entcore.Multi.BadAction', 'Unknown action');
}
});
