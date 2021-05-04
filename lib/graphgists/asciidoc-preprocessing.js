'use strict'


const RolesDoubleQuotesRx = /,role="([^"]+)"/i
const RolesRx = /,role=([^,\]]+)([,|\]])/i

function addRolesInBlockDefinition(line, roles) {
  if (line.match(RolesDoubleQuotesRx)) {
    return line.replace(RolesDoubleQuotesRx, function (match, roleList) {
      const currentRoles = roleList.split(' ')
      for (const role of roles) {
        if (!currentRoles.includes(role)) {
          currentRoles.push(role)
        }
      }
      return `,role="${currentRoles.join(' ')}"`
    })
  }
  if (line.match(RolesRx)) {
    return line.replace(RolesRx, function (match, roleList, termination) {
      const currentRoles = roleList.split(' ')
      for (const role of roles) {
        if (!currentRoles.includes(role)) {
          currentRoles.push(role)
        }
      }
      return `,role=${currentRoles.join(' ')}${termination}`
    })
  }
  return line.replace(']', `,role=${roles.join(' ')}]`)
}

function preprocessing(asciidoc) {
  // preprocessing
  let lines = asciidoc.split('\n')
  let currentSourceBlockDefinition = {}
  let currentRoles = []
  const updateMap = {}
  lines
    .map((line, index) => {
      if (line.startsWith('[source,cypher') && line.trim().endsWith(']')) {
        const blockDefintionWithRoles = addRolesInBlockDefinition(line, ['runnable', 'backend:graphgist', ...currentRoles])
        currentRoles = []
        currentSourceBlockDefinition = {
          line: blockDefintionWithRoles,
          index
        }
        return blockDefintionWithRoles
      }
      if (line.startsWith('//')) {
        if (line.includes('hide')) {
          // next source block should have hidden role
          currentRoles.push('hidden')
        } else if (line.includes('setup')) {
          // next source block should have instant role
          currentRoles.push('instant')
          currentRoles.push('single')
        } else if (line.includes('graph_result') && currentSourceBlockDefinition && currentSourceBlockDefinition.index) {
          // *previous* source block should have graph role
          updateMap[currentSourceBlockDefinition.index] = addRolesInBlockDefinition(currentSourceBlockDefinition.line, ['graph'])
        }
      }
      return line
    })
    // NOTE: for performance, we might want to use a single for/of loop
    .map((line, index) => {
      if (updateMap[index]) {
        return updateMap[index]
      }
      return line
    }) = lines
  return lines.join('\n')
}

module.exports = {
  preprocessing
}
