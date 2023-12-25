import { z } from "zod";
import { XMLDocumentSchema, XMLNode, XMLNodeSchema } from "./types";
import { isClosingTag, isClosingXMLTag, isOpeningTag, isOpeningXMLTag, isSelfClosingXMLTag, match } from "./match"
import { tokenizer } from "./tokenizer";

export function getAttributes(value: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrMatcher = /([^\s]+)="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = attrMatcher.exec(value)) != null) {
        const [_, key, val] = match;
        attributes[key] = val;
    }
    return attributes;
}

export enum NodeType {
    Declaration = "declaration",
    ElementOpenTag = "elementOpenTag",
    ElementCloseTag = "elementCloseTag",
    ElementSelfClosingTag = "elementSelfClosingTag",
    Text = "text",
}

function getNameOrText(value: string): string {
    const nameMatcher = /<([^\s>]+)/g;
    let returnValue = null;;
    const match = nameMatcher.exec(value)
    try {
        returnValue = match![1].replace("?", "").replace("/", "");
    } catch (e: any) {
        returnValue = value;
    }
    return returnValue;
}

function getType(value: string): NodeType {
    switch (true) {
        case value.startsWith("<?xml"):
            return NodeType.Declaration
        default:
            if (isOpeningTag(value[0]) || isClosingTag(value[value.length - 1])) {
                switch (true) {
                    case isSelfClosingXMLTag(value):
                        return NodeType.ElementSelfClosingTag;
                    case isOpeningXMLTag(value):
                        return NodeType.ElementOpenTag;
                    case isClosingXMLTag(value):
                        return NodeType.ElementCloseTag;
                    default:
                        throw new Error("Unknown node type")
                }
            } else {
                return NodeType.Text
            }
    }
}

export function createXMLNode(value: string): XMLNode {
    value = value.trim();
    const nameOrValue = getNameOrText(value);
    const type = getType(value);
    const attributes = getAttributes(value);
    return XMLNodeSchema.parse({
        name: nameOrValue === value ? "child" : nameOrValue,
        type,
        value,
        attributes,
        children: [],
    })
}


function parseDeclaration(tokens: string[]): [XMLNode, string[]] {
    const declarationToken: string = tokens.shift()!;
    const { name, type } = createXMLNode(declarationToken);
    const declaration: XMLNode = {
        name,
        type,
        value: declarationToken,
        attributes: getAttributes(declarationToken),
        children: [],
    }
    return [declaration, tokens];
}

function parseRoot(tokens: string[]): [XMLNode, string[]] {
    const rootToken: string = tokens.shift()!;
    const { name, type } = createXMLNode(rootToken);
    const root: XMLNode = {
        name,
        type,
        value: rootToken,
        attributes: getAttributes(rootToken),
        children: [],
    }
    return [root, tokens];
}

function parseChildren(root: XMLNode, tokens: string[]): XMLNode {

    // TODO: Redo with all created as Nodes

    const startIdx = 0;

    if (tokens[startIdx]) {
        let node = createXMLNode(tokens[startIdx]!);

        let remainingTokens: string[] = [];

        if (node.type === NodeType.ElementOpenTag) {
            let endIdx = tokens.findIndex(isClosingXMLTag);
            const children = tokens.slice(startIdx + 1, endIdx);
            root.children.push({
                ...node,
                children: children.map(createXMLNode),
            });
            remainingTokens = tokens.slice(endIdx + 1);
        } else if (node.type === NodeType.ElementCloseTag) {
            remainingTokens = tokens.slice(1);
        } else if (node.type === NodeType.ElementSelfClosingTag) {
            root.children.push(node);
            remainingTokens = tokens.slice(1);
        } else if (node.type === NodeType.Text) {
            root.children.push(node);
            remainingTokens = tokens.slice(1);
        }

        if (remainingTokens.length > 0) {
            return parseChildren(root, remainingTokens);
        }
    }

    return root;
}


export function parse(xml: string): z.infer<typeof XMLDocumentSchema> {
    let tokens = tokenizer(xml);

    const tree: Record<string, any> = {
        declaration: null,
        root: null,
    };

    [tree.declaration, tokens] = parseDeclaration(tokens);
    [tree.root, tokens] = parseRoot(tokens);

    if (tokens.length > 0) {
        tree.root = parseChildren(tree.root, tokens);
    }

    console.log(tree)

    return XMLDocumentSchema.parse(tree);
}
