import { z } from "zod";

export const BaseXMLNodeSchema = z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
    attributes: z.record(z.string()).optional(),
})

export type Children = z.infer<typeof BaseXMLNodeSchema> & {
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
