import linkifyStr from "linkify-string";
function trim_start(line) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("# ")) {
    return [trimmed.slice(2), true];
  } else {
    return [trimmed, false];
  }
}
export function extractTitle(text) {
  const first_newline_character_position = text.indexOf("\n");
  if (first_newline_character_position === -1) {
    const text_is_a_very_long_line_without_newline_character = text.length > 50;
    if (text_is_a_very_long_line_without_newline_character) {
      const first_line = text.slice(0, 50);
      return [trim_start(first_line)[0], text];
    } else {
      return [trim_start(text)[0], ""];
    }
  } else if (first_newline_character_position > 50) {
    const truncated = text.slice(0, 50);
    const trimmed = trim_start(truncated);
    const trimmed_line = trimmed[0];
    const is_trimmed = trimmed[1];
    if (is_trimmed) {
      return [trimmed_line, trimmed_line + text.slice(50)];
    } else {
      return [truncated, text];
    }
  } else {
    const first_line = text.slice(0, first_newline_character_position);
    const remaing_text = text.slice(first_newline_character_position);
    return [trim_start(first_line)[0], remaing_text.trimEnd()];
  }
}
export function linkIt(text) {
  const auto_linked = linkifyStr(text);
  const inline_relative_link = /\[([^\]]+)\]\(([^<)]+)\)/gm;
  const inline_link = /\[([^\]]+)\]\(<a href="([^"]+)">[^<]+<\/a>\)/gm;
  return auto_linked
    .replaceAll(inline_relative_link, '<a href="$2">$1</a>')
    .replaceAll(inline_link, '<a href="$2">$1</a>');
}
export default function htm(text) {
  const [title, body] = extractTitle(text);
  const html = `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0 Strict Level 1//EN"><html>
<head>
  <link rel=icon href="data:,">
  <title>${title}</title>
</head>
<body>
<h1>${title}</h1>
<pre>${linkIt(body)}</pre>
</body>
</html>`;
  return html;
}
