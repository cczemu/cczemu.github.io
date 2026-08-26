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

async function main() {
    const path = getQueryVariable("title");
    const content = document.querySelector(".article-content");
    if (!path) throw new Error("缺少文章路径");
    const response = await fetch(`../posts/${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error("文章不存在");
    const parsed = grayMatterBrowser(await response.text());
    const metadata = parsed.data;
    const html = marked.parse(parsed.content);
    const pureText = new DOMParser().parseFromString(html, "text/html").body.textContent.trim();
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

function getTitle(){
    console.log(window.location.href)
    return window.location.href
}

function getQueryVariable(variable) {
    return new URLSearchParams(window.location.search).get(variable);
}

main().catch((error) => {
    document.querySelector(".article-content").innerHTML = '<p class="status-message" data-status="error">文章暂时无法加载，请返回首页重试。</p>';
    console.error(error);
});