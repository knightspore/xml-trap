export const XMLSample = async (): Promise<string> => {
    return await Bun.file("./sample.xml").text()
}

export const RSSSample = async(): Promise<string> => {
    return await Bun.file("./rss.xml").text()
}
