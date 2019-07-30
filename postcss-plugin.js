const { addQueryString } = require('./lib/handle-url')
const path = require('path')
const postcss = require('postcss')

/**
 * Plugin constants.
 */
const PLUGIN_NAME = 'webp-in-css/plugin'
const UNIQUE_ID = '__WEBP__'
const BACKGROUND = 'background'
const BACKGROUND_IMAGE = 'background-image'
const URL_REGEX = /url(?:\(['"]?)(.*?)(?:['"]?\))/gi
const REPLACE_URL_REGEX = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g

/**
 * 附加 css class
 * @param {string} className - css class 名
 * @param {boolean} supportCssModule - 是否支持 cssModule, 默认 false
 * @returns {string}
 */
const prependClass = (className, supportCssModule = false) => supportCssModule ? `:global(${className})` : className

/**
 * 提取图片路径
 * @param  {String} ruleStr
 * @return {Array}
 */
function getImageUrls(ruleStr) {
  let matches = ruleStr.match(URL_REGEX)
  if (matches && matches.length) {
    /**
     * 过滤值,
     * 输入: ["images/da-tang-yi-bao.png"," ","images/da-tang-yi-bao-active.png"," ","images/da-tang-yi-bao-active.png"]
     * 输出: ["images/da-tang-yi-bao-active.png","images/da-tang-yi-bao-active.png"]
     * @type {string[]}
     */
    return matches.map((match) => {
      return match
        .replace(URL_REGEX, '$1')
        .replace(/\?.*$/gi, '') // 移除 query string
    }).filter(Boolean)
  }

  return []
}

/**
 * Checks whether the image is supported.
 * @param  {String}  url
 * @return {Boolean}
 */
function isImageSupported(url) {
  const http = /^http[s]?/gi
  const base64 = /^data:image/gi
  return !http.test(url) && !base64.test(url)
}

/**
 * 复制背景图片节点
 * @param {object} rule
 * @param {object} decl
 * @param {boolean} supportWebp - 背景图片
 * @param {string[]} imageUrls - 图片 urls
 * @param {string[]} supportedExtensions - 是否支持后缀
 */
function cloneAfterBackgroundImageNode({ rule, decl, supportWebp, imageUrls, supportedExtensions }) {
  const newRule = rule.cloneAfter()
  newRule.removeAll()

  /**
   * 判断是否是 background 属性
   * @type {boolean}
   */
  const isBackgroundProp = decl.prop === 'background'
  const nextDeclProp = isBackgroundProp ? 'background-image' : decl.prop
  // /**
  //  * 当 rule 都是大写时, 返回原 rule
  //  */
  // if (imageUrls.every(url => isUrlExtensionAllCharsUppercase(url))) {
  //   newRule.remove()
  //   return null
  // }

  let nextDeclValue = isBackgroundProp ? imageUrls.map(imageUrl => `url(${imageUrl})`).join(' ') : decl.value

  if (supportWebp) {
    nextDeclValue = nextDeclValue.replace(REPLACE_URL_REGEX, (group1, group2, url, group4) => {
      if (isImageSupported(url)) {
        /**
         * 是否全部大写后缀, 例如 .PNG, .JPG, 如果是直接忽略不进行处理
         */
        if (!isUrlExtensionAllCharsUppercase(url)) {
          /**
           * 是否是支持的文件后缀
           */
          if (!isUrlsAllUnderNotSupportedExtensions({urls: [url], supportedExtensions})) {
            return group2 + markBackgroundImageUrlAsWebpType(url) + group4
          }
        } else {
          return ''
        }
      }
      return group1
    })
  }

  if (!nextDeclValue) {
    return null
  }

  newRule.nodes.push(postcss.decl({ prop: nextDeclProp, value: nextDeclValue }))
  return newRule
}

/**
 * 添加 class 到 rule 中
 * @param className
 * @param rule
 * @param supportCssModule
 * @returns {*}
 */
function prependClassToRule(className, rule, supportCssModule) {
  if (!rule) {
    return rule
  }
  rule.selectors = rule.selectors.map(i => `${prependClass(className, supportCssModule)} ` + i)
  return rule
}

/**
 * 标记背景图片为 webp 类型
 * @param {string} backgroundImageUrl - 背景图片
 * @param {boolean} supportWebp - 是否支持 webp
 * @returns {*}
 */
function markBackgroundImageUrlAsWebpType(backgroundImageUrl, supportWebp = true) {
  if (supportWebp) {
    return addQueryString(backgroundImageUrl, { [UNIQUE_ID]: 1 })
  }
  return backgroundImageUrl
}

/**
 * 移除背景 url
 * @param {string} declString
 * @returns {*|void|string|never}
 */
function removeBackgroundUrl(declString) {
  return declString.replace(URL_REGEX, '')
}

/**
 * 后缀的每一个字符都是大写
 * @param {string} url
 */
function isUrlExtensionAllCharsUppercase(url) {
  const extension = path.extname(url)
  return /^\.[A-Z]*$/.test(extension)
}

/**
 * url 是否在不支持后缀列表中
 * @param urls
 * @param supportedExtensions
 * @returns {boolean}
 */
function isUrlsAllUnderNotSupportedExtensions({ urls, supportedExtensions }) {
  return urls.every((url) => !supportedExtensions.includes(path.extname(url)))
}

/**
 * 针对如 type 为 comment 即注释时判断为 false
 * @param node
 * @returns {boolean}
 */
function isDecl(node) {
  return node.type === 'decl'
}

const PLUGIN_DEFAULT_REQS = {
  cssModule: false,
  supportedExtensions: ['.gif', '.jpg', '.jpeg', '.png'],
}

module.exports = postcss.plugin(PLUGIN_NAME, (reqs = {}) => {
  return root => {
    const { cssModule: supportWebp, supportedExtensions } = Object.assign(PLUGIN_DEFAULT_REQS, reqs)
    const clonedRules = []
    root.walkRules(rule => {
      if (!rule) {
        return
      }

      if (clonedRules.includes(rule)) {
        return
      }

      const nodes = rule.nodes

      /**
       * 这里需要倒序遍历, 用于处理关于 cloneAfter 的覆盖情况
       */
      for (let i = nodes.length - 1; i >= 0; i--) {
        const decl = nodes[i]
        const declStr = decl.value

        /**
         * 非 decl, 如 comment 注释, 跳过
         */
        if (!isDecl(decl)) {
          continue
        }

        /**
         * 图片地址
         */
        const urls = getImageUrls(declStr)

        /**
         * 没有
         */
        if (urls.length === 0) {
          continue
        }

        /**
         * 没有任何支持图片时
         */
        if (!urls.some(url => isImageSupported(url))) {
          continue
        }

        /**
         * 所有 url 都是不支持的后缀
         */
        if (urls.every(url => isUrlExtensionAllCharsUppercase(url))) {
          continue
        }

        if (isUrlsAllUnderNotSupportedExtensions({urls, supportedExtensions})) {
          continue
        }

        const webpRule = prependClassToRule('body.webp', cloneAfterBackgroundImageNode({
          imageUrls: urls,
          rule,
          decl,
          supportWebp: true,
          supportedExtensions,
        }), supportWebp)
        webpRule && clonedRules.push(webpRule)

        const noWebpRule = prependClassToRule('body.no-webp', cloneAfterBackgroundImageNode({
          imageUrls: urls,
          rule,
          decl,
          supportWebp: false,
          supportedExtensions,
        }), supportWebp)
        noWebpRule && clonedRules.push(noWebpRule)

        if (!webpRule && !noWebpRule) {
          continue
        }

        if (decl.prop === BACKGROUND_IMAGE) {
          decl.remove()
        } else if (decl.prop === BACKGROUND) {
          decl.value = removeBackgroundUrl(decl.value)
          if (!decl.value.trim()) {
            decl.remove()
          }
        }
        if (rule.nodes.length === 0) {
          rule.remove()
        }
      }
    })
  }
})
