import { IHeader } from './models/header.interface'
import { IHeaderOptions } from './models/header-options.interface'

/**
 * Finds the <header></header> tags, grabs what is inside, and parses it as json.
 * @param datum
 * @returns An array where the first entry is the json object of the header
 * and the second is the index where the header ends
 */
export function extractHeader(datum: string, headerOptions: IHeaderOptions): [IHeader, number] | null {
  if (headerOptions.use) {
    const [open, close] = createHeaderStrings(headerOptions)
    const headerInnerEnd: number = datum.indexOf(close)
    const headerInnerStart: number = open.length
    const headerEnd: number = headerInnerEnd + close.length
    const headerInner: string = datum.substring(headerInnerStart, headerInnerEnd)
    const header: IHeader = JSON.parse(headerInner)
    return [header, headerEnd]
  } else {
    return null
  }
}

function createHeaderStrings(headerOptions: IHeaderOptions): [string, string] {
  let open: string = headerOptions.open
  let close: string = headerOptions.close
  if (typeof open === 'undefined') {
    open = '<header>'
    close = '</header>'
  } else if (typeof close === 'undefined') {
    if (open.startsWith('<') && open.endsWith('>')) {
      close = writeClosingXMLTag(open)
    }
  }
  return [open, close]
}

function writeClosingXMLTag(xmlTag: string): string {
  const tag = xmlTag.substring(1, -1)
  const closingTag = `</${tag}>`
  return closingTag
}
