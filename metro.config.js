const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure ttf/otf font files are treated as static assets
if (!config.resolver.assetExts.includes("ttf")) {
  config.resolver.assetExts.push("ttf");
}
if (!config.resolver.assetExts.includes("otf")) {
  config.resolver.assetExts.push("otf");
}

module.exports = config;
