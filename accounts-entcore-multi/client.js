var _d;
const _dep = new Tracker.Dependency;
const _templDep = new Tracker.Dependency;
var _timer;
var _templState;

function _expired() {
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
		}, 300000);
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

function _createNewAccountAndLogin(service, stk, cb)  {
	const options = {
		entcore: {
			service: service,
			stk: stk
		}	
	};
	Accounts.callLoginMethod({
		methodArguments: [options],
		userCallback: cb && (err => cb(err)),
	});
}

EntcoreMulti.getData = () => _d;

EntcoreMulti.createNewAccount = function()  {
	if(!_expired()) {
		_createNewAccountAndLogin(_d.service, _d.stk, (e) => {
			_setData(undefined);
    		if(e) {
    			EntcoreUi.router.goErr();
    		} else {
    			EntcoreUi.router.goHome();
    		}
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
    	EntcoreMulti.createNewAccount();
    },
    "click button#entcoreMMergeButt": function(event, t) {
        event.preventDefault();
        event.currentTarget.blur();
        _setTemplState('LoginForMerge');
    }
});
