Package.describe({
  name: 'tjaisson:accounts-entcore-direct',
  summary: "Set up a direct sso url",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use([
	  'underscore',
	  'kadira:flow-router',
	  'kadira:blaze-layout',
	  'tjaisson:entcore-oauth',
	  'tjaisson:accounts-entcore'
  ]);
  api.use([
    'templating',
    'tracker'
    ], 'client');

  api.addFiles('main.js');
  api.addFiles('wait.html', 'client');
  api.addFiles('client.js', 'client');
  api.export('EntcoreDirect', 'client');
});
