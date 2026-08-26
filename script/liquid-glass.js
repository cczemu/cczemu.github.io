const storageKey = "liquid-glass-alpha";
const themeStorageKey = "site-theme";
const root = document.documentElement;
const themeStylesheet = document.querySelector("#themeStylesheet");
const savedTheme = localStorage.getItem(themeStorageKey);
const initialTheme = ["md3e", "md1"].includes(savedTheme) ? savedTheme : "liquid";
root.dataset.theme = initialTheme;
themeStylesheet.href = themeStylesheet.href.replace("liquid-glass.css", `${initialTheme === "md3e" ? "md3e" : initialTheme === "md1" ? "md1" : "liquid-glass"}.css`);
const savedAlpha = Number(localStorage.getItem(storageKey));
const initialAlpha = Number.isFinite(savedAlpha) && savedAlpha >= 0.2 && savedAlpha <= 0.88 ? savedAlpha : 0.58;

const control = document.createElement("aside");
control.className = "glass-control";
control.innerHTML = `
    <button class="control-trigger" id="controlTrigger" type="button" aria-expanded="false" aria-controls="controlPanel" aria-label="打开网站设置">⌁</button>
    <div class="glass-control__panel" id="controlPanel" hidden>
        <div class="glass-control__panel-header">
            <strong>网站设置</strong>
            <button class="control-close" id="controlClose" type="button" aria-label="关闭网站设置">×</button>
        </div>
        <div class="glass-control__theme">
            <label for="siteTheme">网站风格</label>
            <select id="siteTheme" aria-label="选择网站风格">
                <option value="liquid">Liquid Glass</option>
                <option value="md3e">Google MD3E</option>
                <option value="md1">Material Design 1</option>
            </select>
        </div>
        <div class="glass-control__intensity">
            <div class="glass-control__header">
                <label id="intensityLabel" for="glassIntensity">玻璃浓度</label>
                <output class="glass-control__value" for="glassIntensity"></output>
            </div>
            <input id="glassIntensity" type="range" min="20" max="88" value="${Math.round(initialAlpha * 100)}" aria-label="调整玻璃浓度">
        </div>
        <div class="glass-control__actions">
            <button class="wallpaper-button" id="previousWallpaper" type="button" title="Bing 昨日壁纸" aria-label="切换到 Bing 昨日壁纸">&lt;</button>
            <button class="wallpaper-button" id="todayWallpaper" type="button" title="Bing 今日壁纸" aria-label="切换到 Bing 今日壁纸">&gt;</button>
            <span class="wallpaper-status" aria-live="polite"></span>
        </div>
    </div>
`;
document.body.appendChild(control);

const slider = control.querySelector("#glassIntensity");
const value = control.querySelector("output");
const previousWallpaper = control.querySelector("#previousWallpaper");
const todayWallpaper = control.querySelector("#todayWallpaper");
const wallpaperStatus = control.querySelector(".wallpaper-status");
const themeSelect = control.querySelector("#siteTheme");
const intensityLabel = control.querySelector("#intensityLabel");
const intensityControl = control.querySelector(".glass-control__intensity");
const controlTrigger = control.querySelector("#controlTrigger");
const controlPanel = control.querySelector("#controlPanel");
const controlClose = control.querySelector("#controlClose");
let wallpaperIndex = 0;

function applyGlassAlpha(percent) {
    const alpha = Number(percent) / 100;
    root.style.setProperty("--glass-alpha", alpha.toFixed(2));
    root.style.setProperty("--content-alpha", alpha.toFixed(2));
    root.style.setProperty("--background-alpha", alpha.toFixed(2));
    value.value = `${percent}%`;
    value.textContent = `${percent}%`;
    localStorage.setItem(storageKey, alpha.toFixed(2));
}

function applyTheme(theme) {
    const nextTheme = ["md3e", "md1"].includes(theme) ? theme : "liquid";
    root.dataset.theme = nextTheme;
    if (nextTheme === "md1") document.body.style.removeProperty("background-image");
    const stylesheetName = nextTheme === "md3e" ? "md3e" : nextTheme === "md1" ? "md1" : "liquid-glass";
    themeStylesheet.href = themeStylesheet.href.replace(/(?:liquid-glass|md3e|md1)\.css$/, `${stylesheetName}.css`);
    themeSelect.value = nextTheme;
    const isLiquid = nextTheme === "liquid";
    intensityLabel.textContent = isLiquid ? "玻璃浓度" : "背景透明度";
    slider.setAttribute("aria-label", isLiquid ? "调整玻璃浓度" : "调整背景透明度");
    intensityControl.hidden = nextTheme === "md1";
    localStorage.setItem(themeStorageKey, nextTheme);
}

function setPanelOpen(isOpen) {
    control.classList.toggle("is-open", isOpen);
    controlPanel.hidden = !isOpen;
    controlTrigger.setAttribute("aria-expanded", String(isOpen));
}

slider.addEventListener("input", (event) => applyGlassAlpha(event.target.value));
themeSelect.addEventListener("change", (event) => applyTheme(event.target.value));
controlTrigger.addEventListener("click", () => setPanelOpen(!control.classList.contains("is-open")));
controlClose.addEventListener("click", () => setPanelOpen(false));
document.addEventListener("click", (event) => {
    if (!control.contains(event.target)) setPanelOpen(false);
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPanelOpen(false);
});
applyTheme(root.dataset.theme);
applyGlassAlpha(slider.value);

function updateWallpaperNavigation() {
    todayWallpaper.disabled = wallpaperIndex === 0;
}

function getWallpaperLabel(index, startDate) {
    if (index === 0) return "今天";
    if (index === 1) return "昨天";
    return startDate || `${index} 天前`;
}

async function loadBingWallpaper(index) {
    const endpoint = `https://bing.biturl.top/?resolution=1920&format=json&index=${index}&mkt=zh-CN`;
    previousWallpaper.disabled = true;
    todayWallpaper.disabled = true;
    wallpaperStatus.textContent = "加载中";

    try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("Wallpaper request failed");

        const data = await response.json();
        if (!data?.url) throw new Error("Wallpaper URL missing");

        const wallpaperUrl = new URL(data.url, "https://www.bing.com").href;
        const preloader = new Image();
        preloader.onload = () => {
            if (root.dataset.theme !== "md1") {
                document.body.style.backgroundImage = `url("${wallpaperUrl}")`;
            }
            wallpaperIndex = index;
            wallpaperStatus.textContent = getWallpaperLabel(index, data.start_date);
            previousWallpaper.disabled = false;
            updateWallpaperNavigation();
        };
        preloader.onerror = () => {
            wallpaperStatus.textContent = "加载失败";
            previousWallpaper.disabled = false;
            updateWallpaperNavigation();
        };
        preloader.src = wallpaperUrl;
    } catch (error) {
        wallpaperStatus.textContent = "加载失败";
        previousWallpaper.disabled = false;
        updateWallpaperNavigation();
    }
}

previousWallpaper.addEventListener("click", () => loadBingWallpaper(wallpaperIndex + 1));
todayWallpaper.addEventListener("click", () => loadBingWallpaper(Math.max(0, wallpaperIndex - 1)));
loadBingWallpaper(0);
