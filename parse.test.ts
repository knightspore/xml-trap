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

    it("nests <children> correctly", () => {
        const author = children[3];
        expect(author.name).toEqual("author");

        const authorChildren = author.children;
        expect(authorChildren).toBeGreaterThan(0);

        const entry = children[5];
        expect(entry.name).toEqual("entry");

        const entryChildren = entry.children;
        expect(entryChildren).toBeGreaterThan(0);
        expect(entryChildren.length).toBe(5);


    })
})
