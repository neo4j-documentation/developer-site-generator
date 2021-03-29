'use strict'

const { convert: convertJupyterNotebook } = require('./graphgists/jupyter-converter')
const { preprocessing: asciidocPreprocessing } = require('./graphgists/asciidoc-preprocessing')

const componentName = 'graphgists'
const componentVersion = 'master'
const componentModule = 'ROOT'

// Jupyter Notebook

function generateJupyterNotebookAttachments(graphGists, contentCatalog) {
  for (const graphGist of graphGists) {
    const notebookContent = convertJupyterNotebook(graphGist.asciidoc)
    contentCatalog.addFile(createJupyerNotebookAttachment(notebookContent, graphGist))
  }
}

function createJupyerNotebookAttachment(notebookContent, graphGist) {
  return {
    contents: Buffer.from(notebookContent),
    src: {
      component: componentName,
      version: componentVersion,
      module: componentModule,
      family: 'attachment',
      relative: `${graphGist.slug}.ipynb`,
      stem: graphGist.slug,
      mediaType: 'text/asciidoc'
    }
  }
}

// Category pages

function addGraphGistCategoryPages(graphGists, pages, contentCatalog, asciidocConfig) {
  const categoryPagesMap = new Map()
  const categories = getCategories(graphGists)
  for (const category of categories) {
    const categoryPage = contentCatalog.addFile(createGraphGistCategoryPage(category, asciidocConfig))
    categoryPagesMap.set(category.slug, categoryPage)
  }
  const graphGistsMap = new Map()
  for (const graphGist of graphGists) {
    graphGistsMap.set(graphGist.slug, graphGist)
  }
  let pagesPerCategory = {}
  for (const page of pages) {
    if (page.src.component === componentName && graphGistsMap.has(page.src.stem)) {
      const graphGist = graphGistsMap.get(page.src.stem)
      const asciidocAttributes = {
        ...page.asciidoc.attributes,
        'page-industries': graphGist.industries.map((industry) => {
          const categoryPage = categoryPagesMap.get(industry.slug)
          return { ...industry, pub: categoryPage.pub }
        }),
        'page-usecases': graphGist.use_cases.map((useCase) => {
          const categoryPage = categoryPagesMap.get(useCase.slug)
          return { ...useCase, pub: categoryPage.pub }
        }),
      }
      page.asciidoc.attributes = asciidocAttributes
      const categories = new Set()
      if (graphGist.industries && graphGist.industries.length > 0) {
        for (const industry of graphGist.industries) {
          categories.add(industry.slug)
        }
      }
      if (graphGist.use_cases && graphGist.use_cases.length > 0) {
        for (const useCase of graphGist.use_cases) {
          categories.add(useCase.slug)
        }
      }
      for (const category of categories) {
        let pages
        if (category in pagesPerCategory) {
          pages = pagesPerCategory[category]
        } else {
          pages = []
          pagesPerCategory[category] = pages
        }
        pages.push(page)
      }
    }
  }
  for (const categoryPage of categoryPagesMap.values()) {
    const asciidocAttributes = {
      ...categoryPage.asciidoc.attributes,
      'page-graphgist-pages': pagesPerCategory[categoryPage.src.stem],
    }
    categoryPage.asciidoc.attributes = asciidocAttributes
    pages.push(categoryPage)
  }
}

function createGraphGistCategoryPage(category, asciidocConfig) {
  const asciidocAttributes = {
    ...asciidocConfig.attributes,
    'page-layout': 'graphgist-category',
    'page-category': category.name,
    'page-slug': category.slug,
    'page-breadcrumb': category.name,
  }
  return {
    title: `Category ${category.name}`,
    asciidoc: {
      attributes: asciidocAttributes
    },
    src: {
      component: componentName,
      version: componentVersion,
      module: componentModule,
      family: 'page',
      relative: `categories/${category.slug}.adoc`,
      stem: category.slug,
      mediaType: 'text/asciidoc'
    }
  }
}

// Index page

function addGraphGistIndexPage(graphGists, pages, contentCatalog, asciidocConfig) {
  pages.push(contentCatalog.addFile(createGraphGistIndexPage(graphGists, contentCatalog, asciidocConfig)))
}

function createGraphGistIndexPage(graphGists, contentCatalog, asciidocConfig) {
  const featuredPages = []
  for (const graphGist of graphGists) {
    if (graphGist.featured) {
      const page = getById(contentCatalog, {
        family: 'page',
        relative: `${graphGist.slug}.adoc`
      })
      if (page) {
        featuredPages.push(page)
      }
    }
  }
  const categoryPagesMap = generateCategoryPagesMap(graphGists, contentCatalog)
  const asciidocAttributes = {
    ...asciidocConfig.attributes,
    'page-layout': 'graphgist-index',
    'page-industries': Array.from(categoryPagesMap.values()).filter((value) => value.type === 'industry'),
    'page-use-cases': Array.from(categoryPagesMap.values()).filter((value) => value.type === 'use-case'),
    'page-featured-pages': featuredPages
  }
  return {
    title: `Neo4j GraphGists`,
    asciidoc: {
      attributes: asciidocAttributes
    },
    src: {
      component: componentName,
      version: componentVersion,
      module: componentModule,
      family: 'page',
      relative: `index.adoc`,
      stem: 'index',
      mediaType: 'text/asciidoc'
    }
  }
}

