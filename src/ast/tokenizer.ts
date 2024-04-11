import { isCharClosingTag, isCharNewLine, isNotEmpty, isCharOpeningTag, isCharTab, isCharText, isCharWhitespace, isCharTrimmable } from "./match";

type TokenizerState = {
    source: string,
    tokens: string[],
    cursor: number,
    token: string,
}

export function trimLeft(source: string, cursor: number): number {
    let char = source[cursor];
    if (isCharWhitespace(char) || isCharNewLine(char) || isCharTab(char)) {
        cursor++;
        return trimLeft(source, cursor);
    }
    return cursor;
}

export function chopChar(source: string, cursor: number): [string, number] {
    let char = source[cursor];
    cursor++;
    return [char, cursor];
}

export function nextToken(source: string, cursor: number): [string, number] {
    cursor = trimLeft(source, cursor);

    let char = source[cursor];
    let token = "";

    if (isCharOpeningTag(source[cursor])) {
        while (isNotEmpty(source, cursor) && !isCharClosingTag(char)) {
            [char, cursor] = chopChar(source, cursor);
            token += char;
        }
    } else if (isCharText(source[cursor])) {
        while (isNotEmpty(source, cursor) && isCharText(char) && !isCharOpeningTag(source[cursor])) {
            [char, cursor] = chopChar(source, cursor);
            token += char;
        }
    }

    return [token, cursor];
}

export function createTokensFromString(xml: string): string[] {
    let { source, tokens, cursor, token }: TokenizerState = {
        source: xml.trim(),
        tokens: [],
        cursor: 0,
        token: "",
    }
    while (isNotEmpty(source, cursor)) {
        [token, cursor] = nextToken(source, cursor);
        tokens.push(token);
    }
    return tokens;
}
