export function isNotEmpty(source: string, cursor: number): boolean {
    return source.length > cursor;
}

export function match(pattern: RegExp, val: string): boolean {
    return pattern.test(val);
}

export function isCharWhitespace(char: string): boolean {
    return match(/\s/, char);
}

export function isCharNewLine(char: string): boolean {
    return match(/\n/, char);
}

export function isCharTab(char: string): boolean {
    return match(/\t/, char);
}

export function isCharTrimmable(char: string): boolean {
    return match(/\s|\n|\t/, char);
}

export function isCharOpeningTag(char: string): boolean {
    return match(/</, char);
}

export function isCharClosingTag(char: string): boolean {
    return match(/>/, char);
}

export function isCharText(char: string): boolean {
    return !isCharOpeningTag(char) && !isCharClosingTag(char);
}

export function isOpeningXMLTag(value: string) {
    return match(/<[^/]/, value);
}

export function isClosingXMLTag(value: string) {
    return match(/<\/[^/]/, value);
}

export function isSelfClosingXMLTag(value: string) {
    return match(/<[^\s<>\/]+(?:\s[^<>]+)?\/>/, value);
}

export function isCDATAOpeningTag(value: string) {
    return match(/<!\[CDATA\[/, value);
}

export function isCDATAClosingTag(value: string) {
    return match(/\]\]>/, value);
}

export function isDeclaration(value: string) {
    return match(/<\?xml/, value);
}
