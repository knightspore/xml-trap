import { describe, expect, it } from "bun:test"
import { createTree } from ".";
import path from "path";

const XMLSample = async (): Promise<string> => {
    return await Bun.file(path.join(import.meta.dir + "/../../test/samples/sample.xml")).text()
}

const RSSSample = async (): Promise<string> => {
    return await Bun.file(path.join(import.meta.dir + "/../../test/samples/rss.xml")).text()
}

describe("createTree() mock", async () => {

    const simpleSample = await XMLSample();
    const tree = createTree(simpleSample);

    it("parses", () => {
        expect(tree).toBeDefined();
    })

    it("declaration element", () => {
        expect(tree.declaration?.name).toEqual("?xml")
    })

    it("root element", () => {
        expect(tree.root.name).toEqual("feed")
    })

    const children = tree.root.children;

    it("top-level children", () => {
        expect(children.length).toBeGreaterThan(0);
    })

    it("title", () => {
        const title = children[0];
        expect(title.name).toEqual("title");
        expect(title.children.length).toBeGreaterThan(0);
        expect(title.children[0].value).toEqual("Example Feed");
    })

    it("simple nesting", () => {
        const author = children[3];
        expect(author.name).toEqual("author");

        const authorChildren = author.children;
        expect(authorChildren.length).toBeGreaterThan(0);
        expect(authorChildren[0].children[0].value).toEqual("John Doe")
    })


    it("complex nesting", () => {
        const entry = children[5];
        expect(entry.name).toEqual("entry");
        expect(entry.children.length).toEqual(5);

        const [title, link, id, updated, summary] = entry.children;

        expect(title.children[0].value).toEqual("Atom-Powered Robots Run Amok");
        expect(link.attributes?.href).toEqual("http://example.org/2003/12/13/atom03")
        expect(id.children.length).toEqual(1);
        expect(updated.children[0].value).toEqual("2003-12-13T18:30:02Z")
        expect(summary.children[0].value).toEqual("Some text.")
    })
})

describe("createTree() ciaran.co.za", async () => {
    const rssSample = await RSSSample();
    const tree = createTree(rssSample);

    it("initializes", () => {
        expect(tree).toBeDefined();
    })

    it("declaration element", () => {
        expect(tree.declaration?.name).toEqual("?xml")
    })

    it("root element", () => {
        expect(tree.root.name).toEqual("rss")
    })

    const children = tree.root.children;

    it("top-level children", () => {
        expect(children.length).toBeGreaterThan(0);
    })

    const channel = children[0];

    it("channel element", () => {
        expect(channel.name).toEqual("channel");
    })

    const channelChildren = channel.children;

    it("channel children", () => {
        expect(channelChildren.length).toBeGreaterThan(0);
    })

    it("nested items", () => {
        const title = channelChildren[0];
        expect(title.name).toEqual("title");
        expect(title.children.length).toEqual(1);
        expect(title.children[0].value).toEqual("Ciaran's Thinking and Learning Blog");
    })

    it("feed items", () => {
        expect(channel.children.filter(c => c.name === "item").length).toEqual(4);
    })
})

const URLS = [
    "http://techcrunch.com/feed/",
    "https://www.wired.com/feed/category/backchannel/latest/rss",
    "https://feeds.arstechnica.com/arstechnica/technology-lab",
    "https://www.404media.co/rss/",
    "https://overreacted.io/rss.xml",
    "https://news.ycombinator.com/rss",
]

describe("createTree()", async () => {
    for (const href of URLS) {
        const url = new URL(href);
        const sample = await fetch(url.href).then(r => r.text());
        it(url.host, async () => {
            const result = createTree(sample);
            expect(result).toBeDefined();
        })
    }
})
