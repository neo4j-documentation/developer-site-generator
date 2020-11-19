'use strict'

const cheerio = require('cheerio')

// tag::add-category-pages[]
function addKnowledgeBaseCategoryPages (pages, contentCatalog, asciidocConfig) {
  const pagesPerCategory = pages
    .filter((page) => {
      return page.src.component === 'kb' &&
        page.asciidoc &&
        page.asciidoc.attributes &&
        page.asciidoc.attributes.category
    })
    .reduce((acc, page) => {
      // category must be a single value
      const category = page.asciidoc.attributes.category.split(',')[0].trim().toLowerCase()
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
  for (const [category, associatedPages] of Object.entries(pagesPerCategory)) {
    pages.push(contentCatalog.addFile(createKnowledgeBaseCategoryPage(category, associatedPages, asciidocConfig)))
  }
}
// end::add-category-pages[]

function createKnowledgeBaseCategoryPage (category, pages, asciidocConfig) {
  const asciidocAttributes = {
    ...asciidocConfig.attributes,
    'page-layout': 'kb-category',
    'page-category': category,
    'page-category-pages': pages,
    'page-breadcrumb': category
  }
  return {
    title: `Category ${category}`,
    asciidoc: {
      attributes: asciidocAttributes
    },
    src: {
      component: 'kb',
      version: 'master',
      module: 'ROOT',
      family: 'page',
      relative: `categories/${category}.adoc`,
      stem: category,
      mediaType: 'text/asciidoc'
    }
  }
}

// tag::generate-tag-pages[]
function addKnowledgeBaseTagPages (pages, contentCatalog, asciidocConfig) {
  const pagesPerTag = pages
    .filter((page) => {
      return page.src.component === 'kb' &&
        page.asciidoc &&
        page.asciidoc.attributes &&
        page.asciidoc.attributes.tags
    })
    .reduce((acc, page) => {
      const tagsAttribute = page.asciidoc.attributes.tags
      const tags = tagsAttribute.trim().split(',').map((value) => value.trim().toLowerCase())
      for (const tag of tags) {
        let pages
        if (tag in acc) {
          pages = acc[tag]
        } else {
          pages = []
          acc[tag] = pages
        }
        pages.push(page)
      }
      return acc
    }, {})
  for (const [tag, associatedPages] of Object.entries(pagesPerTag)) {
    pages.push(contentCatalog.addFile(createKnowledgeBaseTagPage(tag, associatedPages, asciidocConfig)))
  }
}
// end::generate-tag-pages[]

function createKnowledgeBaseTagPage (tag, pages, asciidocConfig) {
  console.log({asciidocConfig})
  const asciidocAttributes = {
    ...asciidocConfig.attributes,
    'page-layout': 'kb-tag',
    'page-tag': tag,
    'page-tag-pages': pages,
    'page-breadcrumb': tag,
  }
  return {
    title: `Tag ${tag}`,
    asciidoc: {
      attributes: asciidocAttributes
    },
    src: {
      component: 'kb',
      version: 'master',
      module: 'ROOT',
      family: 'page',
      relative: `tags/${tag}.adoc`,
      stem: tag,
      mediaType: 'text/asciidoc'
    }
  }
}

const generateExcerpt = (page) => {
  const $ = cheerio.load(page.contents.toString())
  // removes tables, images and source block
  $('table').remove()
  $('img').remove()
  $('pre').remove()
  $('iframe').remove()
  let text = $.text()
  text = text.trim()
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
  let words = text.split(' ')
  let excerpt
  if (words.length > 30) {
    words = words.slice(0, 30)
    excerpt = words.join(' ') + '…'
  } else {
    excerpt = words.join(' ')
  }
  return excerpt
}

function generateKnowledgeBasePageDescription(pages) {
  pages
    .filter((page) => {
      return page.src.component === 'kb' &&
        page.src.basename !== 'index.adoc' &&
        page.asciidoc &&
        page.asciidoc.attributes &&
        !page.asciidoc.attributes['page-description']
    })
    .forEach((page) => {
      page.asciidoc.attributes['page-description'] = generateExcerpt(page)
    })
}

module.exports = {
  addCategoryPages: addKnowledgeBaseCategoryPages,
  addTagPages: addKnowledgeBaseTagPages,
  generateKnowledgeBasePageDescription: generateKnowledgeBasePageDescription
}
