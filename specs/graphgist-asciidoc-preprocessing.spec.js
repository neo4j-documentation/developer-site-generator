const util = require('util')
const fs = require('fs').promises
const { preprocessing } = require('../lib/graphgists/asciidoc-preprocessing')
const chai = require('chai')
const expect = chai.expect

describe('GraphGist preprocessing', () => {
  it('should add runnable role on a simple Cypher source block', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,role=runnable backend:graphgist]
----
query
----
`)
  })

  it('should add runnable role on multiple Cypher source blocks', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher]
----
query1
----


[source,cypher]
----
query2
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,role=runnable backend:graphgist]
----
query1
----


[source,cypher,role=runnable backend:graphgist]
----
query2
----
`)
  })
  it('should append runnable role on Cypher source blocks', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher,role=foo]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,role=foo runnable backend:graphgist]
----
query
----
`)
  })
  it('should preserve other attributes (before) when appending runnable role', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher,subs=attributes,role=foo]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,subs=attributes,role=foo runnable backend:graphgist]
----
query
----
`)
  })
  it('should preserve other attributes (before and after) when appending runnable role', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher,subs=attributes,role=foo,attr=value]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,subs=attributes,role=foo runnable backend:graphgist,attr=value]
----
query
----
`)
  })
  it('should add runnable role on Cypher source blocks when roles attribute is defined using double quotes', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher,role="foo bar"]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,role="foo bar runnable backend:graphgist"]
----
query
----
`)
  })
  it('should add graph role on Cypher source block when // graph is present', async () => {
    const result = preprocessing(`= Title

== Section

[source,cypher,role="foo bar"]
----
query
----

// graph_result
`)
    expect(result).to.equal(`= Title

== Section

[source,cypher,role="foo bar runnable backend:graphgist graph"]
----
query
----

// graph_result
`)
  })
  it('should add instant and hidden roles on Cypher source block when // setup and // hide are present', async () => {
    const result = preprocessing(`= Title

== Section

//setup
// hide
[source,cypher,role="foo bar"]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

//setup
// hide
[source,cypher,role="foo bar runnable backend:graphgist instant single hidden"]
----
query
----
`)
  })
  it('should add single role on Cypher source block when // setup is present', async () => {
    const result = preprocessing(`= Title

== Section

//setup
[source,cypher,role="foo bar"]
----
query
----
`)
    expect(result).to.equal(`= Title

== Section

//setup
[source,cypher,role="foo bar runnable backend:graphgist instant single"]
----
query
----
`)
  })
})
