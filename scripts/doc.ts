import { readFileSync, writeFileSync } from "fs";
import { htm } from "../src/index.bs";

const text: string = readFileSync("README.txt", "utf8");
const html: string = htm(text);
writeFileSync("_site/index.html", html);
