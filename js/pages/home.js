import { getPlainText, renderMarkdown } from "../shared/markdown.js";
import { loadArticles } from "../shared/articles.js";

function createLink(text, href) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    return link;
}

function createArticleCard(article) {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h2");
    title.className = "title";
    title.appendChild(createLink(article.title, article.href));
    const summary = document.createElement("p");
    summary.className = "summary";
    summary.appendChild(createLink(article.summary, article.href));
    const info = document.createElement("div");
    info.className = "info";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.appendChild(createLink(article.category, `./tags/#${encodeURIComponent(article.category)}`));
    const meta = document.createElement("div");
    meta.className = "count-and-date";
    meta.innerHTML = `<span class="count">${article.count}</span><time class="date" datetime="${article.date.toISOString()}">${article.date.toLocaleDateString()}</time>`;
    info.append(tag, meta);
    card.append(title, summary, info);
    return card;
}

async function main() {
    const content = document.querySelector(".content");
    try {
        const articles = (await loadArticles()).map(({ slug, parsed }) => {
            const text = getPlainText(renderMarkdown(parsed.content));
            const date = parsed.data.date instanceof Date ? parsed.data.date : new Date(parsed.data.date);
            return {
                title: parsed.data.title || "未命名文章",
                category: parsed.data.categories || "未分类",
                date: Number.isNaN(date.getTime()) ? new Date() : date,
                count: `${text.length}字`,
                summary: `${text.slice(0, 80)}${text.length > 80 ? " ..." : ""}`,
                href: `./article/?slug=${encodeURIComponent(slug)}`
            };
        });
        content.replaceChildren(...articles.map(createArticleCard));
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">文章暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

main();
