import grayMatterBrowser from "https://cdn.jsdelivr.net/npm/gray-matter-browser@4.0.4/+esm";
import { marked } from "https://cdn.jsdelivr.net/npm/marked@11.2.0/lib/marked.esm.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm";

export function parseFrontMatter(text) {
    return grayMatterBrowser(text);
}

export function renderMarkdown(text) {
    return DOMPurify.sanitize(marked.parse(text));
}

export function getPlainText(html) {
    return new DOMParser().parseFromString(html, "text/html").body.textContent.trim();
}
