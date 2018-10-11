Package.describe({
  name: 'tjaisson:accounts-entcore-ui',
  summary: 'Blaze configuration templates for entcore OAuth.',
  version: '1.0.0'
});

Package.onUse(function (api) {
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

api.addFiles('login_button.css', 'client');
  api.addFiles('main.js');
  api.addFiles(['tmpl.html', 'client.js'], 'client');
  api.export('EntcoreUi');
});
