import { getPlainText, renderMarkdown } from "../../script/content.js";
import { loadPost } from "../../script/posts.js";

async function main() {
    const path = getQueryVariable("title");
    const content = document.querySelector(".article-content");
    if (!path) throw new Error("缺少文章路径");
    const parsed = await loadPost(path);
    const metadata = parsed.data;
    const html = renderMarkdown(parsed.content);
    const pureText = getPlainText(html);
    const date = metadata.date instanceof Date ? metadata.date : new Date(metadata.date);

    document.title = `${metadata.title || "文章"} | moeday's blog`;
    document.querySelector(".article-slogan .title").textContent = metadata.title || "未命名文章";
    const tagLink = document.querySelector(".article-slogan .tag a");
    tagLink.href = `../tags.html#${encodeURIComponent(metadata.categories || "未分类")}`;
    tagLink.textContent = metadata.categories || "未分类";
    document.querySelector(".article-meta").textContent = `${pureText.length}字 ${date.toLocaleDateString()}`;
    content.innerHTML = html;
    content.querySelectorAll("a[href^='http']").forEach((link) => {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });
}

function getQueryVariable(variable) {
    return new URLSearchParams(window.location.search).get(variable);
}

main().catch((error) => {
    document.querySelector(".article-content").innerHTML = '<p class="status-message" data-status="error">文章暂时无法加载，请返回首页重试。</p>';
    console.error(error);
});