const util = require('util')
const path = require('path')
const fs = require('fs').promises
const graphGistGraphqlApi = require('../lib/graphgists/graphql-api')
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

describe('Generate site', () => {
  // integration test with mock data
  it.skip('should generate site with mock data', async () => {
    const graphGistsData = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'specs', 'fixtures', 'graphgists.json'), 'utf8')).data.GraphGist
    sinon.stub(graphGistGraphqlApi, "getLiveGraphGists").returns(graphGistsData)
    const generateSite = require('../lib/generate-site')
    await generateSite(['--playbook', path.join(__dirname, 'fixtures', 'graphgists-site.yml')], process.env)
  }).timeout(30000)
})
