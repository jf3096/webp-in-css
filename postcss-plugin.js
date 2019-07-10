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
const BACKGROUND_URL_REGEX = /url(?:\(['"]?)(.*?)(?:['"]?\))/gi

/**
 * 附加 css class
 * @param {string} className - css class 名
 * @param {boolean} supportCssModule - 是否支持 cssModule, 默认 false
 * @returns {string}
 */
const prependClass = (className, supportCssModule = false) => supportCssModule ? `:global(${className})` : className

/**
 * 在 rule 中是否有图片路径存在
 * @param rule
 * @returns {boolean}
 */
const hasImageInDecl = (rule) => /background[^:]*.*url[^;]+/gi.test(rule)

/**
 * 提取图片路径
 * @param  {String} ruleStr
 * @return {Array}
 */
function getImageUrl(ruleStr) {
  const splits = ruleStr.split(BACKGROUND_URL_REGEX)
  let original = ''
  let normalized = ''

  if (splits && splits[1]) {
    original = splits[1]
    normalized = original
      .replace(/['"]/gi, '') // 将所有 " ' 替换成单引号 '
      .replace(/\?.*$/gi, '') // 移除 query string
  }

  return [original, normalized]
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
 * @param {string} backgroundImageUrl - 背景图片
 */
function cloneAfterBackgroundImageNode(rule, backgroundImageUrl) {
  const newRule = rule.cloneAfter()
  newRule.removeAll()
  let decl1 = postcss.decl({ prop: 'background-image', value: `url(${backgroundImageUrl})` })
  newRule.nodes.push(decl1)
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
  return declString.replace(BACKGROUND_URL_REGEX, '')
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
        const declStr = decl.toString()

        /**
         * 非 decl, 如 comment 注释, 跳过
         */
        if (!isDecl(decl) ) {
          continue
        }

        /**
         * 当前规则中是否涵图片
         */
        if (!hasImageInDecl(declStr)) {
          continue
        }

        /**
         * 图片地址
         */
        const url = getImageUrl(declStr)[1]

        /**
         * 不支持图片时
         */
        if (!isImageSupported(url)) {
          continue
        }

        /**
         * 是否全部大写后缀, 例如 .PNG, .JPG, 如果是直接忽略不进行处理
         */
        if (isUrlExtensionAllCharsUppercase(url)) {
          continue
        }

        /**
         * 是否是支持的文件后缀
         */
        if (!supportedExtensions.includes(path.extname(url))) {
          continue
        }

        const webpBackgroundImage = markBackgroundImageUrlAsWebpType(url)
        clonedRules.push(
          prependClassToRule('body.webp', cloneAfterBackgroundImageNode(rule, webpBackgroundImage), supportWebp),
        )

        const noWebpBackgroundImage = markBackgroundImageUrlAsWebpType(url, false)
        clonedRules.push(
          prependClassToRule('body.no-webp', cloneAfterBackgroundImageNode(rule, noWebpBackgroundImage), supportWebp),
        )

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
