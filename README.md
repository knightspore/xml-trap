# XML T.R.A.P. - a Typescript RSS/Atom Feed Parser written in Bun

This is a simple RSS/Atom feed parser written in Typescript, using Bun. It can parse feeds and create an AST of the feed in JSON.

```bash
npm install xml-trap 
```

## Setup

<!-- TODO -->

## Usage

<!-- TODO -->

### Feeds

To parse an RSS Feed, use the `newFeed` function.

```typescript
import { newFeed } from "xml-trap";

const feed = newFeed("https://example.com/feed.xml");
console.log(feed.title) // The title of the feed
```

The `Feed` type has a number of fields that can be accessed:

| Field | Description |
| --- | --- |
| `url` | The URL of the feed |
| `title` | The title of the feed |
| `description` | The description of the feed |
| `language` | The language of the feed |
| `update` | The last build date of the feed (or the updated date) |
| `items` | An array of items in the feed |
| `tree` | An AST of the feed in JSON |
| `source` | A minified copy of the source XML |

### AST

To create a tree-representation of the feed, use the `createTree` function.

```typescript
import { createTree } from "xml-trap";

const tree = createTree("https://example.com/feed.xml");
console.log(tree.root) // The root of the tree
```

The `Tree` type has two main fields: `declaration` (the XML declaration node), and `root` (the root node of the tree). All children are, of course, on the root node.

The `XMLNode` type represents nodes on the tree, with fields:

| Field | Description |
| --- | --- |
| `name` | The name of the node eg. `div`, or the node text |
| `type` | The type of the node (eg. Declaration, Opening, Self-closing, etc.) |
| `attributes` | An object of attributes on the node |
| `value` | The value of the node (eg. the text of a text node) |
| `children` | An array of children of the node |

This tree is used to construct feeds, and of course can be re-used as you wish for handling other XML documents.

## Tests

Both the AST and Feed Parser are well-covered with unit tests, and more end-to-end-ish tests (reading live feeds). To run the tests:

```bash
bun test # run the test suite
bun run test/bench.ts # run the benchmarks
```

## Contributing

This project is open to contributions. As you see above, the project is well-covered with tests. If you want to contribute, it would probably be best to either add a URL to the feed tests, or in the case of the AST modules, adding a new XML document and referencing the benchmarks would be a good place to start.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/knightspore/xml-trap/blob/main/LICENSE.md) file for more information.

## Shoutouts
- [Bun](https://github.com/oven-sh/bun) for great JS tooling. 
- [Tsoding for this video about writing a C compiler in PHP](https://www.youtube.com/watch?v=Yi6NxMxCFY8&pp=ygUOYyBjb21waWxlciBwaHA%3D) which was my original inspiration to explore parsing. 
- [Matthew Groff's notes](https://groff.dev/blog/function-agents) on publishing an NPM package built with Bun.

