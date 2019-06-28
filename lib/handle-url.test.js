const {addQueryString} = require('./handle-url');

function exam(input, output) {
  expect(input).toEqual(output);
}

it('addQueryString: 绝对路径', () => {
  exam(
    addQueryString('https://github.com/foo/bar/haha.png', {username: 'allen'}),
    'https://github.com/foo/bar/haha.png?username=allen',
  );

  exam(
    addQueryString('https://github.com/foo/bar/haha.png?test', {username: 'allen'}),
    'https://github.com/foo/bar/haha.png?test&username=allen',
  );

  exam(
    addQueryString('https://github.com/foo/bar/haha.png?username=1&password=2', {username: 'allen'}),
    'https://github.com/foo/bar/haha.png?password=2&username=allen',
  );

  exam(
    addQueryString('//github.com/foo/bar/haha.png?username=1&password=2', {username: 'allen'}),
    '//github.com/foo/bar/haha.png?password=2&username=allen',
  );

  exam(
    addQueryString('file://github.com/foo/bar/haha.png?username=1&password=2', {username: 'allen'}),
    'file://github.com/foo/bar/haha.png?password=2&username=allen',
  );

  exam(
    addQueryString('file://github.com/foo/bar/haha.png?username=1&password=2', {username: 'allen'}),
    'file://github.com/foo/bar/haha.png?password=2&username=allen',
  );
});

it('addQueryString: 相对路径', () => {
  exam(
    addQueryString('./image.webp', {username: 'allen'}),
    './image.webp?username=allen',
  );

  exam(
    addQueryString('../image.webp', {username: 'allen'}),
    '../image.webp?username=allen',
  );

  exam(
    addQueryString('./../image.webp', {username: 'allen'}),
    './../image.webp?username=allen',
  );

  exam(
    addQueryString('/../image.webp', {username: 'allen'}),
    '/../image.webp?username=allen',
  );

  exam(
    addQueryString('/image.webp', {username: 'allen', pass: '123'}),
    '/image.webp?username=allen&pass=123',
  );
});

it('addQueryString: 特殊场景', () => {
  exam(
    addQueryString('./image.webp#main', {username: 'allen'}),
    './image.webp?username=allen#main',
  );

  exam(
    addQueryString('./image.webp?&#!/', {username: 'allen'}),
    './image.webp?username=allen#!/',
  );

  exam(
    addQueryString('./image.webp?&#!/article/1', {username: 'allen'}),
    './image.webp?username=allen#!/article/1',
  );
});
