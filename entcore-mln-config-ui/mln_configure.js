Template.configureLoginServiceDialogForEntcoremln.helpers({
	  siteUrl: function () {
	    return Meteor.absoluteUrl();
	  }
	});

Template.configureLoginServiceDialogForEntcoremln.fields = function () {
	  return [
	    {property: 'clientId', label: 'Client ID'},
	    {property: 'secret', label: 'Client Secret'}
	  ];
	};
