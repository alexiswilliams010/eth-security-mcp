import * as types from "./types.js";

const baseURL = "https://www.4byte.directory/api/v1/signatures/";

export async function retrieveFunctionSignature(selector: string) {
    // Construct the URL with the query parameter and fetch the data
    const url = `${baseURL}?hex_signature=${selector}`;
    const response = await fetch(url);
    const data = await response.json();

    const parsedData = types.RetrieveFunctionSignatureResponse.parse(data);
    // Parse out the text signatures from the results, and take the lowest ID signature as the best match
    const signatures: { best_match: string; all_matches: string[] } = {
        best_match: "",
        all_matches: [],
    }
    signatures.all_matches = parsedData.results.map((result) => result.text_signature);
    signatures.best_match = parsedData.results.reduce((bestMatch, result) => {
        if (!bestMatch || result.id < bestMatch.id) {
            return result;
        }
        return bestMatch;
    }, parsedData.results[0])?.text_signature || "";

    // TODO: handle pagination later
    return signatures;
}
