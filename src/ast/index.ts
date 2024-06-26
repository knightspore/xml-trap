import { NodeType, XMLDocument, XMLDocumentSchema, XMLNode, XMLNodeSchema, createXMLNode, createXMLNodesFromTokens } from "./xml";
import { createTokensFromString } from "./tokenizer";

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

function newTree(nodes: XMLNode[]): [XMLDocument, XMLNode[]] {
    const first = nodes.shift()!;
    if (first.type !== NodeType.Declaration) {
        return [XMLDocumentSchema.parse({
            root: { 
                ...first,
                children: createChildren(nodes),
            },
        }), nodes];
    }

    const tree: XMLDocument = {
        declaration: first,
        root: {
            ...nodes.shift()!,
            children: createChildren(nodes),
        },
    }

    return [XMLDocumentSchema.parse(tree), nodes]
}

export function createTree(xml: string): XMLDocument {
    const tokens = createTokensFromString(xml);
    let nodes = createXMLNodesFromTokens(tokens);
    let tree: any = {};
    [tree, nodes] = newTree(nodes);
    return XMLDocumentSchema.parse(tree);
}
