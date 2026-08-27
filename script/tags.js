import { loadPosts } from "./posts.js";

async function main() {
    const content = document.querySelector(".content");
    try {
        const posts = await loadPosts();
        const tagsInfoArr = posts.map(({ path: link, parsed: { data: metadata } }) => {
            return {
                title: metadata.title || "未命名文章",
                tag: metadata.categories || "未分类",
                link
            };
        });

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