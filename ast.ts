import { z } from "zod";
import { NodeType, XMLDocument, XMLDocumentSchema, XMLNode, XMLNodeSchema, createXMLNode, createXMLNodesFromTokens } from "./xml";
import { createTokensFromString } from "./tokenizer";
import chalk from "chalk";

function findOpenTag(nodes: XMLNode[]) {
    const start = nodes.findIndex(n => n.type === NodeType.ElementOpenTag || n.type === NodeType.ElementSelfClosingTag);
    const node = nodes[start];
    return {
        start,
        node
    }
}

function findCloseTag(nodes: XMLNode[]) {
    return nodes.findIndex(n => n.type === NodeType.ElementCloseTag && n.name === nodes[0].name);
}

function parseStatement(nodes: XMLNode[]) {
    let { start, node } = findOpenTag(nodes);
    if (!node) {
        return {
            node: null,
            rest: [],
        }
    } else if (node.type === NodeType.ElementSelfClosingTag) {
        return {
            node: node,
            rest: nodes.slice(start + 1),
        }
    }

    let end = findCloseTag(nodes);
    if (end === -1) {
        return {
            node: null,
            rest: [],
        }
    }

    node.children = nodes.slice(start + 1, end);
    nodes = nodes.slice(end + 1);

    return {
        node: node,
        rest: nodes,
    }
}

function createChildren(nodes: XMLNode[]): XMLNode[] {
    let children: XMLNode[] = [];
    let result = parseStatement(nodes);
    while (result.node) {
        if (result.node.children.length > 1) {
            result.node.children = createChildren(result.node.children);
        }
        children.push(result.node);
        nodes = result.rest;
        result = parseStatement(nodes);
    }
    return XMLNodeSchema.array().parse(children);
}

export function createTree(xml: string, debug: boolean = Bun.argv.join(" ").includes("--debug")): XMLDocument {
    const tokens = createTokensFromString(xml);
    const nodes = createXMLNodesFromTokens(tokens);
    const tree: XMLDocument = {
        declaration: nodes.shift()!,
        root: {
            ...nodes.shift()!,
            children: createChildren(nodes)
        }
    }
    return XMLDocumentSchema.parse(tree);
}
