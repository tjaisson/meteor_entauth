Package.describe({
  name: 'tjaisson:pcn-oauth',
  summary: "PCN OAuth flow",
  version: "1.0.0"
});


Package.onUse(function(api) {
  api.use("ecmascript");
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('service-configuration');
  api.use('random', 'client');

  api.addFiles('pcn_server.js', 'server');
  api.addFiles('pcn_client.js', 'client');

  api.mainModule('namespace.js');

  api.export('PCNNG');
});
