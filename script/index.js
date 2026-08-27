import { getPlainText, parseFrontMatter, renderMarkdown } from "./content.js";

function createLink(text, href, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = text;
    return link;
}

function createCard(post) {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h2");
    title.className = "title";
    title.appendChild(createLink(post.title, post.href, ""));
    const summary = document.createElement("p");
    summary.className = "summary";
    summary.appendChild(createLink(post.summary, post.href, ""));
    const info = document.createElement("div");
    info.className = "info";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.appendChild(createLink(post.category, `./tags.html#${encodeURIComponent(post.category)}`, ""));
    const meta = document.createElement("div");
    meta.className = "countAndDate";
    meta.innerHTML = `<span class="count">${post.count}</span><time class="date" datetime="${post.date.toISOString()}">${post.date.toLocaleDateString()}</time>`;
    info.append(tag, meta);
    card.append(title, summary, info);
    return card;
}

async function main() {
    const content = document.querySelector(".content");
    try {
        const response = await fetch("./links.json");
        if (!response.ok) throw new Error("文章列表加载失败");
        const urls = await response.json();
        const results = await Promise.allSettled(Object.values(urls).map(async (path) => {
            const postResponse = await fetch(`posts/${encodeURIComponent(path)}`);
            if (!postResponse.ok) throw new Error(`文章加载失败: ${path}`);
            const parsed = parseFrontMatter(await postResponse.text());
            const text = getPlainText(renderMarkdown(parsed.content));
            const date = parsed.data.date instanceof Date ? parsed.data.date : new Date(parsed.data.date);
            return {
                title: parsed.data.title || "未命名文章",
                category: parsed.data.categories || "未分类",
                date: Number.isNaN(date.getTime()) ? new Date() : date,
                count: `${text.length}字`,
                summary: `${text.slice(0, 80)}${text.length > 80 ? " ..." : ""}`,
                href: `./posts/?title=${encodeURIComponent(path)}`
            };
        }));
        const posts = results.flatMap((result) => {
            if (result.status === "fulfilled") return [result.value];
            console.error(result.reason);
            return [];
        });
        if (posts.length === 0) throw new Error("没有可显示的文章");
        content.replaceChildren(...posts.map(createCard));
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">文章暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

main()


