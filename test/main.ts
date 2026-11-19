import tap from "tap";
import { h1, extractTitle, linkIt, htm, html } from "../src/index.bs.js";

tap.equal(h1("  hello"), "hello");
tap.equal(h1("hello world "), "hello world");
tap.equal(h1("hello"), "hello");
tap.equal(h1("# hello"), "hello");
tap.equal(h1("# hello #"), "hello #");
tap.equal(h1("#hello"), "#hello");
tap.equal(h1("## hello"), "## hello");
tap.equal(h1(" # hello"), "hello");

const sample_license: string = `Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`;
const expected_license_title: string =
  "Permission to use, copy, modify, and/or distribute this software for any";
const expected_license_body: string = `purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`;

tap.equal(extractTitle(sample_license)[0], expected_license_title);
tap.equal(extractTitle(sample_license)[1], expected_license_body);

const sample_program: string = `import linkifyStr from "linkify-string";

function trim_start(line: string): [string, boolean] {
  const trimmed: string = line.trimStart();
  if (trimmed.startsWith("# ")) {
    return [trimmed.slice(2), true];
  } else {
    return [trimmed, false];
  }
}
`;
const expected_program_title: string =
  'import linkifyStr from "linkify-string";';
const expected_program_body: string = `
function trim_start(line: string): [string, boolean] {
  const trimmed: string = line.trimStart();
  if (trimmed.startsWith("# ")) {
    return [trimmed.slice(2), true];
  } else {
    return [trimmed, false];
  }
}
`;
tap.strictSame(extractTitle(sample_program), [
  expected_program_title,
  expected_program_body,
]);

const sample_a_very_long_line_without_newline_character: string =
  "const text_is_a_very_long_line_without_newline_character: boolean = text.length > 50;";
tap.strictSame(
  extractTitle(sample_a_very_long_line_without_newline_character),
  [sample_a_very_long_line_without_newline_character, ""]
);
tap.strictSame(
  extractTitle("#" + sample_a_very_long_line_without_newline_character),
  ["#" + sample_a_very_long_line_without_newline_character, ""]
);
tap.strictSame(
  extractTitle("# " + sample_a_very_long_line_without_newline_character),
  [sample_a_very_long_line_without_newline_character, ""]
);

type Sample = {
  sample: string;
  expected: [string, string];
};

const short_line_without_newline_character: Sample = {
  sample: "sample",
  expected: ["sample", ""],
};
tap.strictSame(
  extractTitle(short_line_without_newline_character.sample),
  short_line_without_newline_character.expected
);

const short_line: Sample = {
  sample: "sample\n",
  expected: ["sample", ""],
};
tap.strictSame(extractTitle(short_line.sample), short_line.expected);
tap.strictSame(extractTitle("# " + short_line.sample), short_line.expected);

const html_code: Sample = {
  sample: `<!doctype html><html lang=en>
<head>
  <link rel=icon href=data:,>
  <title>\${title}</title>
</head>
<body>
<pre>\${linkIt(body)}</pre>
</body>
</html>`,
  expected: [
    "<!doctype html><html lang=en>",
    `<head>
  <link rel=icon href=data:,>
  <title>\${title}</title>
</head>
<body>
<pre>\${linkIt(body)}</pre>
</body>
</html>`,
  ],
};
tap.strictSame(extractTitle(html_code.sample), html_code.expected);

const readme: Sample = {
  sample: `# htm

## License

0BSD, excluding dependencies which have various licenses.`,
  expected: [
    "htm",
    `
## License

0BSD, excluding dependencies which have various licenses.`,
  ],
};
const man: Sample = {
  sample: `man - an interface to the system reference manuals

SYNOPSIS
       man [man options] [[section] page ...] ...
       man -k [apropos options] regexp ...
       man -K [man options] [section] term ...
       man -f [whatis options] page ...
       man -l [man options] file ...
       man -w|-W [man options] page ...

DESCRIPTION
       man  is  the  system's manual pager.  Each page argument given to man is normally the name of a
       program, utility or function.  The manual page associated with each of these arguments is  then
       found  and  displayed.  A section, if provided, will direct man to look only in that section of
       the manual.  The default action is to search in all of the available sections following a  pre-
       defined  order  (see  DEFAULTS),  and to show only the first page found, even if page exists in
       several sections.`,
  expected: [
    "man - an interface to the system reference manuals",
    `
SYNOPSIS
       man [man options] [[section] page ...] ...
       man -k [apropos options] regexp ...
       man -K [man options] [section] term ...
       man -f [whatis options] page ...
       man -l [man options] file ...
       man -w|-W [man options] page ...

DESCRIPTION
       man  is  the  system's manual pager.  Each page argument given to man is normally the name of a
       program, utility or function.  The manual page associated with each of these arguments is  then
       found  and  displayed.  A section, if provided, will direct man to look only in that section of
       the manual.  The default action is to search in all of the available sections following a  pre-
       defined  order  (see  DEFAULTS),  and to show only the first page found, even if page exists in
       several sections.`,
  ],
};

type LinkSample = {
  sample: string;
  expected: string;
};

