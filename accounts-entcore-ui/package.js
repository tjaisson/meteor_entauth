Package.describe({
  name: 'tjaisson:accounts-entcore-ui',
  summary: 'Blaze configuration templates for entcore OAuth.',
  version: '1.0.0'
});

Package.onUse(function (api) {
  api.addFiles('login_button.css', 'client');
});
