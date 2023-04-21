import { readFileSync, writeFileSync } from "fs";
import { htm, html } from "../src/index.bs.js";

const text: string = readFileSync("README", "utf8");
const html2: string = htm(text);
writeFileSync("_site/index.html", html2);

writeFileSync("_site/html-tags.html", html(text, "tags"));
writeFileSync("_site/iso.html", html(text, "iso"));
writeFileSync("_site/html5.html", html(text, "html5"));
