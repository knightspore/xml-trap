import { z } from "zod";
import { NodeType, XMLDocumentSchema, XMLNode, createXMLNode } from "./xml";
import { tokenizer } from "./tokenizer";

function parseChildren(nodes: XMLNode[], debug: boolean = false): XMLNode[] {
    const tree: XMLNode[] = [];
    let stack: XMLNode[] = [];

    function pushToLowestChild(heap: XMLNode[], node: XMLNode) {
        let last = heap[heap.length - 1]
        if (last.children.length > 0 && last.type === NodeType.ElementOpenTag) {
            pushToLowestChild(last.children, node);
        } else {
            last.children.push(node);
        }
    }

    for (const node of nodes) {
        switch (node.type) {
            case NodeType.Text:
            case NodeType.ElementOpenTag:
                if (stack.length > 0) {
                    pushToLowestChild(stack, node)
                } else {
                    stack.push(node);
                }
                break;
            case NodeType.ElementSelfClosingTag:
                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(node)
                } else {
                    tree.push(node);
                }
            case NodeType.ElementCloseTag:
                if (stack.length > 0) {
                    const last = stack.pop();
                    if (last) {
                        tree.push(last)
                    }
                }
                break;
        }

        if (debug) {
            console.log("=== === === === === === === === === === === === ===")
            console.log(`Current: ${node.name} (${node.value})`)
            console.log(`Last in Stack: ${JSON.stringify(stack[stack.length - 1], null, 2)}`)
            console.log(`Last in Tree: ${JSON.stringify(tree[tree.length - 1], null, 2)}`)
        }
    }

    return tree
}

export function parse(xml: string, debug: boolean = false): z.infer<typeof XMLDocumentSchema> {

    if (!debug) {
        for (const arg of Bun.argv) {
            if (arg === "--debug") debug = true;
        }
    }

    let tokens = tokenizer(xml);
    let nodes = tokens.map(t => createXMLNode(t));

    const tree: Record<string, any> = {
        declaration: nodes.shift(),
        root: nodes.shift(),
    };

    if (nodes.length > 0) {
        tree.root.children = parseChildren(nodes, debug);
    }

    if (debug) console.log(JSON.stringify(tree, null, 2))

    return XMLDocumentSchema.parse(tree);
}
