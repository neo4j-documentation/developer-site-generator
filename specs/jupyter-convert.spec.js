const path = require('path')
const fs = require('fs').promises
const { convert } = require('../lib/graphgists/jupyter-converter')
const chai = require('chai')
const expect = chai.expect

describe('Jupyter converter', () => {
  it('should convert an AsciiDoc to a Jupyter Notebook', async () => {
    const input = await fs.readFile(path.join(__dirname, '..', 'specs', 'fixtures', 'exploring-star-wars.adoc'), 'utf8')
    const jupyterNotebook = convert(input)
    const ipynb = JSON.parse(jupyterNotebook)
    const codeCells = ipynb.cells.filter((cell) => cell.cell_type === 'code')
    // install/setup instructions
    expect(codeCells[0].source[0]).is.equal('pip install icypher')
    expect(codeCells[1].source[0]).is.equal('%load_ext icypher')
    expect(codeCells[2].source[0]).is.equal('%cypher http://user:passwd@localhost:7474/db/data')
    // source blocks are prefixed by %%cypher
    expect(codeCells[3].source[0]).is.equal('%%cypher\n')
    expect(codeCells[4].source[0]).is.equal('%%cypher\n')
    expect(codeCells[5].source[0]).is.equal('%%cypher\n')
    expect(codeCells[6].source[0]).is.equal('%%cypher\n')
    expect(codeCells[7].source[0]).is.equal('%%cypher\n')
    expect(codeCells[8].source[0]).is.equal('%%cypher\n')
    expect(codeCells[9].source[0]).is.equal('%%cypher\n')
    expect(codeCells[10].source[0]).is.equal('%%cypher\n')
  })
})
