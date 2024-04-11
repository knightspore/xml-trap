import { describe, expect, it } from "bun:test";
import { FeedType, newFeed } from ".";

describe("feed (rss/atom)", async () => {

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
        expect(rss.items).toBeDefined();
        expect(rss.items.length).toBeGreaterThan(0);

        expect(atom.title).toEqual("Tim&#39;s website");
        expect(atom.description).toEqual("");
        expect(atom.language).toEqual("");
        expect(atom.updated).toBeValidDate();
        expect(atom.items).toBeDefined();
        expect(atom.items.length).toBeGreaterThan(0);
    })

})

export const URLS = [
    "http://techcrunch.com/feed/",
    "https://www.wired.com/feed/category/backchannel/latest/rss",
    "https://feeds.arstechnica.com/arstechnica/technology-lab",
    "https://www.404media.co/rss/",
    "https://overreacted.io/rss.xml",
    "https://news.ycombinator.com/rss",
]

describe("feed regression", async () => {
    let feeds = [];
    for (const href of URLS) {
        const url = new URL(href);
        const feed = await newFeed(url.href);
        feeds.push(feed);
    }
    feeds.forEach(feed => {
        describe(feed.url.host, async () => {
            it("loads tree from URL", () => {
                expect(feed.tree).toBeDefined();
            });
            it("determines feed type", () => {
                expect("RSS,Atom").toContain(feed.type);
            });
            it("has basic properties", () => {
                expect(feed.title.length).toBeGreaterThan(0);
                expect(feed.description).toBeDefined();
                expect(feed.language).toBeDefined();
                expect(feed.updated).toBeValidDate();
                expect(feed.items).toBeDefined();
                expect(feed.items.length).toBeGreaterThan(0);
            })
            it("has valid items", () => {
                for (const item of feed.items) {
                    expect(item.title.length).toBeGreaterThan(0);
                    expect(item.link.length).toBeGreaterThan(0);
                    expect(item.updated).toBeValidDate();
                }
            })
        })
    })
})
