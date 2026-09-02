export function sanitizeCodeContent(raw) {
  if (typeof raw !== "string") return "";
  let content = raw.trim();

  // If the content is wrapped in outer JSON quotes
  if (content.startsWith('"') && content.endsWith('"')) {
    try {
      const unquoted = JSON.parse(content);
      if (typeof unquoted === "string") content = unquoted;
    } catch (e) {}
  }

  // Unescape literal \r\n, \n, \t, \", \', \\ if content has escaped newlines
  if (content.includes("\\n")) {
    const escapedCount = (content.match(/\\n/g) || []).length;
    const realCount = (content.match(/\n/g) || []).length;
    if (escapedCount > realCount || realCount <= 1) {
      content = content
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "  ")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");
    }
  }

  // Strip accidental markdown code fences from LLM output
  content = content.replace(/^```[a-zA-Z0-9_-]*\r?\n/, "").replace(/\r?\n```\s*$/, "");

  return content;
}
