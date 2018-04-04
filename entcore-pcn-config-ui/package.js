Package.describe({
  name: 'tjaisson:entcore-pcn-config-ui',
  summary: 'Blaze configuration templates for entcore OAuth.',
  version: '1.0.0'
});

Package.onUse(function (api) {
  api.use('templating@1.2.13', 'client');
  api.addFiles('pcn_login_button.css', 'client');
  api.addFiles(
    ['pcn_configure.html', 'pcn_configure.js'],
    'client'
  );
});
