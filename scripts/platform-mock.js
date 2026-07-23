let Platform;
try {
  Platform = require('react-native-web').Platform;
} catch (e) {
  Platform = {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
    Version: 1,
    isTesting: false,
  };
}

module.exports = Platform;
module.exports.Platform = Platform;
module.exports.default = Platform;
