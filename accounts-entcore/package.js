Package.describe({
  name: 'tjaisson:accounts-entcore',
  summary: "Login service for entcore accounts",
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

  // If users use accounts-ui but not google-config-ui, give them a tip.
  api.use(['accounts-ui', 'pcn-config-ui'], ['client', 'server'], { weak: true });
  api.addFiles("notice.js");

  api.addFiles("entcore.js");
});
