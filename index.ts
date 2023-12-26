import { z } from "zod";
import { createTree } from "./ast";

const tree = createTree(await Bun.file("./samples/rss.xml").text());
console.log(JSON.stringify(tree, null, 2))
