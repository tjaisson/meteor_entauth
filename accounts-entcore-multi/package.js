Package.describe({
  name: 'tjaisson:accounts-entcore-multi',
  summary: 'multi accounts merging',
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use(['accounts-base', 'ecmascript'], 'server');
  api.use([
	  'underscore',
	  'useraccounts:core',
	  'kadira:flow-router',
	  'kadira:blaze-layout',
	  'tjaisson:entcore-oauth',
	  'tjaisson:accounts-entcore',
	  'tjaisson:accounts-entcore-ui',
	  'service-configuration'
  ]);
  api.use([
    'templating',
    'tracker'
    ], 'client');

  api.addFiles('main.js');
  api.addFiles(['tmpl.html', 'client.js'], 'client');
  api.addFiles(['cypher.js', 'server.js'], 'server');
  api.export('EntcoreMulti');
});
