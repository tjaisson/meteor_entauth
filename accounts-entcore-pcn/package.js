Package.describe({
  name: 'tjaisson:accounts-entcore-pcn',
  summary: "Login service for entcore-pcn accounts",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use(['underscore', 'random']);
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('tjaisson:entcore-oauth');
  api.imply('tjaisson:entcore-oauth');

  api.use(
		    ['accounts-ui', 'tjaisson:entcore-pcn-config-ui'],
		    ['client', 'server'],
		    { weak: true }
		  );
  api.addFiles('pcn.js');
  api.addFiles('pcn_server.js', 'server');
  api.addFiles('pcn_client.js', 'client');
});
