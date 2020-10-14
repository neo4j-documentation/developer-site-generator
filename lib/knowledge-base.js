'use strict'

// tag::add-category-pages[]
function addKnowledgeBaseCategoryPages (pages, contentCatalog) {
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
    pages.push(contentCatalog.addFile(createKnowledgeBaseCategoryPage(category, associatedPages)))
  }
}
// end::add-category-pages[]

function createKnowledgeBaseCategoryPage (category, pages) {
  return {
    title: `Category ${category}`,
    asciidoc: {
      attributes: {
        'page-layout': 'kb-category',
        'page-category': category,
        'page-category-pages': pages,
        'page-theme': 'kb'
      }
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
function addKnowledgeBaseTagPages (pages, contentCatalog) {
  const pagesPerTag = pages
    .filter((page) => {
      return page.src.component === 'kb' &&
        page.asciidoc &&
        page.asciidoc.attributes &&
        page.asciidoc.attributes.tags
    })
    .reduce((acc, page) => {
      // category must be a single value
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
    pages.push(contentCatalog.addFile(createKnowledgeBaseTagPage(tag, associatedPages)))
  }
}
// end::generate-tag-pages[]

function createKnowledgeBaseTagPage (tag, pages) {
  return {
    title: `Tag ${tag}`,
    asciidoc: {
      attributes: {
        'page-layout': 'kb-tag',
        'page-category': tag,
        'page-tag-pages': pages,
        'page-theme': 'kb'
      }
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

module.exports = {
  addCategoryPages: addKnowledgeBaseCategoryPages,
  addTagPages: addKnowledgeBaseTagPages
}
