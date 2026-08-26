import grayMatterBrowser from 'https://cdn.jsdelivr.net/npm/gray-matter-browser@4.0.4/+esm'

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
    const content = document.querySelector(".content");
    try {
        const response = await fetch("links.json");
        if (!response.ok) throw new Error("文章列表加载失败");
        const linksArr = Object.values(await response.json());
        const tagsInfoArr = await Promise.all(linksArr.map(async (link) => {
            const postResponse = await fetch(`posts/${encodeURIComponent(link)}`);
            if (!postResponse.ok) throw new Error(`文章加载失败: ${link}`);
            const { metadata } = metadataParser(await postResponse.text());
            return {
                title: metadata.title || "未命名文章",
                tag: metadata.categories || "未分类",
                link
            };
        }));

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

    content.replaceChildren();
    let tag = "";
    tagsInfoArr.forEach(item => {
        if (item.tag !== tag) {
            let tagTitle = document.createElement("div");
            tagTitle.className = "tag-title";
            tagTitle.id = encodeURIComponent(item.tag);
            tagTitle.textContent = item.tag;
            document.getElementsByClassName("content")[0].appendChild(tagTitle);
        }
        let tagLink = document.createElement("div");
        tagLink.className = "tag-link";
        let tagLinkA = document.createElement("a");
        tagLinkA.setAttribute("href", "posts/?title=" + encodeURIComponent(item.link));
        tagLinkA.textContent = item.title;
        tagLink.appendChild(tagLinkA);
        document.getElementsByClassName("content")[0].appendChild(tagLink);
        tag = item.tag;
    })
    } catch (error) {
        content.innerHTML = '<p class="status-message" data-status="error">标签暂时无法加载，请稍后重试。</p>';
        console.error(error);
    }
}

function metadataParser(text) {
    const obj_md_ymal = grayMatterBrowser(text)
    return {
        metadata: obj_md_ymal.data,
        text: obj_md_ymal.content,
    };
};


main()