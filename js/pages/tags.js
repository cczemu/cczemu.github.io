import { loadArticles } from "../shared/articles.js";

async function main() {
    const content = document.querySelector(".content");
    try {
        const articles = await loadArticles("..");
        const articlesByTag = articles.map(({ slug, parsed: { data: metadata } }) => {
            return {
                title: metadata.title || "未命名文章",
                tag: metadata.categories || "未分类",
                slug
            };
        });

        articlesByTag.sort((a, b) => {
            const tagCompare = a.tag.localeCompare(b.tag, "zh-CN");
            if (tagCompare !== 0) return tagCompare;
            return b.slug.localeCompare(a.slug);
        });

        const fragment = document.createDocumentFragment();
        let currentTag = "";
        articlesByTag.forEach((article) => {
            if (article.tag !== currentTag) {
                const tagTitle = document.createElement("div");
                tagTitle.className = "tag-title";
                tagTitle.id = encodeURIComponent(article.tag);
                tagTitle.textContent = article.tag;
                fragment.appendChild(tagTitle);
            }

            const articleLink = document.createElement("a");
            articleLink.className = "tag-link";
            articleLink.href = `../article/?slug=${encodeURIComponent(article.slug)}`;
            articleLink.textContent = article.title;
            fragment.appendChild(articleLink);
            currentTag = article.tag;
        });
        content.replaceChildren(fragment);
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">标签暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

main();