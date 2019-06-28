const URI = require('urijs')

/**
 * 添加 query string
 * @param {string} url - url 地址路径
 * @param {object} [query = {}] - 新增 query/search 参数
 * @param {boolean} [overwrite] - 是否覆盖
 * @returns {string} - 返回新的 url 地址
 */
function addQueryString(url, query = {}, overwrite = true) {
  /**
   * @typeof {URI}
   */
  const uri = URI(url)
  if (overwrite) {
    Object.keys(query).forEach((key) => {
      // noinspection JSUnresolvedFunction
      uri.removeSearch(key)
    })
  }
  // noinspection JSUnresolvedFunction
  uri.addSearch(query)
  return uri.toString()
}

module.exports = {
  addQueryString,
}