const url: LinkSample = {
  sample: `https://example.com`,
  expected: '<a href="https://example.com">https://example.com</a>',
};
const reference: LinkSample = {
  sample: `[RFC1866]: https://datatracker.ietf.org/doc/html/rfc1866`,
  expected: `[RFC1866]: <a href="https://datatracker.ietf.org/doc/html/rfc1866">https://datatracker.ietf.org/doc/html/rfc1866</a>`,
};
const inline_relative_link: LinkSample = {
  sample: "[weblog](/log)",
  expected: '<a href="/log">weblog</a>',
};
const inline_link: LinkSample = {
  sample: "[weblog](https://example.com/log)",
  expected: '<a href="https://example.com/log">weblog</a>',
};
const readme_with_links: LinkSample = {
  sample: `The returned value is a string contaning valid [HTML 2.0].

Source

https://github.com/weakish/htm

Reference

- [Hypertext Markup Language - 2.0][HTML 2.0]
- [RFC1866](/rfc1866)
- [HTML Validator](https://validator.w3.org)

[HTML 2.0]: https://www.w3.org/MarkUp/html-spec/html-spec_toc.html`,
  expected: `The returned value is a string contaning valid [HTML 2.0].

Source

<a href="https://github.com/weakish/htm">https://github.com/weakish/htm</a>

Reference

- [Hypertext Markup Language - 2.0][HTML 2.0]
- <a href="/rfc1866">RFC1866</a>
- <a href="https://validator.w3.org">HTML Validator</a>

[HTML 2.0]: <a href="https://www.w3.org/MarkUp/html-spec/html-spec_toc.html">https://www.w3.org/MarkUp/html-spec/html-spec_toc.html</a>`,
};

const links: LinkSample[] = [
  url,
  reference,
  inline_relative_link,
  inline_link,
  readme_with_links,
  {
    sample: "[mail](mailto:user@example.com)",
    expected: '<a href="mailto:user@example.com">mail</a>',
  },
  {
    sample: "[mail](user@example.com)",
    expected: '<a href="mailto:user@example.com">mail</a>',
  },
  {
    sample: "[ftp](ftp://example.com/file)",
    expected: '<a href="ftp://example.com/file">ftp</a>',
  },
  {
    sample: "[irc](irc://irc.example.com/channel)",
    expected: '<a href="irc://irc.example.com/channel">irc</a>',
  },
  {
    sample: "[irc](irc://irc.example.com/channel  )",
    expected: '<a href="irc://irc.example.com/channel">irc</a>',
  },
  {
    sample: "[irc](irc://irc.example.com/channel?key=a&b=1)",
    expected: '<a href="irc://irc.example.com/channel?key=a&amp;b=1">irc</a>',
  },
  {
    sample: "[x](see https://example.com/a)",
    expected:
      '[x](see <a href="https://example.com/a">https://example.com/a</a>)',
  },
  {
    sample: "[x](Note: https://example.com/a)",
    expected:
      '[x](Note: <a href="https://example.com/a">https://example.com/a</a>)',
  },
  {
    sample: "[x](mailto: user@example.com)",
    expected:
      '[x](mailto: <a href="mailto:user@example.com">user@example.com</a>)',
  },
  {
    sample: "[irc](  irc://irc.example.com/channel)",
    expected: '<a href="irc://irc.example.com/channel">irc</a>',
  },
  {
    sample: "https://example.com/?a=1&copy=2",
    expected:
      '<a href="https://example.com/?a=1&amp;copy=2">https://example.com/?a=1&amp;copy=2</a>',
  },
  {
    sample: "[x](see https://example.com/?a=1&copy=2)",
    expected:
      '[x](see <a href="https://example.com/?a=1&amp;copy=2">https://example.com/?a=1&amp;copy=2</a>)',
  },
  {
    sample: "[xss](javascript://example.com/%0aalert(1))",
    expected: "[xss](javascript://example.com/%0aalert(1))",
  },
  {
    sample: "[xss](javascript:alert(1)//example.com/%0aalert(2))",
    expected: "[xss](javascript:alert(1)//example.com/%0aalert(2))",
  },
  {
    sample: "[xss](javascript:alert(1))",
    expected: "[xss](javascript:alert(1))",
  },
  {
    sample: "[xss](JAVASCRIPT:alert(1))",
    expected: "[xss](JAVASCRIPT:alert(1))",
  },
  {
    sample: "[xss](java\tscript:alert(1))",
    expected: "[xss](java\tscript:alert(1))",
  },
  {
    sample: "[xss](vbscript:msgbox(1))",
    expected: "[xss](vbscript:msgbox(1))",
  },
  {
    sample: "[data](data:text/html,hi)",
    expected: "[data](data:text/html,hi)",
  },
  {
    sample: '[break](test" onclick="alert(1))',
    expected: '[break](test" onclick="alert(1))',
  },
  {
    sample: "[empty](   )",
    expected: "[empty](   )",
  },
  {
    sample: "[scheme-relative](//127.0.0.1/)",
    expected: "[scheme-relative](//127.0.0.1/)",
  },
  {
    sample: "[scheme-relative](\\\\127.0.0.1\\\\x)",
    expected: "[scheme-relative](\\\\127.0.0.1\\\\x)",
  },
  {
    sample: "[scheme-relative](/\\\\127.0.0.1/x)",
    expected: "[scheme-relative](/\\\\127.0.0.1/x)",
  },
  {
    sample: "[scheme-relative](/\t/127.0.0.1/)",
    expected: "[scheme-relative](/\t/127.0.0.1/)",
  },
  {
    sample: "[path](foo\\bar)",
    expected: '<a href="foo\\bar">path</a>',
  },
  {
    sample: "[path](foo?a=1&b=2)",
    expected: '<a href="foo?a=1&amp;b=2">path</a>',
  },
  {
    sample: "[docs](/wiki/Foo_(bar))",
    expected: '<a href="/wiki/Foo_(bar)">docs</a>',
  },
  {
    sample: "[path](/a(b)/c)",
    expected: '<a href="/a(b)/c">path</a>',
  },
  {
    sample: '[x](/foo(bar)"onclick=alert(1))',
    expected: '[x](/foo(bar)"onclick=alert(1))',
  },
  {
    sample: "[q](https://example.com/a?b=1&copy;2)",
    expected: '<a href="https://example.com/a?b=1&amp;copy;2">q</a>',
  },
  {
    sample: "[scheme-relative](\\\\evil.com\\\\x)",
    expected: "[scheme-relative](\\\\evil.com\\\\x)",
  },
  {
    sample: "See [foo](/foo), [bar](https://example.com/bar).",
    expected:
      'See <a href="/foo">foo</a>, <a href="https://example.com/bar">bar</a>.',
  },
];
links.forEach((link) => {
  tap.equal(linkIt(link.sample), link.expected);
});

