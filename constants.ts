export const XMLSample = async (): Promise<string> => {
    return await Bun.file("./sample.xml").text()
}
