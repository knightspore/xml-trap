import { describe, expect, it } from "bun:test";
import { FeedType, newFeed } from "../feed";

describe("feed", async () => {

    const rss = await newFeed("https://ciaran.co.za/rss.xml");
    const atom = await newFeed("https://timdaub.github.io/atom.xml");

    it("loads tree from URL", () => {
        expect(rss.tree).toBeDefined();
        expect(atom.tree).toBeDefined();
    })

    it("determines feed type", () => {
        expect(rss.type).toEqual(FeedType.RSS);
        expect(atom.type).toEqual(FeedType.Atom);
    })

    it("has basic properties", () => {
        expect(rss.title).toEqual("Ciaran's Thinking and Learning Blog");
        expect(rss.description).toEqual("A place for me to sporadically document.");
        expect(rss.language).toEqual("en");
        expect(rss.updated).toBeValidDate();

        expect(atom.title).toEqual("Tim&#39;s website");
        expect(atom.description).toEqual("");
        expect(atom.language).toEqual("");
        expect(atom.updated).toBeValidDate();
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

describe("feed regression", async () => {
    for (const url of URLS) {
        const feed = await newFeed(url);
        it(`'${url}' ok`, async () => {
            expect(feed.tree).toBeDefined();
            expect("RSS,Atom,None").toContain(feed.type);
            expect(feed.title).toBeDefined();
            expect(feed.description).toBeDefined();
            expect(feed.language).toBeDefined();
            expect(feed.updated).toBeValidDate();
        })
    }
})
