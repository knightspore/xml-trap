export function isNotEmpty(source: string, cursor: number): boolean {
    return source.length > cursor;
}

export function match(pattern: RegExp, val: string): boolean {
    return pattern.test(val);
}

export function isWhiteSpace(char: string): boolean {
    return match(/\s/, char);
}

export function isNewLine(char: string): boolean {
    return match(/\n/, char);
}

export function isTab(char: string): boolean {
    return match(/\t/, char);
}

export function isOpeningTag(char: string): boolean {
    return match(/</, char);
}

export function isClosingTag(char: string): boolean {
    return match(/>/, char);
}

export function isText(char: string): boolean {
    return !isOpeningTag(char) && !isClosingTag(char);
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

export function isDeclaration(value: string) {
    return match(/<\?xml/, value);
}
