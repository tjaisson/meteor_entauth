Template.configureLoginServiceDialogForEntcorepcn.helpers({
  siteUrl: function () {
    return Meteor.absoluteUrl();
  }
});

Template.configureLoginServiceDialogForEntcoremln.helpers({
	  siteUrl: function () {
	    return Meteor.absoluteUrl();
	  }
	});

Template.configureLoginServiceDialogForEntcorepcn.fields = function () {
	  return [
	    {property: 'clientId', label: 'Client ID'},
	    {property: 'secret', label: 'Client Secret'}
	  ];
	};
Template.configureLoginServiceDialogForEntcoremln.fields = function () {
	  return [
	    {property: 'clientId', label: 'Client ID'},
	    {property: 'secret', label: 'Client Secret'}
	  ];
	};
