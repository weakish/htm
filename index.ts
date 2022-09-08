import linkifyStr from 'linkify-string'

export function linkIt(text: string): string {
    const inline_link: RegExp = /\[([^\]]+)\]\(([^<)]+)\)/gm
    const auto_linked: string = linkifyStr(text)
    return auto_linked.replaceAll(inline_link, '<a href="$2">$1</a>')
}
