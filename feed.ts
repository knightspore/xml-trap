import { z } from "zod";
import { createTree } from "./ast";
import { XMLDocument, XMLNode, XMLNodeSchema } from "./ast/xml";

export enum FeedType {
    RSS = "RSS",
    Atom = "Atom",
    None = "None",
}
export const FeedTypeSchema = z.nativeEnum(FeedType);

export async function loadSource(url: string): Promise<string> {
    const text = await fetch(url).then(r => r.text());
    return text.trim().replaceAll(/(\s*)([\\]n)(\s*)/g, "").trim();
}

export function determineFeedType(root: XMLDocument['root']): FeedType {
    if (root.name === "rss") {
        return FeedType.RSS;
    } else if (root.name === "feed") {
        return FeedType.Atom;
    }
    return FeedType.None;
}

export function getElementValue(node: XMLNode, name: string): string {
    if (node.name === name && node.children && node.children.length === 1) {
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

type FeedItem = z.infer<typeof FeedItemSchema>;
const FeedItemSchema = XMLNodeSchema.transform(node => {
    return {
        title: getElementValue(node, "title"),
        link: getElementValue(node, "link"),
        description: getElementValue(node, "description"),
        content: getElementValue(node, "content"),
        updated: new Date(getElementValue(node, "pubDate")),
    }
})

export function getFeedItems(root: XMLNode): FeedItem[] {
    switch (determineFeedType(root)) {
        case FeedType.RSS:
            return root.children[0].children.filter(c => c.name === "item").map(v => FeedItemSchema.parse(v));
        case FeedType.Atom:
            return root.children.filter(c => c.name === "entry").map(v => FeedItemSchema.parse(v));
        default:
            return [];
    }
}

type Feed = z.infer<typeof FeedSchema>;
const FeedSchema = z.string().transform(async href => {
    const url = new URL(href);
    const source = await loadSource(url.href);
    const tree = createTree(source);
    return {
        url,
        type: determineFeedType(tree.root),
        title: getElementValue(tree.root, "title") ?? url.host,
        description: getElementValue(tree.root, "description"),
        updated: new Date(getElementValue(tree.root, "lastBuildDate") || Date.now()),
        language: getElementValue(tree.root, "language"),
        items: getFeedItems(tree.root),
        tree,
        source,
    }
})

export async function newFeed(url: string): Promise<Feed> {
    return FeedSchema.parseAsync(url)
}
