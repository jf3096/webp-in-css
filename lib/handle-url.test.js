const { addQueryString } = require('./handle-url');

function exam(input, output) {
  expect(input).toEqual(output);
}

it('adds query string', () => {
  console.log(addQueryString('https://github.com/foo/bar/haha.png?test', { username: 'allen' }));

  exam(
    addQueryString('https://github.com/foo/bar/haha.png', { username: 'allen' }),
    'https://github.com/foo/bar/haha.png?username=allen',
  );

  exam(
    addQueryString('https://github.com/foo/bar/haha.png?test', { username: 'allen' }),
    'https://github.com/foo/bar/haha.png?username=allen',
  );

  exam(
    addQueryString(addQueryString('https://github.com/foo/bar/haha.png?ignore'), { username: 'allen' }),
    'https://github.com/foo/bar/haha.png?username=allen',
  );

  exam(
    addQueryString(addQueryString('https://github.com/foo/bar/haha.png?username=1&password=2'), { username: 'allen' }),
    'https://github.com/foo/bar/haha.png?username=allen',
  );
});
