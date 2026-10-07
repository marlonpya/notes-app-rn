const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Migraciones de drizzle-kit.
config.resolver.sourceExts.push('sql');

module.exports = config;
