import { z } from "zod";
import { createTree } from "./ast";
import { XMLDocument, XMLDocumentSchema, XMLNode } from "./ast/xml";

export enum FeedType {
    RSS = "RSS",
    Atom = "Atom",
    None = "None",
}
export const FeedTypeSchema = z.nativeEnum(FeedType);

export function determineFeedType(root: XMLDocument['root']): FeedType {
    if (root.name === "rss") {
        return FeedType.RSS;
    } else if (root.name === "feed") {
        return FeedType.Atom;
    }
    return FeedType.None;
}

export function getElementValue(node: XMLNode, name: string): string {
    if (node.name === name) {
        return node.children[0].value;
    } else if (node.children) {
        for (const child of node.children) {
            const value = getElementValue(child, name);
            if (value) {
                return value;
            }
        }
    }
    return "";
}

export function getLastUpdated(node: XMLNode): Date {
    const updated = getElementValue(node, "lastBuildDate") || getElementValue(node, "updated") || new Date();
    return new Date(updated);
}

type Feed = z.infer<typeof Feed>;
const Feed = z.object({
    source: z.string(),
    tree: XMLDocumentSchema,
}).transform(input => {
    return {
        type: FeedTypeSchema.parse(determineFeedType(input.tree.root)),
        title: getElementValue(input.tree.root, "title"),
        description: getElementValue(input.tree.root, "description"),
        language: getElementValue(input.tree.root, "language"),
        updated: getLastUpdated(input.tree.root),
        ...input,
    }
})

export async function newFeed(url: string): Promise<Feed> {
    const text = await fetch(url).then(r => r.text());
    return Feed.parse({
        source: url,
        tree: createTree(text),
    })
}
