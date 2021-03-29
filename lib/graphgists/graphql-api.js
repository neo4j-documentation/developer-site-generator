'use strict'

const fetch = require('node-fetch')

const graphGistHost = 'https://graphgist-v3-api.herokuapp.com/graphql'

const sendRequest = function (data) {
  return fetch(graphGistHost, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json())
}

/**
 * Get all GraphGists with the status live.
 * @returns {Promise<Object>}
 */
const getLiveGraphGists = async function () {
  const response = await sendRequest({
    query: `{
  GraphGist (status: live) {
    uuid title slug summary image { source_url } author { name } industries { slug name image { source_url } } use_cases { slug name image { source_url } } asciidoc featured
  }
}`,
  })
  return response.data.GraphGist
}

module.exports = {
  getLiveGraphGists,
}
