import { z } from "zod";
import { isClosingXMLTag, isOpeningXMLTag, isSelfClosingXMLTag, isCDATAOpeningTag, isCDATAClosingTag, isDeclaration } from "./match"

type BaseXMLNode = z.infer<typeof BaseXMLNodeSchema>;
export const BaseXMLNodeSchema = z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
    attributes: z.record(z.string()).optional(),
})

export type Children = BaseXMLNode & {
    children: Children[];
}

export type XMLNode = z.infer<typeof XMLNodeSchema>;
export const XMLNodeSchema: z.ZodType<Children> = BaseXMLNodeSchema.extend({
    children: z.lazy(() => XMLNodeSchema.array()),
})

export type XMLDocument = z.infer<typeof XMLDocumentSchema>;
export const XMLDocumentSchema = z.object({
    declaration: XMLNodeSchema.optional(),
    root: XMLNodeSchema
})

export enum NodeType {
    Declaration = "declaration",
    ElementOpenTag = "open",
    ElementCloseTag = "close",
    ElementSelfClosingTag = "selfclose",
    ElementCDATAOpenTag = "cdataopen",
    ElementCDATACloseTag = "cdataclose",
    Text = "text",
}

function getType(value: string): NodeType {
    switch (true) {
        case isDeclaration(value):
            return NodeType.Declaration
        case isSelfClosingXMLTag(value):
            return NodeType.ElementSelfClosingTag;
        case isCDATAOpeningTag(value):
            return NodeType.ElementCDATAOpenTag;
        case isCDATAClosingTag(value):
            return NodeType.ElementCDATACloseTag;
        case isOpeningXMLTag(value):
            return NodeType.ElementOpenTag;
        case isClosingXMLTag(value):
            return NodeType.ElementCloseTag;
        default:
            return NodeType.Text
    }
}

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

export function getName(value: string): string {
    const nameMatcher = /<([^\s>]+)/g;
    let returnValue = null;;
    const match = nameMatcher.exec(value)
    try {
        returnValue = match![1].replace("/", "");
    } catch (e: any) {
        returnValue = value;
    }
    return returnValue;
}

export function getCDATAValue(value: string): string {
    if (!value.endsWith("]]>")) {
        value += "]]>";
    }
    const cdataMatcher = /<!\[CDATA\[([\s\S]+)\]\]>/g;
    const match = cdataMatcher.exec(value);
    return match![1];
}

export function createXMLNode(value: string): XMLNode {
    const type = getType(value);
    let name = "";
    value = value.trim();
    switch (type) {
        case NodeType.ElementCDATAOpenTag:
            name = "CDATA";
            value = getCDATAValue(value);
            break;
        case NodeType.Text:
            name = "innerText";
            break;
        default:
            name = getName(value);
            break;

    }
    return XMLNodeSchema.parse({
        name,
        type,
        value,
        attributes: getAttributes(value),
        children: [],
    })
}

export function createXMLNodesFromTokens(tokens: string[]): XMLNode[] {
    return XMLNodeSchema.array().parse(tokens.map(createXMLNode))
}
