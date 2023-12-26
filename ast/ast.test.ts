import { describe, expect, it } from "bun:test"
import { createTree } from ".";
import path from "path";

export const XMLSample = async (): Promise<string> => {
    return await Bun.file(path.join(import.meta.dir + "/../test/samples/sample.xml")).text()
}

export const RSSSample = async (): Promise<string> => {
    return await Bun.file(path.join(import.meta.dir + "/../test/samples/rss.xml")).text()
}

describe("createTree (simple sample)", async () => {

    const simpleSample = await XMLSample();
    const tree = createTree(simpleSample);

    it("initalizes with text from file", () => {
        expect(tree).toBeDefined();
    })

    it("parses declaration element", () => {
        expect(tree.declaration.name).toEqual("?xml")
    })

    it("parses root element", () => {
        expect(tree.root.name).toEqual("feed")
    })

    const children = tree.root.children;

    it("parses root element children", () => {
        expect(children.length).toBeGreaterThan(0);
    })

    it("has title element with children", () => {
        const title = children[0];
        expect(title.name).toEqual("title");
        expect(title.children.length).toBeGreaterThan(0);
        expect(title.children[0].value).toEqual("Example Feed");
    })

    it("parses nested elements", () => {
        const author = children[3];
        expect(author.name).toEqual("author");

        const authorChildren = author.children;
        expect(authorChildren.length).toBeGreaterThan(0);
        expect(authorChildren[0].children[0].value).toEqual("John Doe")
    })


    it("parses multiple nested elements", () => {
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

describe("createTree (complex sample)", async () => {
    const rssSample = await RSSSample();
    const tree = createTree(rssSample);

    it("initalizes with text from file", () => {
        expect(tree).toBeDefined();
    })

    it("parses declaration element", () => {
        expect(tree.declaration.name).toEqual("?xml")
    })

    it("parses root element", () => {
        expect(tree.root.name).toEqual("rss")
    })

    const children = tree.root.children;

    it("parses root element children", () => {
        expect(children.length).toBeGreaterThan(0);
    })

    const channel = children[0];

    it("parses channel element", () => {
        expect(channel.name).toEqual("channel");
    })

    const channelChildren = channel.children;

    it("parses channel element children", () => {
        expect(channelChildren.length).toBeGreaterThan(0);
    })

    it("parses nested elements", () => {
        const title = channelChildren[0];
        expect(title.name).toEqual("title");
        expect(title.children.length).toEqual(1);
        expect(title.children[0].value).toEqual("Ciaran's Thinking and Learning Blog");
    })

    it("parses items", () => {
        expect(channel.children.filter(c => c.name === "item").length).toEqual(4);
    })
})

export const URLS = [
    "http://techcrunch.com/feed/",
    "https://www.wired.com/feed/category/backchannel/latest/rss",
    "https://feeds.arstechnica.com/arstechnica/technology-lab",
    "https://www.protocol.com/feeds/feed.rss",
    "https://overreacted.io/rss.xml",
    "https://news.ycombinator.com/rss",
]

describe("createTree (major examples)", async () => {


    for (const url of URLS) {
        const sample = await fetch(url).then(r => r.text());
        it(`parses feed from '${url}'`, async () => {
            const result = createTree(sample);
            expect(result).toBeDefined();
        })
    }
})
