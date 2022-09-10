@module("linkify-string") external linkifyStr: (string) => string = "default";

@genType
let h1 = (line: string): string => {
    open Js.String2
    let trimmed = trim(line)
    if trimmed->startsWith("# ") {
        trimmed->sliceToEnd(~from=2);
    } else {
        trimmed
    }
}

@genType
let extractTitle = (text: string): (string, string) => {
    open Js.String2
    let first_newline = text->indexOf("\n")
    if first_newline == -1 {
        (h1(text), "")
    } else {
        let title = text->slice(~from=0, ~to_=first_newline)->h1
        let body = text->sliceToEnd(~from=first_newline+1)
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
    let replace = Js.String2.replaceByRe
    text->linkifyStr->replace(local, replacement)->replace(inline, replacement)
}


type htmlVariant = [#tags | #html2 | #iso | #html5 ]
let doctype = (variant: htmlVariant): option<string> => switch variant {
    | #tags => None
    | #html2 => Some("<!DOCTYPE HTML PUBLIC \"-//IETF//DTD HTML 2.0 Strict Level 1//EN\">")
    | #iso => Some("<!DOCTYPE HTML PUBLIC \"ISO/IEC 15445:2000//DTD HTML//EN\">")
    | #html5 => Some("<!DOCTYPE html>")
}


@genType
let html = (text: string, variant: htmlVariant): string => {
    let (title, body) = extractTitle(text);
    let tags = `<TITLE>${title}</TITLE><H1>${title}</H1>
<PLAINTEXT>
${body}`
    switch doctype(variant) {
        | None => tags
        | Some(dtd) => `${dtd}
<html>
<head>
  <link rel=icon href="data:,">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <pre>${linkIt(body)}</pre>
</body>
</html>`
    }
}

@genType
let htm = (text: string): string => {
    html(text, #html2)
}