function generateCategoryPagesMap(graphGists, contentCatalog) {
  const categories = getCategories(graphGists)
    .map((category) => {
      const page = getById(contentCatalog, {
        family: 'page',
        relative: `categories/${category.slug}.adoc`
      })
      if (page) {
        category.pub = page.pub
      }
      return category
    })
  const categoryPagesMap = new Map()
  for (const category of categories) {
    categoryPagesMap.set(category.slug, category)
  }
  return categoryPagesMap
}

function getCategories(graphGists) {
  const industries = new Set()
  const useCases = new Set()
  for (const graphGist of graphGists) {
    if (graphGist.industries && graphGist.industries.length > 0) {
      for (const industry of graphGist.industries) {
        industries.add(JSON.stringify(industry))
      }
    }
    if (graphGist.use_cases && graphGist.use_cases.length > 0) {
      for (const useCase of graphGist.use_cases) {
        useCases.add(JSON.stringify(useCase))
      }
    }
  }
  const industryPages = Array.from(industries).map((industry) => {
    const industryObj = JSON.parse(industry)
    industryObj.imageUrl = industryObj.image && industryObj.image.length > 0
      ? industryObj.image[0].source_url
      : undefined
    industryObj.type = 'industry'
    return industryObj
  })
  const useCasePages = Array.from(useCases).map((useCase) => {
    const useCaseObj = JSON.parse(useCase)
    useCaseObj.imageUrl = useCaseObj.image && useCaseObj.image.length > 0
      ? useCaseObj.image[0].source_url
      : undefined
    useCaseObj.type = 'use-case'
    return useCaseObj
  })
  return [...industryPages, ...useCasePages]
}

// GraphGist pages

function addGraphGistPages(graphGists, contentCatalog, asciidocConfig) {
  for (const graphGist of graphGists) {
    contentCatalog.addFile(createGraphGistPage(graphGist, asciidocConfig))
  }
  contentCatalog.registerComponentVersion(componentName, componentVersion)
}

function createGraphGistPage(graphGist, asciidocConfig) {
  return {
    title: graphGist.title,
    path: `${__dirname}/${graphGist.slug}.adoc`,
    contents: Buffer.from(asciidocPreprocessing(graphGist.asciidoc)),
    src: {
      component: componentName,
      version: componentVersion,
      module: componentModule,
      family: 'page',
      relative: `${graphGist.slug}.adoc`,
      stem: graphGist.slug,
      mediaType: 'text/asciidoc'
    }
  }
}

// Assign additional attributes on pages

function assignPageAttributes(graphGists, contentCatalog) {
  for (const graphGist of graphGists) {
    const page = getById(contentCatalog, {
      family: 'page',
      relative: `${graphGist.slug}.adoc`
    })
    if (page) {
      const imageUrl = graphGist.image && graphGist.image.length > 0
        ? graphGist.image[0].source_url
        : 'https://dist.neo4j.com/wp-content/uploads/20160303103313/noun_22440-grey-02.png' // default image
      const notebookAttachment = getById(contentCatalog, {
        family: 'attachment',
        relative: `${graphGist.slug}.ipynb`
      })
      // TODO: generate a browser guide?
      const browserGuideAttachment = undefined
      const asciidocAttributes = {
        ...page.asciidoc.attributes,
        'page-title': graphGist.title,
        'page-layout': 'graphgist',
        'page-illustration': imageUrl,
        'page-uuid': graphGist.uuid,
        'page-slug': graphGist.slug
      }
      if (browserGuideAttachment) {
        asciidocAttributes['page-browserGuideUrl'] = browserGuideAttachment.pub.url
      }
      if (notebookAttachment) {
        asciidocAttributes['page-notebookUrl'] = notebookAttachment.pub.url
      }
      if (graphGist.author) {
        asciidocAttributes['page-author'] = graphGist.author.name
      }
      if (graphGist.summary) {
        asciidocAttributes['page-summary'] = graphGist.summary
      }
      if (graphGist.featured) {
        asciidocAttributes['page-featured'] = true
      }
      page.asciidoc.attributes = asciidocAttributes
      page.asciidoc.doctitle = graphGist.title
    }
  }
}

function getById(contentCatalog, { family, relative }) {
  const page = contentCatalog.getById({
    component: componentName,
    version: componentVersion,
    module: componentModule,
    family,
    relative,
  })
}

module.exports = {
  addGraphGistPages,
  addGraphGistIndexPage,
  addGraphGistCategoryPages,
  generateJupyterNotebookAttachments,
  assignPageAttributes,
}
