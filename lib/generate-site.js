'use strict'

const aggregateContent = require('@antora/content-aggregator')
const buildNavigation = require('@antora/navigation-builder')
const buildPlaybook = require('@antora/playbook-builder')
const classifyContent = require('@antora/content-classifier')
const convertDocuments = require('@antora/document-converter')
const createPageComposer = require('@antora/page-composer')
const loadUi = require('@antora/ui-loader')
const mapSite = require('@antora/site-mapper')
const produceRedirects = require('@antora/redirect-producer')
const publishSite = require('@antora/site-publisher')
const { resolveAsciiDocConfig } = require('@antora/asciidoc-loader')

async function generateSite (args, env) {
  const playbook = buildPlaybook(args, env)
  const asciidocConfig = resolveAsciiDocConfig(playbook)
  const [contentCatalog, uiCatalog] = await Promise.all([
    aggregateContent(playbook).then((contentAggregate) => classifyContent(playbook, contentAggregate, asciidocConfig)),
    loadUi(playbook),
  ])
  const pages = convertDocuments(contentCatalog, asciidocConfig)
  const navigationCatalog = buildNavigation(contentCatalog, asciidocConfig)
  const composePage = createPageComposer(playbook, contentCatalog, uiCatalog, env)
  pages.forEach((page) => composePage(page, contentCatalog, navigationCatalog))
  const siteFiles = [...mapSite(playbook, pages), ...produceRedirects(playbook, contentCatalog)]
  if (playbook.site.url) siteFiles.push(composePage(create404Page()))
  // tag::generate-category-pages[]
  const pagesPerCategory = pages
    .filter((page) => {
      return page.src.component === 'kb' &&
        page.asciidoc &&
        page.asciidoc.attributes &&
        page.asciidoc.attributes.category
    })
    .reduce((acc, page) => {
      const category = page.asciidoc.attributes.category
      let pages
      if (category in acc) {
        pages = acc[category]
      } else {
        pages = []
        acc[category] = pages
      }
      pages.push(page)
      return acc
    }, {})
  for (const [key, value] of Object.entries(pagesPerCategory)) {
    siteFiles.push(composePage(createKnowledgeBaseCategoryPage(key, value), contentCatalog, navigationCatalog))
  }
  // end::generate-category-pages[]
  const siteCatalog = { getFiles: () => siteFiles }
  return publishSite(playbook, [contentCatalog, uiCatalog, siteCatalog])
}

function createKnowledgeBaseCategoryPage (category, files) {
  return {
    title: '',
    version: 'master',
    mediaType: 'text/html',
    contents: files,
    asciidoc: {
      attributes: {
        'page-layout': 'kb-category',
        'page-category': category
      }
    },
    src: {
      module: 'ROOT',
      component: 'kb',
      version: 'master',
    },
    out: { path: `kb/categories/${category}.html` },
    pub: {
      url: `kb/categories/${category}.html`
    },
  }
}

function create404Page () {
  return {
    title: 'Page Not Found',
    mediaType: 'text/html',
    src: { stem: '404' },
    out: { path: '404.html' },
    pub: { url: '/404.html', rootPath: '' },
  }
}

module.exports = generateSite
