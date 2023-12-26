import { z } from "zod";
import { isClosingTag, isClosingXMLTag, isOpeningTag, isOpeningXMLTag, isSelfClosingXMLTag, match } from "./match"

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

export const XMLDocumentSchema = z.object({
    declaration: XMLNodeSchema,
    root: XMLNodeSchema
})

export enum NodeType {
    Declaration = "declaration",
    ElementOpenTag = "elementOpenTag",
    ElementCloseTag = "elementCloseTag",
    ElementSelfClosingTag = "elementSelfClosingTag",
    Text = "text",
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

export function getNameOrText(value: string): string {
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
