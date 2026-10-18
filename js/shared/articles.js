import { parseFrontMatter } from "./markdown.js";

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`数据加载失败: ${path}`);
    return response.json();
}

async function fetchArticle(slug, rootPath) {
    const response = await fetch(`${rootPath}/content/articles/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error(`文章加载失败: ${slug}`);
    return parseFrontMatter(await response.text());
}

export async function loadArticles(rootPath = ".") {
    const slugs = await fetchJson(`${rootPath}/data/articles.json`);
    const results = await Promise.allSettled(slugs.map(async (slug) => ({
        slug,
        parsed: await fetchArticle(slug, rootPath)
    })));

    const articles = results.flatMap((result) => {
        if (result.status === "fulfilled") return [result.value];
        console.error(result.reason);
        return [];
    });
    if (articles.length === 0) throw new Error("没有可显示的文章");
    return articles;
}

export function loadArticle(slug, rootPath = "..") {
    return fetchArticle(slug, rootPath);
}
