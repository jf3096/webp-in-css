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
