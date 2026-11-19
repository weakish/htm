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

@send external replaceLink: (string, Js.Re.t, (string, string, string) => string) => string = "replace"
@send external replaceInlineLink: (
    string,
    Js.Re.t,
    (string, string, string, string, string, string) => string,
) => string = "replace"
@send external replaceHrefAmp: (string, Js.Re.t, (string, string) => string) => string = "replace"

let escapeHtml = (text: string): string => {
    open Js.String2
    text
    ->replaceByRe(%re("/&/g"), "&amp;")
    ->replaceByRe(%re("/</g"), "&lt;")
    ->replaceByRe(%re("/>/g"), "&gt;")
    ->replaceByRe(%re("/\"/g"), "&quot;")
    ->replaceByRe(%re("/'/g"), "&#39;")
}

// linkifyStr escapes text nodes (`&`, `<`, `>`) but its href only escapes `"`.
let unescapeLinkifyText = (text: string): string => {
    open Js.String2
    text
    ->replaceByRe(%re("/&lt;/g"), "<")
    ->replaceByRe(%re("/&gt;/g"), ">")
    ->replaceByRe(%re("/&quot;/g"), "\"")
    ->replaceByRe(%re("/&amp;/g"), "&")
}

let isSafeUrl = (rawUrl: string): bool => {
    open Js.String2
    let url = rawUrl->trim
    if url == "" || url->includes("\"") || url->includes("'") {
        false
    } else {
        // WHATWG parsers drop C0 controls and treat "\" as "/". "\\host" and
        // "/\\host" are then scheme-relative ("//host"), not path-relative.
        let normalized =
            url
            ->replaceByRe(%re("/[\x00-\x20]+/g"), "")
            ->split("\\")
            ->Js.Array2.joinWith("/")
            ->toLowerCase
        !(
            normalized->startsWith("//") ||
            normalized->startsWith("javascript:") ||
            normalized->startsWith("vbscript:") ||
            normalized->startsWith("data:")
        )
    }
}

@genType
let linkIt = (text: string): string => {
    // [description](/path) is not handled by linkifyStr.
    // One level of parentheses stays in the destination (`/wiki/Foo_(bar)`).
    let local = %re("/\[([^\]]+)\]\(((?:[^()<]|\([^()<]*\))+)\)/gm")
    // linkifyStr may wrap only the host. `)` is allowed in the destination
    // (`alert(1)//host`) unless whitespace follows it, and `[` / `\n` are
    // excluded so `[label](/path), [next](https://...)` is not swallowed.
    // Suffix is text left after </a> (`\\host\\x`, trailing spaces).
    let inline = %re("/\[([^\]]+)\]\(((?:[^)<[\n]|\)(?!\s))*)<a href=\"([^\"]+)\">([^<]*)<\/a>([^)]*)\)/gm")
    // A scheme (`irc://`, `javascript:`) is part of the destination.
    // Prose before the anchor (`see https://...`, `Note: https://...`) is not.
    let isSlashes = (s: string): bool =>
        s->Js.String2.split("/")->Js.Array2.every(part => part == "")
    let isSchemePrefix = (prefix: string): bool => {
        open Js.String2
        // Drop leading whitespace only. Trailing whitespace is prose
        // (`Note: https://...`), not a scheme plus slashes.
        let lead = prefix->replaceByRe(%re("/^\s+/"), "")
        if lead != lead->trim {
            false
        } else {
            let parts = lead->split(":")
            if Js.Array2.length(parts) != 2 {
                false
            } else {
                let name = parts->Js.Array2.unsafe_get(0)
                let rest = parts->Js.Array2.unsafe_get(1)
                Js.Re.test_(%re("/^[a-zA-Z][a-zA-Z0-9+.-]*$/"), name) && isSlashes(rest)
            }
        }
    }
    // linkifyStr's href escapes `"` as `&quot;` and leaves `&` raw, so a query
    // like `&copy` is a named character in HTML. Escape those `&` first.
    let escapeBareAmpInHrefs = (html: string): string =>
        html->replaceHrefAmp(%re("/<a href=\"([^\"]*)\">/g"), (_whole, href) => {
            let fixed = href->Js.String2.replaceByRe(%re("/&(?!quot;)/g"), "&amp;")
            `<a href="${fixed}">`
        })
    let unescapeLinkifyHref = (href: string): string =>
        href
        ->Js.String2.replaceByRe(%re("/&quot;/g"), "\"")
        ->Js.String2.replaceByRe(%re("/&amp;/g"), "&")
    let toAnchor = (whole, label, url) => {
        // linkifyStr escapes `&` in text that it does not itself link.
        let logical = unescapeLinkifyText(url)
        if isSafeUrl(logical) {
            `<a href="${escapeHtml(logical->Js.String2.trim)}">${label}</a>`
        } else {
            whole
        }
    }
    let toInlineAnchor = (whole, label, prefix, href, inner, suffix) => {
        open Js.String2
        let logicalPrefix = unescapeLinkifyText(prefix)
        let logicalUrl = if logicalPrefix->trim == "" {
            unescapeLinkifyHref(href)
        } else {
            logicalPrefix ++
            unescapeLinkifyText(inner) ++
            unescapeLinkifyText(suffix)
        }
        let plain = `[${label}](${prefix}${inner}${suffix})`
        if !isSafeUrl(logicalUrl) {
            plain
        } else if logicalPrefix->trim == "" && suffix->trim == "" {
            `<a href="${escapeHtml(logicalUrl->trim)}">${label}</a>`
        } else if isSchemePrefix(logicalPrefix) {
            `<a href="${escapeHtml(logicalUrl->trim)}">${label}</a>`
        } else {
            whole
        }
    }
    // Inline before local. local's `)` would split `javascript:alert(1)//host`
    // and leave linkify's anchor in the output.
    text
    ->linkifyStr
    ->escapeBareAmpInHrefs
    ->replaceInlineLink(inline, toInlineAnchor)
    ->replaceLink(local, toAnchor)
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
    let escapedTitle = escapeHtml(title);
    let tags = `<TITLE>${escapedTitle}</TITLE><H1>${escapedTitle}</H1>
<PLAINTEXT>
${body}`
    switch doctype(variant) {
        | None => tags
        | Some(dtd) => `${dtd}
<html>
<head>
  <link rel=icon href="data:,">
  <title>${escapedTitle}</title>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <pre>${linkIt(body)}</pre>
</body>
</html>`
    }
}

@genType
let htm = (text: string): string => html(text, #html2)
