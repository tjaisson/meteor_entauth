var _d;
const _dep = new Tracker.Dependency;
const _templDep = new Tracker.Dependency;
var _timer;
var _templState;

//reactive
function _expired() {
	_dep.depend();
	return (!_d) || (_d._expired);
}

function _getData() {
	_dep.depend();
	return _d;
}

function _setData(d) {
	if(_timer) {
		Meteor.clearTimeout(_timer);
		_timer = undefined;
	}
	_d = d;
	_dep.changed();
	if(_d) {
		_d._expired = false;
		_timer = Meteor.setTimeout(() => {
			_d._expired = true;
			_dep.changed();
			_timer = undefined;
		}, 300000); //5 min
	}
}

function _getTemplState() {
	_templDep.depend();
	return _templState;
}

function _setTemplState(s) {
	_templState = s;
	_templDep.changed();
}

function _callEntcoreLogin(service, stk, act, cb)  {
	const options = {entcore: {service: service,	stk: stk, act: act}};
	Accounts.callLoginMethod({
		methodArguments: [options],
		userCallback: cb && (err => cb(err)),
	});
}

EntcoreMulti.getData = () => _d;

EntcoreMulti.callEntcoreLogin = function(act)  {
	if(!_expired()) {
		_callEntcoreLogin(_d.service, _d.stk, act, (e) => {
			if (act === 'new') {
				if (e)
					EntcoreUi.router.goErr();
				else
					EntcoreUi.router.goHome();
			} else if (act === 'merge') {
				if(e && e.error != 'Entcore.Multi.MergedOk') {
					EntcoreUi.router.goErr();
				} else {
					EntcoreUi.router.go('entcore.multi.new.merged');
				}
			}
			_setData(undefined);
    	});
	} else {
		EntcoreUi.goErr();
	}
};

EntcoreMulti.handleNewAccount = function(d) {
	_setData(d);
	_setTemplState('NewOrMerge');
	console.log(d);
	EntcoreUi.router.go('entcore.multi.new');
}

Template.entcoreM.helpers({
	expired: () => _expired(),
	tmpl: () => 'entcoreM' + _getTemplState()
});
Template.entcoreMEntIdent.helpers({
	serviceName: () => {
    	if((_d) && (_d.service) && EntCore.ready()) {
    		conf = EntCore.configs[_d.service];
    		return (conf) && conf.name;
    	} else {
    		return (_d) && _d.service;
    	}
    },
	ident: () => {return {firstName: (_d) && _d.firstName, lastName: (_d) && _d.lastName, login: (_d) && _d.login}}
});

Template.entcoreMNewOrMergeCnt.events({
    "click button#entcoreMNewButt": function(event, t) {
        event.preventDefault();
        event.currentTarget.blur();
        if(_templState !== 'NewOrMerge') return;
        _setTemplState('WaitForNewAccount');
    	EntcoreMulti.callEntcoreLogin('new');
    },
    "click button#entcoreMMergeButt": function(event, t) {
        event.preventDefault();
        event.currentTarget.blur();
        if(_templState !== 'NewOrMerge') return;
        _setTemplState('LoginForMerge');
    }
});

Template.entcoreMLoginForMerge.events({
    "click a.back-btn":  function(event, t) {
        event.preventDefault();
        event.currentTarget.blur();
        if(_templState !== 'LoginForMerge') return;
        _setTemplState('NewOrMerge');
    }
});

Template.entcoreMLoginForMergeCnt.helpers(AccountsTemplates.atPwdFormHelpers);

Template.entcoreMLoginForMergeCnt.events({
    // Form submit
"submit #entcore-lfm-form": function(event, t) {
    event.preventDefault();
    t.$("#entcore-lfm-butt").blur();
    if(_templState !== 'LoginForMerge') return;
    
    var parentData = Template.currentData();

    // Client-side pre-validation
    // Validates fields values
    // NOTE: This is the only place where password validation can be enforced!
    var formData = {};
    var someError = false;
    var errList = [];
    _.each(AccountsTemplates.getFields(), function(field){
        // Considers only visible fields...
        if (!_.contains(field.visible, 'signIn'))
            return;

        var fieldId = field._id;

        var rawValue = field.getValue(t);
        var value = field.fixValue(rawValue);
        // Possibly updates the input value
        if (value !== rawValue) {
            field.setValue(t, value);
        }
        if (value !== undefined && value !== "") {
            formData[fieldId] = value;
        }
    });

    // Clears error and result

    // Extracts username, email, and pwds
    var current_password = formData.current_password;
    var email = formData.email;
    var password = formData.password;
    var username = formData.username;
    var username_and_email = formData.username_and_email;
    // Clears profile data removing username, email, and pwd
    delete formData.current_password;
    delete formData.email;
    delete formData.password;
    delete formData.username;
    delete formData.username_and_email;

    // -------
    // Sign In
    // -------
    var pwdOk = !!password;
    var userOk = true;
    var loginSelector;
    if (email) {
        if (AccountsTemplates.options.lowercaseUsername) {
          email = toLowercaseUsername(email);
        }

        loginSelector = {email: email};
    }
    else if (username) {
        if (AccountsTemplates.options.lowercaseUsername) {
          username = toLowercaseUsername(username);
        }
        loginSelector = {username: username};
    }
    else if (username_and_email) {
        if (AccountsTemplates.options.lowercaseUsername) {
          username_and_email = toLowercaseUsername(username_and_email);
        }
        loginSelector = username_and_email;
    }
    else
        userOk = false;

    // Possibly exits if not both 'password' and 'username' are non-empty...
    if (!pwdOk || !userOk){
        
        return;
    }

    _setTemplState('WaitForLoginForMerge');

    return Meteor.loginWithPassword(loginSelector, password, function(e) {
        if (e) {
            if (_.isObject(e.details)) {
                _.each(e.details, function(error, fieldId) {
                    AccountsTemplates.getField(fieldId).setError(error);
                });
            }
            _setTemplState('LoginForMerge');
        } else {
            EntcoreMulti.callEntcoreLogin('merge');
        }
    });
}});
