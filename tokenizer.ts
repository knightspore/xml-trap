import { isClosingTag, isNewLine, isNotEmpty, isOpeningTag, isTab, isText, isWhiteSpace } from "./match";

export function tokenizer(xml: string): string[] {
    const source: string = xml.trim();
    const tokens: string[] = [];
    let cursor: number = 0;
    do {
        let char = source[cursor];
        if (isWhiteSpace(char) || isNewLine(char) || isTab(char)) {
            cursor++;
            continue;
        }
        let token = "";
        if (isOpeningTag(char)) {
            do {
                char = source[cursor];
                token += char;
                cursor++;
            } while (isNotEmpty(source, cursor) && !isClosingTag(char))
        } else if (isText(char)) {
            do {
                char = source[cursor];
                if (isOpeningTag(char)) break;
                token += char;
                cursor++;
            } while (isNotEmpty(source, cursor) && isText(char) && !isOpeningTag(char))
        }
        if (token.length > 0) {
            tokens.push(token);
        }
    } while (isNotEmpty(source, cursor))

    return tokens;
}
