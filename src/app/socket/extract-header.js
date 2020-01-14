"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the <header></header> tags, grabs what is inside, and parses it as json.
 * @param datum
 * @returns An array where the first entry is the json object of the header
 * and the second is the index where the header ends
 */
function extractHeader(datum, headerOptions) {
    if (headerOptions.use) {
        const [open, close] = createHeaderStrings(headerOptions);
        const headerInnerEnd = datum.indexOf(close);
        const headerInnerStart = open.length;
        const headerEnd = headerInnerEnd + close.length;
        const headerInner = datum.substring(headerInnerStart, headerInnerEnd);
        const header = JSON.parse(headerInner);
        return [header, headerEnd];
    }
    else {
        return null;
    }
}
exports.extractHeader = extractHeader;
function createHeaderStrings(headerOptions) {
    let open = headerOptions.open;
    let close = headerOptions.close;
    if (typeof open === 'undefined') {
        open = '<header>';
        close = '</header>';
    }
    else if (typeof close === 'undefined') {
        if (open.startsWith('<') && open.endsWith('>')) {
            close = writeClosingXMLTag(open);
        }
    }
    return [open, close];
}
function writeClosingXMLTag(xmlTag) {
    const tag = xmlTag.substring(1, -1);
    const closingTag = `</${tag}>`;
    return closingTag;
}
//# sourceMappingURL=extract-header.js.map