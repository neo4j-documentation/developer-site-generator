const { generateKnowledgeBasePageDescription } = require('../lib/knowledge-base')
const chai = require('chai')
const expect = chai.expect

describe('Generate KB page-description', () => {
  it('should not generate a page-description when already defined', () => {
    const input = `<div class="paragraph">
<p><strong>Background</strong></p>
</div>
<div class="paragraph">
<p>From the beginning, the execution guard was never meant to be used by the general public. However, the feature was there in the product, though undocumented, and it did work for the purpose of preventing long running queries from utilizing significant resources and causing other downstream effects.
So it was blogged about, and utilized by users looking for that functionality.</p>
</div>
<div class="paragraph">
<p><strong>Explanation</strong></p>
</div>`
    const page = {
      contents: Buffer.from(input),
      src: {
        component: 'kb',
        basename: 'will-execution-guard-enabled-work-in-my-release-of-neo4j.adoc'
      },
      asciidoc: {
        attributes: {
          'page-description': 'Will execution_guard_enabled work in my release of Neo4j? Let\'s find out!'
        }
      }
    }
    generateKnowledgeBasePageDescription([page])
    expect(page.asciidoc.attributes['page-description']).to.equal('Will execution_guard_enabled work in my release of Neo4j? Let\'s find out!')
  })
  it('should ignore listing block', () => {
    const input = `<div class="paragraph">
<p>The following will demonstrate how to use <a href="https://neo4j.com/docs/operations-manual/current/tools/cypher-shell/">cypher-shell</a> to get
a better understanding of a Neo4j Causal Cluster instance and its implementation of
<a href="https://neo4j.com/docs/developer-manual/current/drivers/client-applications/#_routing_drivers_bolt_routing">routing</a>.</p>
</div>
<div class="listingblock noheader">
<div class="content">
<pre class="highlightjs highlight"><code class="language-shell hljs" data-lang="shell">$ ./cypher-shell -a bolt://192.168.0.97:7617
Connected to Neo4j 3.2.2 at bolt://192.168.0.97:7617.
Type :help for a list of available commands or :exit to exit the shell.
Note that Cypher queries must end with a semicolon.</code></pre>
</div>
</div>
<div class="listingblock noheader">
<div class="content">
<pre class="highlightjs highlight"><code class="language-cypher-shell hljs" data-lang="cypher-shell">neo4j&gt; call dbms.cluster.overview() yield addresses, role;
+-----------------------------------------------------------------------------------------------+
| addresses                                                                    | role           |
+-----------------------------------------------------------------------------------------------+
| ["bolt://localhost:7617", "http://localhost:7414", "https://localhost:7413"] | "LEADER"       |
| ["bolt://localhost:7627", "http://localhost:7424", "https://localhost:7423"] | "FOLLOWER"     |
| ["bolt://localhost:7637", "http://localhost:7434", "https://localhost:7433"] | "FOLLOWER"     |
+-----------------------------------------------------------------------------------------------+</code></pre>
</div>
</div>
<div class="paragraph">
<p>The initial scenario is described with <a href="https://neo4j.com/docs/operations-manual/current/tutorial/local-causal-cluster/">local cluster</a> setup with 3 core instances, 1 LEADER and 2 FOLLOWERS.   Using dbms.cluster.overview() the output reports</p>
</div>
<div class="paragraph">
<p>The above detail is also available through the browser by running <code>:sysinfo</code></p>
</div>`
    const page = {
      contents: Buffer.from(input),
      src: {
        component: 'kb',
        basename: 'causal-cluster.adoc'
      },
      asciidoc: {
        attributes: {}
      }
    }
    generateKnowledgeBasePageDescription([page])
    expect(page.asciidoc.attributes['page-description']).to.equal('The following will demonstrate how to use cypher-shell to get a better understanding of a Neo4j Causal Cluster instance and its implementation of routing. The initial scenario is described with…')
  })
})
