let parse = require('url-parse')

function addQueryString(url, query) {
  const parsed = parse(url)
  const newQuery = Object.assign({}, parsed.query, query)
  parsed.set('query', newQuery)
  return parsed.toString()
}

function hasQueryKey(url, queryKey) {
  const parsed = parse(url)
  return parsed.query && parsed.query.indexOf('__WEBP__=1') > -1
}

module.exports = {
  addQueryString,
  hasQueryKey
}
