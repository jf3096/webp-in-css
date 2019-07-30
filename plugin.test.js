const postcss = require('postcss')
const plugin = require('./postcss-plugin')

function exam(input, output, options) {
  expect(postcss([plugin]).process(input, options).css).toEqual(output)
}

it('postcss-plugin: 基本流程', () => {
  exam(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
    'a, b { color: black } ' +
    'body.no-webp a, body.no-webp b {background-image: url(./image.jpg) } ' +
    'body.webp a, body.webp b {background-image: url(./image.jpg?__WEBP__=1) } ' +
    '}',
  )

  exam(
    'a,b { background: url(/image.png) }',
    'body.no-webp a,body.no-webp b {background-image: url(/image.png) }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1) }',
  )

  exam(
    'a,b { background: #ffffff url(/image.png) no-repeat /cover  }',
    'a,b { background: #ffffff  no-repeat /cover  }body.no-webp a,body.no-webp b {background-image: url(/image.png)  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1)  }',
  )

  exam(
    'a,b { background: url(/image.png); background-size: cover;  }',
    'a,b { background-size: cover;  }body.no-webp a,body.no-webp b {background-image: url(/image.png);  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1);  }',
  )

  exam(
    'a,b { background: #ffffff url(/image.png); background-size: cover;  }',
    'a,b { background: #ffffff ; background-size: cover;  }body.no-webp a,body.no-webp b {background-image: url(/image.png);  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1);  }',
  )

  exam(
    `a,b { 
            /* background: #ffffff url(/image.png); */
            background-size: cover;  
          }`,
    `a,b { 
            /* background: #ffffff url(/image.png); */
            background-size: cover;  
          }`,
  )

  exam(
    `a { 
            /* background: #ffffff url(/image.png); */
            background-image: url(color.png);  
          }`,
    `a { 
            /* background: #ffffff url(/image.png); */  
          }body.no-webp a {background-image: url(color.png);  
          }body.webp a {background-image: url(color.png?__WEBP__=1);  
          }`,
  )

  exam(
    `a {
            background-image: url(color.png);  
            /* background: #ffffff url(/image.png); */
          }`,
    `a {  
            /* background: #ffffff url(/image.png); */
          }body.no-webp a {background-image: url(color.png);
          }body.webp a {background-image: url(color.png?__WEBP__=1);
          }`,
  )
})


it('postcss-plugin: 多个 background-image', ()=> {
  exam(
    'a,b { background: url(/image.png); background: url(/overwrite.png);  }',
    'body.no-webp a,body.no-webp b {background-image: url(/image.png);  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1);  }body.no-webp a,body.no-webp b {background-image: url(/overwrite.png);  }body.webp a,body.webp b {background-image: url(/overwrite.png?__WEBP__=1);  }',
  )

  exam(
    'a,b { color: red; background-image: url(/image.png); background: url(/overwrite.png) no-repeat;  }',
    'a,b { color: red; background:  no-repeat;  }body.no-webp a,body.no-webp b {background-image: url(/image.png);  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1);  }body.no-webp a,body.no-webp b {background-image: url(/overwrite.png);  }body.webp a,body.webp b {background-image: url(/overwrite.png?__WEBP__=1);  }',
  )

  exam(
    'a,b { color: red; background: url(/overwrite.png) top left; background-image: url(/image.png); background-size: cover; position: absolute  }',
    'a,b { color: red; background:  top left; background-size: cover; position: absolute  }body.no-webp a,body.no-webp b {background-image: url(/overwrite.png)  }body.webp a,body.webp b {background-image: url(/overwrite.png?__WEBP__=1)  }body.no-webp a,body.no-webp b {background-image: url(/image.png)  }body.webp a,body.webp b {background-image: url(/image.png?__WEBP__=1)  }',
  )
})

it('postcss-plugin: 忽略后缀为大写时的情况', () => {
  exam(
    'a,b { background: url(./image.PNG) }',
    'a,b { background: url(./image.PNG) }',
  )
})

it('postcss-plugin: content 作为背景时', () => {
  exam(
    'a:before { display: none; content: url(images/da-tang-yi-bao.png) url(images/da-tang-yi-bao-active.png) url(images/da-tang-yi-bao-active.png);}',
    'a:before { display: none; content: url(images/da-tang-yi-bao.png) url(images/da-tang-yi-bao-active.png) url(images/da-tang-yi-bao-active.png);}body.no-webp a:before {content: url(images/da-tang-yi-bao.png) url(images/da-tang-yi-bao-active.png) url(images/da-tang-yi-bao-active.png);}body.webp a:before {content: url(images/da-tang-yi-bao.png?__WEBP__=1) url(images/da-tang-yi-bao-active.png?__WEBP__=1) url(images/da-tang-yi-bao-active.png?__WEBP__=1);}',
  )
})

it('postcss-plugin: background 单行多背景', () => {
  exam(
    'a { background: url(img_flwr.gif) right bottom no-repeat, url(paper.gif) left top repeat; }',
    'a { background:  right bottom no-repeat,  left top repeat; }body.no-webp a {background-image: url(img_flwr.gif) url(paper.gif); }body.webp a {background-image: url(img_flwr.gif?__WEBP__=1) url(paper.gif?__WEBP__=1); }',
  )
})

it('postcss-plugin: empty prop', () => {
  exam(
    'a { }',
    'a { }',
  )
})

it('postcss-plugin: 不支持的图片格式', () => {
  exam(
    'a { background-image: url("test.svg") }',
    'a { background-image: url("test.svg") }',
  )
})

it('postcss-plugin: 不支持的图片形式', () => {
  exam(
    'a { background-image: url("http://baidu.com/haha.png") }',
    'a { background-image: url("http://baidu.com/haha.png") }',
  )

  exam(
    'a { background-image: url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==) }',
    'a { background-image: url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==) }',
  )
})
