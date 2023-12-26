import { describe, expect, it } from "bun:test"
import { XMLSample } from "./constants"
import { parse } from "./parse";

describe("parse", async () => {

    const sample = await XMLSample();
    const result = parse(sample);

    it("loads file", () => {
        expect(result).toBeDefined();
    })

    it("parses declaration element", () => {
        expect(result.declaration.name).toEqual("xml")
    })

    it("parses root element", () => {
        expect(result.root?.name).toEqual("feed")
    })

    const children = result.root.children;

    it("root element has children", () => {
        expect(children.length).toBeGreaterThan(0);
    })

    it("has title element with children", () => {
        const title = children[0];
        expect(title.name).toEqual("title");
        expect(title.children.length).toBeGreaterThan(0);
        expect(title.children[0].value).toEqual("Example Feed");
    })

    it("parses nested elements correctly", () => {
        const author = children[3];
        expect(author.name).toEqual("author");

        const authorChildren = author.children;
        expect(authorChildren.length).toBeGreaterThan(0);
        expect(authorChildren[0].children[0].value).toEqual("John Doe")
    })

    it.todo("parses multiple nested elements correctly", () => {
        const entry = children[5];
        expect(entry.name).toEqual("entry");

        const entryChildren = entry.children;
    
        expect(entryChildren[0].children[0].value).toEqual("Atom-Powered Robots Run Amok");
        expect(entryChildren[0].attributes?.href).toEqual("http://example.org/2003/12/13/atom03")

        expect(entryChildren.length).toBe(5);
    })
})
