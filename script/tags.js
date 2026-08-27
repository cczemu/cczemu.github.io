import { parseFrontMatter } from "./content.js";

async function main() {
    const content = document.querySelector(".content");
    try {
        const response = await fetch("links.json");
        if (!response.ok) throw new Error("文章列表加载失败");
        const linksArr = Object.values(await response.json());
        const results = await Promise.allSettled(linksArr.map(async (link) => {
            const postResponse = await fetch(`posts/${encodeURIComponent(link)}`);
            if (!postResponse.ok) throw new Error(`文章加载失败: ${link}`);
            const { data: metadata } = parseFrontMatter(await postResponse.text());
            return {
                title: metadata.title || "未命名文章",
                tag: metadata.categories || "未分类",
                link
            };
        }));
        const tagsInfoArr = results.flatMap((result) => {
            if (result.status === "fulfilled") return [result.value];
            console.error(result.reason);
            return [];
        });
        if (tagsInfoArr.length === 0) throw new Error("没有可显示的标签");

    //对象数组根据每个对象的link降序
    tagsInfoArr.sort((a, b) => {
        const tagCompare = a.tag.localeCompare(b.tag, "zh-CN");
        if (tagCompare !== 0) return tagCompare;
        const linkA = a.link.toUpperCase();
        const linkB = b.link.toUpperCase();
        if (linkA < linkB) return 1;
        if (linkA > linkB) return -1;
        return 0;
    });

    const fragment = document.createDocumentFragment();
    let tag = "";
    tagsInfoArr.forEach(item => {
        if (item.tag !== tag) {
            const tagTitle = document.createElement("div");
            tagTitle.className = "tag-title";
            tagTitle.id = encodeURIComponent(item.tag);
            tagTitle.textContent = item.tag;
            fragment.appendChild(tagTitle);
        }
        const tagLink = document.createElement("div");
        tagLink.className = "tag-link";
        const tagLinkA = document.createElement("a");
        tagLinkA.setAttribute("href", "posts/?title=" + encodeURIComponent(item.link));
        tagLinkA.textContent = item.title;
        tagLink.appendChild(tagLinkA);
        fragment.appendChild(tagLink);
        tag = item.tag;
    });
    content.replaceChildren(fragment);
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">标签暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

main()