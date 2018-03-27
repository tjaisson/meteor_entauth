Package.describe({
  name: 'tjaisson:entcore-config-ui',
  summary: 'Blaze configuration templates for entcore OAuth.',
  version: '1.0.0'
});

Package.onUse(function (api) {
  api.use('templating@1.2.13', 'client');
  api.addFiles('entcore_login_button.css', 'client');
  api.addFiles(
    ['entcore_configure.html', 'entcore_configure.js'],
    'client'
  );
});
