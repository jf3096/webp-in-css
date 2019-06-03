const isUrl = require('is-url');

const isAbsoluteUrl = (url) => {
  if (url.startsWith('//')) {
    return true;
  }
  return isUrl(url);
};

module.exports = isAbsoluteUrl;
