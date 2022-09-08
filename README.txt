htm - convert plain text to HTML 2.0, auto-linked.

Usage

    import htm from "htm"
    const text = "plain text"
    const html = htm(text)

The returned value is a string contaning valid [HTML 2.0].
The first line will be the TITLE and H1 heading,
truncated to 50 characters.
The remaining part will be enclosed with a PRE element,
with links auto-linked.

Markdown Compatibility

The input is supposed to be plain text.
However, the following Markdown syntax is supported:

- If the first line starts with `# `, then the leading `# ` will be trimmed.

- Inline links (brackets immediately followed with parens) will be convert to links,
  without displaying the URL.

Source

https://github.com/weakish/htm

License

0BSD, excluding dependencies which have various licenses.

Reference

- [Hypertext Markup Language - 2.0][HTML 2.0]
- [RFC1866](https://datatracker.ietf.org/doc/html/rfc1866)
- [HTML Validator](https://validator.w3.org)

[HTML 2.0]: https://www.w3.org/MarkUp/html-spec/html-spec_toc.html
