const linkifyStr = require('linkify-string')

module.exports = function(eleventyConfig) {
    eleventyConfig.addTemplateFormats("txt");
    eleventyConfig.addExtension("txt", {
        compile: async (inputContent, inputPath) => {
            const html=`<!doctype html><html lang=en>
            <head>
                <link rel=icon href=data:,>
                <title>${inputPath.split('/').at(-1).split('.').at(0)}</title>
            </head>
            <body>
                <pre style=font:unset>
                ${linkifyStr(inputContent)}
                </pre>
            </body>
            </html>`
            return async () => html
        }
    })
}