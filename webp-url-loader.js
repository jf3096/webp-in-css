// Copyright (C) 2016 Max Riveiro <24732077@qq.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var imagemin = require('imagemin');
var imageminWebp = require('imagemin-webp');
var loaderUtils = require('loader-utils');
var mime = require('mime');

module.exports = function(content) {
  this.cacheable && this.cacheable();
  if (!this.emitFile) {
    throw new Error('emitFile is required from module system');
  }

  var callback = this.async();
  var called = false;

  var query = loaderUtils.getOptions(this);
  // save file path  as source file hash
  var url = loaderUtils.interpolateName(this, query.name || '[hash].[ext]', {
    content: content,
    regExp: query.regExp,
  });
  var webpUrl = url + '.webp';
  const finalUrl = this.resourceQuery.indexOf('__WEBP__=1') > -1 ? webpUrl : url;
  if (query.limit) {
    limit = parseInt(query.limit, 10);
  }
  var mimetype = query.mimetype || query.minetype || mime.lookup(this.resourcePath);
  if (limit <= 0 || content.length < limit) {
    callback(null, 'module.exports = ' + JSON.stringify('data:' + (mimetype ? mimetype + ';' : '') + 'base64,' + content.toString('base64')));
    return false;
  }

  var options = {
    preset: query.preset || 'default',
    quality: query.quality || 75,
    alphaQuality: query.alphaQuality || 100,
    method: query.method || 1,
    sns: query.sns || 80,
    autoFilter: query.autoFilter || false,
    sharpness: query.sharpness || 0,
    lossless: query.lossless || false,
    bypassOnDebug: query.bypassOnDebug || false,
  };

  if (query.size) {
    options.size = query.size;
  }

  if (query.filter) {
    options.filter = query.filter;
  }
  let publicPath = `__webpack_public_path__ + ${JSON.stringify(finalUrl)}`;

  if (query.publicPath) {
    if (typeof query.publicPath === 'function') {
      publicPath = query.publicPath(finalUrl);
    } else if (query.publicPath.endsWith('/')) {
      publicPath = query.publicPath + finalUrl;
    } else {
      publicPath = `${query.publicPath}/${finalUrl}`;
    }
    publicPath = JSON.stringify(publicPath);
  }
  if (this.debug === true && options.bypassOnDebug === true) {
    callback(null, `module.exports = ${publicPath};`);
  } else {
    imagemin.buffer(content, { plugins: [imageminWebp(options)] }).then(file => {
      this.emitFile(url, content);
      this.emitFile(webpUrl, file);
      callback(null, `module.exports = ${publicPath};`);
    }).catch(err => {
      callback(err);
    });
  }
};

module.exports.raw = true;
