import { bench, group, run } from "mitata";
import path from "path";
import { chopChar, createTokensFromString, nextToken, trimLeft } from "../ast/tokenizer";
import { createXMLNode, createXMLNodesFromTokens } from "../ast/xml";

const simple = await Bun.file(path.join(import.meta.dir + "/samples/sample.xml")).text()
const ciarancoza = await Bun.file(path.join(import.meta.dir + "/samples/rss.xml")).text()
const hackernews = await fetch("https://news.ycombinator.com/rss").then(res => res.text())


const max = Math.min(simple.length, ciarancoza.length, hackernews.length);
const randIndex = Math.floor(Math.random() * max);

group({ name: "trimLeft()" }, () => {
    bench("simple", () => trimLeft(simple, randIndex));
    bench("ciarancoza", () => trimLeft(ciarancoza, randIndex));
    bench("hackernews", () => trimLeft(hackernews, randIndex));
})

group({ name: "chopChar()" }, () => {
    bench("simple", () => chopChar(simple, randIndex));
    bench("ciarancoza", () => chopChar(ciarancoza, randIndex));
    bench("hackernews", () => chopChar(hackernews, randIndex));
})

group({ name: "nextToken()" }, () => {
    bench("simple", () => nextToken(simple, randIndex))
    bench("ciarancoza", () => nextToken(ciarancoza, randIndex))
    bench("hackernews", () => nextToken(hackernews, randIndex))
})

group({ name: "createTokensFromString()" }, () => {
    bench("simple", () => createTokensFromString(simple))
    bench("ciarancoza", () => createTokensFromString(ciarancoza))
    bench("hackernews", () => createTokensFromString(hackernews))
})

const simpleTokens = createTokensFromString(simple);
const ciarancozaTokens = createTokensFromString(ciarancoza);
const hackernewsTokens = createTokensFromString(hackernews);

const maxTokens = Math.min(simpleTokens.length, ciarancozaTokens.length, hackernewsTokens.length);
const randTokenIndex = Math.floor(Math.random() * maxTokens);

group({ name: "createXMLNode()" }, () => {
    bench("simple", () => createXMLNode(simpleTokens[randTokenIndex]))
    bench("ciarancoza", () => createXMLNode(ciarancozaTokens[randTokenIndex]))
    bench("hackernews", () => createXMLNode(hackernewsTokens[randTokenIndex]))
})

group({ name: "createXMLNodesFromTokens()" }, () => {
    bench("simple", () => createXMLNodesFromTokens(simpleTokens))
    bench("ciarancoza", () => createXMLNodesFromTokens(ciarancozaTokens))
    bench("hackernews", () => createXMLNodesFromTokens(hackernewsTokens))
})

await run()
