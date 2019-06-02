const { addQueryString, hasQueryKey } = require('./lib/handle-url');
let postcss = require('postcss');

const UNIQUE_ID = '__WEBP__';

const prependClass = (cssModule) => cssModule ? `:global(${className})` : className;

module.exports = postcss.plugin('webp-in-css/plugin', (reqs) => {
  return root => {
    const { cssModule } = reqs;
    root.walkDecls(decl => {
      if (/\.(jpg|jpeg|png|gif)/.test(decl.value) && !hasQueryKey(decl.value, UNIQUE_ID)) {
        let rule = decl.parent;
        if (rule.selector.indexOf('.no-webp') !== -1) {
          return;
        }
        let webp = rule.cloneAfter();

        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove();
        });

        webp.selectors = webp.selectors.map(i => `${prependClass(cssModule)} ` + i);
        webp.each(i => {
          i.value = addQueryString(i.value, { [UNIQUE_ID]: 1 });
        });

        let noWebp = rule.cloneAfter();

        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove();
        });

        noWebp.selectors = noWebp.selectors.map(i => `${prependClass('body.no-webp')} ` + i);

        decl.remove();
        if (rule.nodes.length === 0) rule.remove();
      }
    });
  };
});
