import { parseFrontMatter } from "./content.js";

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`数据加载失败: ${path}`);
    return response.json();
}

async function fetchPost(path, basePath = ".") {
    const response = await fetch(`${basePath}/posts/${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error(`文章加载失败: ${path}`);
    return parseFrontMatter(await response.text());
}

export async function loadPosts(basePath = ".") {
    const links = await fetchJson(`${basePath}/links.json`);
    const results = await Promise.allSettled(Object.values(links).map(async (path) => ({
        path,
        parsed: await fetchPost(path, basePath)
    })));

    const posts = results.flatMap((result) => {
        if (result.status === "fulfilled") return [result.value];
        console.error(result.reason);
        return [];
    });
    if (posts.length === 0) throw new Error("没有可显示的文章");
    return posts;
}

export function loadPost(path, basePath = "..") {
    return fetchPost(path, basePath);
}
