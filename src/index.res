@module("linkify-string") external linkifyStr: (string) => string = "default";

@genType
let trimStart = (line: string): string => {
    let trimmed = line->Js.String2.trim;
    if trimmed->Js.String2.startsWith("# ") {
        trimmed->Js.String2.sliceToEnd(~from=2);
    } else {
        trimmed
    }
}

@genType
let extractTitle = (text: string): (string, string) => {
    let first_newline = text->Js.String2.indexOf("\n")
    if first_newline == -1 {
        (trimStart(text), "")
    } else {
        let title = text->Js.String2.slice(~from=0, ~to_=first_newline)->trimStart
        let body = text->Js.String2.sliceToEnd(~from=first_newline+1)
        (title, body)
    }
}

@genType
let linkIt = (text: string): string => {
    // [description](/path) is not handled by linkifyStr
    let local = %re("/\[([^\]]+)\]\(([^<)]+)\)/gm")
    // [description](url), where url is auto-linked by linkifyStr
    let inline = %re("/\[([^\]]+)\]\(<a href=\"([^\"]+)\">[^<]+<\/a>\)/gm")
    let replacement = "<a href=\"$2\">$1</a>"
    text->linkifyStr->Js.String2.replaceByRe(local, replacement)->Js.String2.replaceByRe(inline, replacement)
}

@genType
let htm = (text: string): string => {
    let (title, body) = extractTitle(text);
    `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <pre>${linkIt(body)}</pre>
</body>
</html>
`
}
