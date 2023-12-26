import { newFeed } from "./feed";

const feed = await newFeed("https://ciaran.co.za/rss.xml");

console.log(feed.title)

for (const item of feed.items) {
  console.log(`- ${item.title} (${item.link})`);
}
