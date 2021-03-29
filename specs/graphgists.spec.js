const path = require('path')
const fs = require('fs').promises
const { addGraphGistPages } = require('../lib/graphgists')
const chai = require('chai')
const expect = chai.expect

describe('GraphGists', () => {
  it('should create GraphGist pages', async () => {
    const pages = []
    const contentCatalog = {
      addFile: function(page) {
        return pages.push(page)
      },
      registerComponentVersion: function (name, version) {
      }
    }
    const asciidocConfig = {attributes: {}}
    const graphGists = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'specs', 'fixtures', 'graphgists.json'), 'utf8')).data.GraphGist
    addGraphGistPages(graphGists, contentCatalog, asciidocConfig)
    expect(pages.length).to.equal(272)
  })
})
