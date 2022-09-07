const linkifyStr = require('linkify-string')

/** @type {function(number, number): number} */
function linkIt(text) {
    inlineLink = /\[([^\]]+)\]\(([^<)]+)\)/gm
    return linkifyStr(text).replaceAll(inlineLink, '<a href="$2">$1</a>')
}

module.exports = function(eleventyConfig) {
    eleventyConfig.addTemplateFormats("txt");
    eleventyConfig.addExtension("txt", {
        compile: async (inputContent, inputPath) => {
            return async () => `<!doctype html><html lang=en>
            <head>
                <link rel=icon href=data:,>
                <title>${inputPath.split('/').at(-1).split('.').at(0)}</title>
            </head>
            <body>
            <pre>${linkIt(inputContent)}</pre>
            </body>
            </html>`
        }
    })
}
