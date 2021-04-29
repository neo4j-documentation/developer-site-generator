/*
 * A tree processor that adds instructions about icypher (just before the first cypher source block)
 */
const addICypherInstructionTreeProcessor = function (context) {
  return function () {
    const self = this
    self.process(function (doc) {
      const cypherSourceBlocks = doc.findBy({ context: 'listing' }, function (sourceBlock) {
        return sourceBlock.getAttribute('language') === 'cypher'
      })
      if (cypherSourceBlocks && cypherSourceBlocks.length > 0) {
        const firstSourceBlocks = cypherSourceBlocks[0]
        const parent = firstSourceBlocks.getParent()
        const indexOf = parent.getBlocks().indexOf(firstSourceBlocks)
        // install icypher
        const installICypherParagraph = self.createBlock(parent, 'paragraph', 'In order to execute Cypher queries, make sure that the IPython extension `icypher` is installed.\nIf not, run the following command to install it:')
        const installICyperListing = self.createBlock(parent, 'listing', 'pip install icypher')
        // load icypher
        const loadICypherParagraph = self.createBlock(parent, 'paragraph', 'Then, load the `icypher` extension:')
        const loadICyperListing = self.createBlock(parent, 'listing', '%load_ext icypher')
        // connect to database
        const connectDatabaseParagraph = self.createBlock(parent, 'paragraph', 'Now you\'re ready to connect to your Neo4j database:')
        const connectDatabaseListing = self.createBlock(parent, 'listing', '%cypher http://user:passwd@localhost:7474/db/data')
        parent.getBlocks().splice(indexOf, 0,
          installICypherParagraph, installICyperListing,
          loadICypherParagraph, loadICyperListing,
          connectDatabaseParagraph, connectDatabaseListing
        )
      }
      for (const cypherSourceBlock of cypherSourceBlocks) {
        cypherSourceBlock.lines.unshift('%%cypher')
      }
      return doc
    })
  }
}

module.exports.register = function register (registry, context = {}) {
  if (typeof registry.register === 'function') {
    registry.register(function () {
      this.treeProcessor(addICypherInstructionTreeProcessor(context))
    })
  } else if (typeof registry.treeProcessor === 'function') {
    registry.treeProcessor(addICypherInstructionTreeProcessor(context))
  }
  return registry
}
