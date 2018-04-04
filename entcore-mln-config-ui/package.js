Package.describe({
  name: 'tjaisson:entcore-mln-config-ui',
  summary: 'Blaze configuration templates for entcore mln OAuth.',
  version: '1.0.0'
});

Package.onUse(function (api) {
  api.use('templating@1.2.13', 'client');
  api.addFiles('mln_login_button.css', 'client');
  api.addFiles(
    ['mln_configure.html', 'mln_configure.js'],
    'client'
  );
});
