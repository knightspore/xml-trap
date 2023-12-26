import chalk from "chalk";
import { newFeed } from "./feed";

const { stdout } = Bun.spawnSync({
    cmd: ["env"],
    stdout: "pipe",
})

const home = stdout.toString().match(/HOME=(.*)/)![1]
const urlsFile = await Bun.file(`${home}/.newsboat/urls`).text()
const urlLines = urlsFile.split("\n").filter(l => l.startsWith("http"));
const urls = urlLines.map(l => l.split(" ")[0].trim())

async function printFeeds(urls: string[]) {
    return await Promise.all(urls.map(async (url) => {
        const feed = await newFeed(url);
        console.log(chalk.bold(chalk.blue(feed.title)));
        for (const item of feed.items) {
            console.log(`\t ${chalk.green(">")} ${item.title}`);
        }
    }))
}

await printFeeds(urls);
