Package.describe({
  name: 'tjaisson:entcore-oauth',
  summary: "EntCore OAuth flow",
  version: "1.0.0"
});

Package.onUse(function (api) {
	  api.use('accounts-base', ['client', 'server']);
	  api.use('oauth2', ['client', 'server']);
	  api.use('oauth', ['client', 'server']);
	  api.use('http', ['server']);
	  api.use('underscore', 'server');
	  api.use('random', 'client');
	  api.use('service-configuration', ['client', 'server']);

	  api.addFiles('entcore.js');
	  api.addFiles('entcore_client.js', 'client');
	  api.addFiles('entcore_server.js', 'server');

	  api.export('EntCore');
	});
