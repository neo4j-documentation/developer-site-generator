function attachNavigationSlug (contentCatalog, navigationCatalog) {
  contentCatalog.getComponents()
    .filter((component) => {
      return component.latest &&
        component.latest.asciidoc &&
        component.latest.asciidoc.attributes &&
        component.latest.asciidoc.attributes['page-component'] === 'training'
    }).forEach((component) => {
    const componentNavigation = navigationCatalog.getNavigation(component.name, component.latest.version)
    if (componentNavigation && componentNavigation.length > 0) {
      componentNavigation[0].items.forEach((item) => {
        if (item.urlType === 'internal') {
          const pages = contentCatalog.getPages((page) => page.pub && page.pub.url === item.url)
          if (pages && pages.length > 0) {
            const page = pages[0]
            if (page.asciidoc && page.asciidoc.attributes && page.asciidoc.attributes['page-quiz'] === '') {
              item['asciidoc'] = {
                attributes: {
                  'page-slug': page.asciidoc.attributes['page-slug']
                }
              }
            }
          }
        }
      })
    }
  })
}

module.exports = {
  attachNavigationSlug: attachNavigationSlug
}
