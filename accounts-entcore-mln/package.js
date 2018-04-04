Package.describe({
  name: 'tjaisson:accounts-entcore-mln',
  summary: "Login service for entcore mln accounts",
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
		    ['accounts-ui', 'tjaisson:entcore-mln-config-ui'],
		    ['client', 'server'],
		    { weak: true }
		  );
  api.addFiles('mln.js');
  api.addFiles('mln_server.js', 'server');
  api.addFiles('mln_client.js', 'client');
});
