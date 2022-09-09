// Generated by ReScript, PLEASE EDIT WITH CARE

import * as LinkifyString from "linkify-string";

function trimStart(line) {
  var trimmed = line.trim();
  if (trimmed.startsWith("# ")) {
    return trimmed.slice(2);
  } else {
    return trimmed;
  }
}

function extractTitle(text) {
  var first_newline = text.indexOf("\n");
  if (first_newline === -1) {
    return [trimStart(text), ""];
  }
  var title = trimStart(text.slice(0, first_newline));
  var body = text.slice(first_newline);
  return [title, body];
}

function linkIt(text) {
  var local = /\[([^\]]+)\]\(([^<)]+)\)/gm;
  var inline = /\[([^\]]+)\]\(<a href=\"([^\"]+)\">[^<]+<\/a>\)/gm;
  var replacement = '<a href="$2">$1</a>';
  return LinkifyString(text)
    .replace(local, replacement)
    .replace(inline, replacement);
}

function htm(text) {
  var match = extractTitle(text);
  var title = match[0];
  return (
    '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN"><html>\n<head>\n  <link rel=icon href="data:,">\n  <title>' +
    title +
    "</title>\n</head>\n<body>\n<h1>" +
    title +
    "</h1>\n<pre>" +
    linkIt(match[1]) +
    "</pre>\n</body>\n</html>"
  );
}

export { trimStart, extractTitle, linkIt, htm };
/* linkify-string Not a pure module */
