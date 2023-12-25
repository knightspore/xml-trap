import { XMLSample } from "./constants";
import { parse } from "./parse";

const sample = await XMLSample();
parse(sample);
