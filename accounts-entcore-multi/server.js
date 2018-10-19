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
		const updt = _buildUpdate(serviceName, options);
		if(updt) {
		    Meteor.users.update({_id: user._id}, updt);
		}
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


const _buildUpdate = function(serviceName, options) {
	// update
	let hasSet = false;
	let hasUnset = false;
	const _set = {};
	const _unset = {};
	const fn = _buildFullName(options.firstName, options.lastName);
	if (fn) {_set['profile.fullname'] = fn; hasSet = true;}
	if (options.uai) {_set['services.' + serviceName + '.uai'] = options.uai; hasSet = true;}
	else {_unset['services.' + serviceName + '.uai'] = ''; hasUnset = true;}
	_set['services.' + serviceName + '.profil'] = _buildTypeCode(options.type); hasSet = true;
	const cl = options.classId ? _extractCode(options.classId) : false;
	if (cl) {_set['services.' + serviceName + '.classe'] = cl; hasSet = true;}
	else {_unset['services.' + serviceName + '.classe'] = ''; hasUnset = true;}
	
	if(hasSet || hasUnset) {
	    const updt = {};
	    if(hasSet) updt.$set = _set;
	    if(hasSet) updt.$unset = _unset;
	    return updt;
	} else {
		return undefined;
	}
}

const _extractCode = function(c) {
	return c.split('$')[1];
}

const _buildTypeCode = function(t) {
	if (t === 'ENSEIGNANT') return 'prof';
	if (t === 'ELEVE') return 'eleve';
	if (t === 'PERSRELELEVE') return 'parent';
	if (t === 'PERSEDUCNAT') return 'personnel';
	return 'invite';
}

const _buildFullName = function(fn, ln) {
	if (!fn) return ln;
	if (!ln) return fn;
	return fn + " " + ln;
}

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
    	const newUser = {
    			username: _buildUniqueUsername(ident.options.login),
    		    services: {[opts.service]: {id: ident.serviceData.id}}
		};
    	
    	const fn = _buildFullName(ident.options.firstName, ident.options.lastName);
    	if (fn) newUser.profile = {fullname: fn};
    	if (ident.options.uai) newUser.services[opts.service].uai = ident.options.uai; 
    	newUser.services[opts.service].profil = _buildTypeCode(ident.options.type);
		const cl = ident.options.classId ? _extractCode(ident.options.classId) : false;
		if (cl) newUser.services[opts.service].classe = cl;
    	
    	Accounts.insertUserDoc({}, newUser);
    }
    return origUpdateOrCreateUserFromExternalService.apply(Accounts, [opts.service, {id: ident.serviceData.id}, {}]);
} else if (act === 'merge') {
    const userId = DDP._CurrentMethodInvocation.get().userId;
    if (!userId)
	   throw new Meteor.Error('Entcore.Multi.NoUserToMerge', 'No user to merge with');
    if (user)
	   throw new Meteor.Error('Entcore.Multi.MergedWithAnother', 'Aready merged account');
    let updt = _buildUpdate(opts.service, ident.options);
    if (!updt) updt = {};
    if (!updt.$set) updt.$set = {};
    updt.$set['services.' + opts.service + '.id'] = ident.serviceData.id; 
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
