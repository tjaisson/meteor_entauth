Package.describe({
  name: 'tjaisson:accounts-entcore-multi',
  summary: 'multi accounts merging',
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use([
	  'underscore',
	  'kadira:flow-router',
	  'kadira:blaze-layout',
	  'tjaisson:accounts-entcore'
  ]);
  api.use([
    'templating',
    'tracker'
    ], 'client');

  api.addFiles('main.js');
  api.addFiles('tmpl.html', 'client');
  api.addFiles('client.js', 'client');
  api.export('EntcoreMulti');
});