const samples: Sample[] = [readme, man];
samples.forEach((s) => {
  tap.strictSame(extractTitle(s.sample), s.expected);

  const [title, body]: [string, string] = s.expected;
  tap.equal(
    htm(s.sample),
    `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <pre>${body}</pre>
</body>
</html>`
  );
  tap.equal(htm(s.sample), html(s.sample, "html2"));
  const html_element = (html: string): string => html.slice(html.indexOf("\n"));
  const html2Dtd =
    '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">';
  const isoDtd = '<!DOCTYPE HTML PUBLIC "ISO/IEC 15445:2000//DTD HTML//EN">';
  const html5Dtd = "<!DOCTYPE html>";
  tap.equal(html(s.sample, "html2"), html2Dtd + html_element(htm(s.sample)));
  tap.equal(html(s.sample, "iso"), isoDtd + html_element(htm(s.sample)));
  tap.equal(html(s.sample, "html5"), html5Dtd + html_element(htm(s.sample)));
});

tap.equal(
  htm("hello\nworld"),
  `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>hello</title>
</head>
<body>
  <h1>hello</h1>
  <pre>world</pre>
</body>
</html>`
);
tap.equal(
  html("hello\nworld", "html5"),
  `<!DOCTYPE html>
<html>
<head>
  <link rel=icon href="data:,">
  <title>hello</title>
</head>
<body>
  <h1>hello</h1>
  <pre>world</pre>
</body>
</html>`
);
tap.equal(
  html("hello\nworld", "tags"),
  `<TITLE>hello</TITLE><H1>hello</H1>
<PLAINTEXT>
world`
);

tap.equal(
  htm("hello\n[world](/)"),
  `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>hello</title>
</head>
<body>
  <h1>hello</h1>
  <pre><a href="/">world</a></pre>
</body>
</html>`
);
tap.equal(
  html("hello\n[world](/)", "tags"),
  `<TITLE>hello</TITLE><H1>hello</H1>
<PLAINTEXT>
[world](/)`
);
tap.equal(
  html("hello\nhttps://example.com", "tags"),
  `<TITLE>hello</TITLE><H1>hello</H1>
<PLAINTEXT>
https://example.com`
);

tap.equal(
  htm("hello\n2 < 3"),
  `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>hello</title>
</head>
<body>
  <h1>hello</h1>
  <pre>2 &lt; 3</pre>
</body>
</html>`
);
tap.equal(
  html("hello\n2 < 3", "tags"),
  `<TITLE>hello</TITLE><H1>hello</H1>
<PLAINTEXT>
2 < 3`
);
tap.equal(
  htm(`<script>alert(1)</script> & "x" 'y'\nbody`),
  `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN">
<html>
<head>
  <link rel=icon href="data:,">
  <title>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot; &#39;y&#39;</title>
</head>
<body>
  <h1>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot; &#39;y&#39;</h1>
  <pre>body</pre>
</body>
</html>`
);
tap.equal(
  html('2 < 3 & "4"\n2 < 3', "tags"),
  `<TITLE>2 &lt; 3 &amp; &quot;4&quot;</TITLE><H1>2 &lt; 3 &amp; &quot;4&quot;</H1>
<PLAINTEXT>
2 < 3`
);
