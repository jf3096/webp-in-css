const {addQueryString, hasQueryKey} = require('./lib/handle-url');
let postcss = require('postcss');

const UNIQUE_ID = '__WEBP__';

const prependClass = (className, cssModule) => cssModule ? `:global(${className})` : className;

module.exports = postcss.plugin('webp-in-css/plugin', (reqs = {}) => {
  return root => {
    const {cssModule} = reqs;
    root.walkDecls(decl => {
      console.log(decl.value.indexOf(UNIQUE_ID) === -1);
      if (/\.(jpg|jpeg|png|gif)/.test(decl.value) && decl.value.indexOf(UNIQUE_ID) === -1) {
        let rule = decl.parent;
        if (rule.selector.indexOf('.no-webp') !== -1) {
          return;
        }
        let webp = rule.cloneAfter();

        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove();
        });

        webp.selectors = webp.selectors.map(i => `${prependClass('body.webp', cssModule)} ` + i);
        webp.each(i => {
          const match = i.value.match(/url\((.+?)\)/);
          if (match && match[1]) {
            i.value = `url(${addQueryString(match[1], {[UNIQUE_ID]: 1})})`;
          }
          console.log('i.value: ' + i.value);
        });

        let noWebp = rule.cloneAfter();

        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove();
        });

        noWebp.selectors = noWebp.selectors.map(i => `${prependClass('body.no-webp', cssModule)} ` + i);

        decl.remove();
        if (rule.nodes.length === 0) rule.remove();
      }
    });
  };
});
