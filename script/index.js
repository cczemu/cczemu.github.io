import grayMatterBrowser from 'https://cdn.jsdelivr.net/npm/gray-matter-browser@4.0.4/+esm';
import { marked } from "https://cdn.jsdelivr.net/npm/marked@11.2.0/lib/marked.esm.js";

//navbar
const navMenu = document.querySelector("#navMenu");
const navLinks = document.querySelector(".navLinkGroup");

function toggleNavigation() {
    const isOpen = navLinks.classList.toggle("active");
    navMenu.setAttribute("aria-expanded", String(isOpen));
}

navMenu.addEventListener("click", toggleNavigation);
navMenu.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleNavigation();
    }
});


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
        const posts = await Promise.all(Object.values(urls).map(async (path) => {
            const postResponse = await fetch(`posts/${encodeURIComponent(path)}`);
            if (!postResponse.ok) throw new Error(`文章加载失败: ${path}`);
            const parsed = grayMatterBrowser(await postResponse.text());
            const html = marked.parse(parsed.content);
            const text = new DOMParser().parseFromString(html, "text/html").body.textContent.trim();
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
        content.replaceChildren(...posts.map(createCard));
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">文章暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

main()


