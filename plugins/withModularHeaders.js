const { withPodfile } = require('@expo/config-plugins');

module.exports = function withModularHeaders(config) {
  return withPodfile(config, (mod) => {
    if (!mod.modResults.contents.includes('use_modular_headers!')) {
      mod.modResults.contents = 'use_modular_headers!\n' + mod.modResults.contents;
    }
    return mod;
  });
};
