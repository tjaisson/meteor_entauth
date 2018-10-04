Package.describe({
  name: 'tjaisson:accounts-entcore',
  summary: "Login base service for entcore accounts",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.use(['underscore', 'random']);
  api.use('tracker', 'client');
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('tjaisson:entcore-oauth');
  //api.imply('tjaisson:entcore-oauth');

  api.addFiles('accounts_entcore.js');
  api.addFiles('accounts_entcore_server.js', 'server');
  api.addFiles('accounts_entcore_client.js', 'client');
  
  api.export('AccountsEntCore');
});
