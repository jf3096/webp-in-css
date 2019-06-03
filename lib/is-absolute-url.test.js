const isAbsoluteUrl = require('./is-absolute-url');

function exam(input, output) {
  expect(input).toEqual(output);
}

it('检查是否是绝对路径', () => {
  exam(isAbsoluteUrl('http://haha.com'), true);
  exam(isAbsoluteUrl('https://haha.com'), true);
  exam(isAbsoluteUrl('//haha.com'), true);
  exam(isAbsoluteUrl('ftp://haha.com'), true);
  exam(isAbsoluteUrl('./haha.com'), false);
  exam(isAbsoluteUrl('/haha.com'), false);
  exam(isAbsoluteUrl('haha.png'), false);
  exam(isAbsoluteUrl('images/haha.png'), false);
  exam(isAbsoluteUrl('../images/haha.png'), false);
  exam(isAbsoluteUrl('../../images/haha.png'), false);
  exam(isAbsoluteUrl('@src/images/haha.png'), false);
});
