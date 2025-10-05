// Helper functions
export function constructQueryParameters(params: object): string {
  // For each key in params, if the value is not undefined or an empty string, add it to the query parameters
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
          queryParams.set(key, value);
      }
  }

  return queryParams.toString();
}

export async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
      return response.json();
  }
  return response.text();
}