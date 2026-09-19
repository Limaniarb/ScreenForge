"use strict";

/*
    SCREENFORGE
    Built by Arb

    Pure:
    HTML + CSS + JavaScript

    No backend.
    No Python.
    No API.

    The screenshot analysis is intentionally local.
*/


/* =========================================================
   ELEMENTS
========================================================= */

const imageInput = document.getElementById("imageInput");
const uploadZone = document.getElementById("uploadZone");
const uploadEmpty = document.getElementById("uploadEmpty");
const uploadPreview = document.getElementById("uploadPreview");
const sourceImage = document.getElementById("sourceImage");

const changeImageButton =
    document.getElementById("changeImageButton");

const removeImageButton =
    document.getElementById("removeImageButton");

const generateButton =
    document.getElementById("generateButton");

const previewIframe =
    document.getElementById("previewIframe");

const previewPlaceholder =
    document.getElementById("previewPlaceholder");

const previewFrame =
    document.getElementById("previewFrame");

const browserWindow =
    document.getElementById("browserWindow");

const copyButton =
    document.getElementById("copyButton");

const htmlCode =
    document.getElementById("htmlCode");

const cssCode =
    document.getElementById("cssCode");

const jsCode =
    document.getElementById("jsCode");

const settingsButton =
    document.getElementById("settingsButton");

const closeSettings =
    document.getElementById("closeSettings");

const settingsOverlay =
    document.getElementById("settingsOverlay");

const shortcutsButton =
    document.getElementById("shortcutsButton");

const shortcutsModal =
    document.getElementById("shortcutsModal");

const closeShortcuts =
    document.getElementById("closeShortcuts");

const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");

const fullscreenButton =
    document.getElementById("fullscreenButton");

const responsiveToggle =
    document.getElementById("responsiveToggle");

const modernToggle =
    document.getElementById("modernToggle");

const animationToggle =
    document.getElementById("animationToggle");

const smoothToggle =
    document.getElementById("smoothToggle");

const reduceMotionToggle =
    document.getElementById("reduceMotionToggle");

const fontSelect =
    document.getElementById("fontSelect");

const fontSizeRange =
    document.getElementById("fontSizeRange");

const fontSizeValue =
    document.getElementById("fontSizeValue");

const glowRange =
    document.getElementById("glowRange");

const glowValue =
    document.getElementById("glowValue");

const glassRange =
    document.getElementById("glassRange");

const glassValue =
    document.getElementById("glassValue");

const radiusRange =
    document.getElementById("radiusRange");

const radiusValue =
    document.getElementById("radiusValue");

const customAccent =
    document.getElementById("customAccent");

const resetSettings =
    document.getElementById("resetSettings");

const brandHome =
    document.getElementById("brandHome");


/* =========================================================
   STATE
========================================================= */

let currentImageData = null;

let generatedFiles = {
    html: "",
    css: "",
    js: ""
};

let currentDevice = "desktop";

let toastTimer = null;


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
    theme: "dark",
    accent: "#8b5cf6",
    font: "Inter",
    fontSize: 100,
    glow: 60,
    glass: 35,
    radius: 16,
    density: "comfortable",
    smooth: true,
    reduceMotion: false
};


/* =========================================================
   UTILITIES
========================================================= */

function hexToRgb(hex) {

    const clean = hex.replace("#", "");

    const bigint = parseInt(clean, 16);

    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255
    ];
}


function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


function downloadFile(filename, content, type) {

    const blob = new Blob(
        [content],
        { type }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

    let saved;

    try {
        saved =
            JSON.parse(
                localStorage.getItem(
                    "screenforge-settings"
                )
            );
    } catch {
        saved = null;
    }

    return {
        ...DEFAULT_SETTINGS,
        ...(saved || {})
    };
}


function saveSettings(settings) {

    localStorage.setItem(
        "screenforge-settings",
        JSON.stringify(settings)
    );
}


function getSettings() {

    return {
        theme:
            document.body.dataset.theme || "dark",

        accent:
            getComputedStyle(document.documentElement)
                .getPropertyValue("--accent")
                .trim() || "#8b5cf6",

        font:
            fontSelect.value,

        fontSize:
            Number(fontSizeRange.value),

        glow:
            Number(glowRange.value),

        glass:
            Number(glassRange.value),

        radius:
            Number(radiusRange.value),

        density:
            document.querySelector(
                ".segmented button.active"
            )?.dataset.density || "comfortable",

        smooth:
            smoothToggle.checked,

        reduceMotion:
            reduceMotionToggle.checked
    };
}


function applySettings(settings) {

    document.body.dataset.theme =
        settings.theme;

    document.documentElement.style
        .setProperty(
            "--accent",
            settings.accent
        );

    const rgb =
        hexToRgb(settings.accent);

    document.documentElement.style
        .setProperty(
            "--accent-rgb",
            rgb.join(",")
        );

    document.documentElement.style
        .setProperty(
            "--font-scale",
            settings.fontSize / 100
        );

    document.documentElement.style
        .setProperty(
            "--glow",
            settings.glow / 100
        );

    document.documentElement.style
        .setProperty(
            "--glass",
            settings.glass / 100
        );

    document.documentElement.style
        .setProperty(
            "--radius",
            `${settings.radius}px`
        );

    fontSelect.value =
        settings.font;

    fontSizeRange.value =
        settings.fontSize;

    glowRange.value =
        settings.glow;

    glassRange.value =
        settings.glass;

    radiusRange.value =
        settings.radius;

    smoothToggle.checked =
        settings.smooth;

    reduceMotionToggle.checked =
        settings.reduceMotion;

    fontSizeValue.textContent =
        `${settings.fontSize}%`;

    glowValue.textContent =
        `${settings.glow}%`;

    glassValue.textContent =
        `${settings.glass}%`;

    radiusValue.textContent =
        `${settings.radius}px`;

    document.documentElement.style
        .setProperty(
            "--density",
            settings.density === "compact"
                ? ".75"
                : settings.density === "spacious"
                    ? "1.3"
                    : "1"
        );

    document.body.classList.toggle(
        "reduce-motion",
        settings.reduceMotion
    );


    document
        .querySelectorAll(".theme-option")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === settings.theme
            );

        });


    document
        .querySelectorAll(".accent-color")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.accent.toLowerCase()
                    === settings.accent.toLowerCase()
            );

        });


    document
        .querySelectorAll(".segmented button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.density === settings.density
            );

        });


    customAccent.value =
        settings.accent;
}


function updateSettings() {

    saveSettings(
        getSettings()
    );
}


applySettings(
    loadSettings()
);


/* =========================================================
   SETTINGS EVENTS
========================================================= */

document
    .querySelectorAll(".theme-option")
    .forEach(button => {

        button.addEventListener("click", () => {

            const settings =
                getSettings();

            settings.theme =
                button.dataset.theme;

            applySettings(settings);

            updateSettings();

            showToast(
                `${button.textContent.trim()} theme applied`
            );

        });

    });


document
    .querySelectorAll(".accent-color")
    .forEach(button => {

        button.addEventListener("click", () => {

            const settings =
                getSettings();

            settings.accent =
                button.dataset.accent;

            applySettings(settings);

            updateSettings();

        });

    });


customAccent.addEventListener(
    "input",
    () => {

        const settings =
            getSettings();

        settings.accent =
            customAccent.value;

        applySettings(settings);

        updateSettings();

    }
);


fontSelect.addEventListener(
    "change",
    () => {

        const settings =
            getSettings();

        settings.font =
            fontSelect.value;

        applySettings(settings);

        updateSettings();

    }
);


fontSizeRange.addEventListener(
    "input",
    () => {

        const settings =
            getSettings();

        settings.fontSize =
            Number(fontSizeRange.value);

        applySettings(settings);

        updateSettings();

    }
);


glowRange.addEventListener(
    "input",
    () => {

        const settings =
            getSettings();

        settings.glow =
            Number(glowRange.value);

        applySettings(settings);

        updateSettings();

    }
);


glassRange.addEventListener(
    "input",
    () => {

        const settings =
            getSettings();

        settings.glass =
            Number(glassRange.value);

        applySettings(settings);

        updateSettings();

    }
);


radiusRange.addEventListener(
    "input",
    () => {

        const settings =
            getSettings();

        settings.radius =
            Number(radiusRange.value);

        applySettings(settings);

        updateSettings();

    }
);


document
    .querySelectorAll(".segmented button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const settings =
                getSettings();

            settings.density =
                button.dataset.density;

            applySettings(settings);

            updateSettings();

        });

    });


smoothToggle.addEventListener(
    "change",
    updateSettings
);


reduceMotionToggle.addEventListener(
    "change",
    () => {

        const settings =
            getSettings();

        settings.reduceMotion =
            reduceMotionToggle.checked;

        applySettings(settings);

        updateSettings();

    }
);


resetSettings.addEventListener(
    "click",
    () => {

        applySettings(
            DEFAULT_SETTINGS
        );

        saveSettings(
            DEFAULT_SETTINGS
        );

        showToast("Settings reset");

    }
);


/* =========================================================
   SETTINGS OPEN / CLOSE
========================================================= */

function openSettings() {

    settingsOverlay.classList.add("open");

    document.body.style.overflow =
        "hidden";
}


function closeSettingsDrawer() {

    settingsOverlay.classList.remove("open");

    document.body.style.overflow =
        "";
}


settingsButton.addEventListener(
    "click",
    openSettings
);


closeSettings.addEventListener(
    "click",
    closeSettingsDrawer
);


settingsOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target === settingsOverlay
        ) {
            closeSettingsDrawer();
        }

    }
);


/* =========================================================
   SHORTCUT MODAL
========================================================= */

function openShortcuts() {

    shortcutsModal.classList.add("open");

}


function closeShortcutModal() {

    shortcutsModal.classList.remove("open");

}


shortcutsButton.addEventListener(
    "click",
    openShortcuts
);


closeShortcuts.addEventListener(
    "click",
    closeShortcutModal
);


shortcutsModal.addEventListener(
    "click",
    event => {

        if (
            event.target === shortcutsModal
        ) {
            closeShortcutModal();
        }

    }
);


/* =========================================================
   IMAGE UPLOAD
========================================================= */

uploadZone.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                "#changeImageButton"
            ) ||
            event.target.closest(
                "#removeImageButton"
            )
        ) {
            return;
        }

        imageInput.click();

    }
);


changeImageButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        imageInput.click();

    }
);


removeImageButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        clearImage();

    }
);


imageInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        handleImage(file);

    }
);


function handleImage(file) {

    if (!file.type.startsWith("image/")) {

        showToast(
            "Please choose an image file"
        );

        return;
    }


    if (file.size > 15 * 1024 * 1024) {

        showToast(
            "Image must be smaller than 15MB"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload = () => {

        currentImageData =
            reader.result;

        sourceImage.src =
            currentImageData;

        uploadEmpty.style.display =
            "none";

        uploadPreview.classList.add(
            "visible"
        );

        showToast(
            "Screenshot loaded locally"
        );

    };


    reader.readAsDataURL(file);
}


function clearImage() {

    currentImageData = null;

    sourceImage.removeAttribute("src");

    uploadPreview.classList.remove(
        "visible"
    );

    uploadEmpty.style.display =
        "block";

    imageInput.value = "";

    showToast(
        "Screenshot removed"
    );
}


/* =========================================================
   DRAG AND DROP
========================================================= */

[
    "dragenter",
    "dragover"
].forEach(eventName => {

    uploadZone.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            uploadZone.classList.add(
                "dragging"
            );

        }
    );

});


[
    "dragleave",
    "drop"
].forEach(eventName => {

    uploadZone.addEventListener(
        eventName,
        event => {

            event.preventDefault();

            uploadZone.classList.remove(
                "dragging"
            );

        }
    );

});


uploadZone.addEventListener(
    "drop",
    event => {

        const file =
            event.dataTransfer.files?.[0];

        if (file) {
            handleImage(file);
        }

    }
);


/* =========================================================
   IMAGE ANALYSIS
========================================================= */

async function analyzeImage(dataUrl) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            image.onload = () => {

                const canvas =
                    document.createElement("canvas");

                const maxSize = 500;

                const scale =
                    Math.min(
                        1,
                        maxSize /
                        Math.max(
                            image.width,
                            image.height
                        )
                    );

                canvas.width =
                    Math.max(
                        1,
                        Math.round(
                            image.width * scale
                        )
                    );

                canvas.height =
                    Math.max(
                        1,
                        Math.round(
                            image.height * scale
                        )
                    );


                const context =
                    canvas.getContext(
                        "2d",
                        {
                            willReadFrequently: true
                        }
                    );


                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const pixels =
                    context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    ).data;


                let red = 0;
                let green = 0;
                let blue = 0;
                let brightness = 0;

                let count = 0;


                /*
                    Sample every 20th pixel.
                    This keeps the browser fast.
                */

                for (
                    let i = 0;
                    i < pixels.length;
                    i += 80
                ) {

                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    red += r;
                    green += g;
                    blue += b;

                    brightness +=
                        (
                            r * .299 +
                            g * .587 +
                            b * .114
                        );

                    count++;

                }


                red /= count;
                green /= count;
                blue /= count;
                brightness /= count;


                resolve({

                    width: image.width,

                    height: image.height,

                    aspect:
                        image.width /
                        image.height,

                    brightness,

                    averageColor: {
                        r: Math.round(red),
                        g: Math.round(green),
                        b: Math.round(blue)
                    },

                    isDark:
                        brightness < 125,

                    isVeryDark:
                        brightness < 70

                });

            };


            image.onerror = () => {
                reject(
                    new Error(
                        "Could not analyze image"
                    )
                );
            };


            image.src =
                dataUrl;

        }
    );
}


/* =========================================================
   COLOR UTILITIES
========================================================= */

function rgbToHex(r, g, b) {

    return "#" +
        [r, g, b]
            .map(value =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");
}


function createPalette(analysis) {

    const {
        r,
        g,
        b
    } = analysis.averageColor;


    /*
        Create a controlled accent based
        on the screenshot's dominant color.
    */

    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    const difference =
        max - min;


    let accent;


    if (difference < 18) {

        if (analysis.isDark) {
            accent = "#8b5cf6";
        } else {
            accent = "#4f46e5";
        }

    } else {

        const boost = 1.35;

        accent =
            rgbToHex(
                Math.min(
                    255,
                    Math.round(
                        r * boost
                    )
                ),
                Math.min(
                    255,
                    Math.round(
                        g * boost
                    )
                ),
                Math.min(
                    255,
                    Math.round(
                        b * boost
                    )
                )
            );

    }


    return {
        background:
            analysis.isDark
                ? "#07070b"
                : "#f7f7f8",

        surface:
            analysis.isDark
                ? "#101017"
                : "#ffffff",

        text:
            analysis.isDark
                ? "#f5f5f7"
                : "#151518",

        muted:
            analysis.isDark
                ? "#888894"
                : "#707078",

        accent
    };
}


/* =========================================================
   WEBSITE GENERATOR
========================================================= */

function generateWebsite(analysis) {

    const palette =
        createPalette(analysis);


    const responsive =
        responsiveToggle.checked;

    const modern =
        modernToggle.checked;

    const animations =
        animationToggle.checked &&
        !reduceMotionToggle.checked;


    const title =
        analysis.aspect > 1.55
            ? "Creative Digital Studio"
            : analysis.aspect < .8
                ? "Mobile Experience"
                : "Modern Digital Platform";


    const heroText =
        analysis.aspect > 1.4
            ? "Build something people remember."
            : "A better interface starts here.";


    const html = `
<main class="sf-page">

    <nav class="sf-nav">

        <a href="#" class="sf-logo">
            <span class="sf-logo-mark">
                <i></i>
                <i></i>
                <i></i>
            </span>

            <span>FORGE</span>
        </a>

        <div class="sf-nav-links">

            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>

        </div>

        <a href="#contact" class="sf-nav-button">
            Start a project
        </a>

    </nav>


    <section class="sf-hero">

        <div class="sf-hero-grid"></div>

        <div class="sf-hero-content">

            <div class="sf-kicker">
                DIGITAL / ${new Date().getFullYear()}
            </div>

            <h1>
                ${heroText}
                <span>${title}</span>
            </h1>

            <p>
                A clean responsive experience designed
                for modern products, ambitious teams,
                and people who care about details.
            </p>

            <div class="sf-actions">

                <a href="#work" class="sf-primary">
                    Explore work
                    <span>↗</span>
                </a>

                <a href="#about" class="sf-secondary">
                    Learn more
                </a>

            </div>

        </div>


        <div class="sf-orbit">

            <div class="sf-orbit-ring"></div>

            <div class="sf-orbit-core">
                <span>01</span>
            </div>

        </div>

    </section>


    <section class="sf-strip">

        <div>
            <strong>01</strong>
            STRATEGY
        </div>

        <div>
            <strong>02</strong>
            DESIGN
        </div>

        <div>
            <strong>03</strong>
            DEVELOPMENT
        </div>

        <div>
            <strong>04</strong>
            LAUNCH
        </div>

    </section>


    <section
        class="sf-work"
        id="work"
    >

        <div class="sf-section-top">

            <span>SELECTED WORK</span>

            <span>04 PROJECTS</span>

        </div>


        <div class="sf-project-list">

            <article class="sf-project">

                <div class="sf-project-number">
                    01
                </div>

                <div class="sf-project-main">

                    <h2>
                        Neural Interface
                    </h2>

                    <p>
                        Product experience / Web
                    </p>

                </div>

                <div class="sf-project-arrow">
                    ↗
                </div>

            </article>


            <article class="sf-project">

                <div class="sf-project-number">
                    02
                </div>

                <div class="sf-project-main">

                    <h2>
                        Future Commerce
                    </h2>

                    <p>
                        E-commerce / Experience
                    </p>

                </div>

                <div class="sf-project-arrow">
                    ↗
                </div>

            </article>


            <article class="sf-project">

                <div class="sf-project-number">
                    03
                </div>

                <div class="sf-project-main">

                    <h2>
                        Zero Gravity
                    </h2>

                    <p>
                        Brand system / Digital
                    </p>

                </div>

                <div class="sf-project-arrow">
                    ↗
                </div>

            </article>


            <article class="sf-project">

                <div class="sf-project-number">
                    04
                </div>

                <div class="sf-project-main">

                    <h2>
                        Orbital Systems
                    </h2>

                    <p>
                        SaaS / Interface
                    </p>

                </div>

                <div class="sf-project-arrow">
                    ↗
                </div>

            </article>

        </div>

    </section>


    <section
        class="sf-about"
        id="about"
    >

        <div class="sf-about-label">
            ABOUT
        </div>

        <div class="sf-about-content">

            <h2>
                Less noise.
                <span>More signal.</span>
            </h2>

            <p>
                We create digital experiences where
                every element has a reason to exist.
                Clear systems, sharp interfaces and
                technology that stays out of the way.
            </p>

        </div>

    </section>


    <section
        class="sf-contact"
        id="contact"
    >

        <span class="sf-kicker">
            HAVE A PROJECT?
        </span>

        <h2>
            Let's build
            <span>something.</span>
        </h2>

        <a
            href="mailto:hello@example.com"
            class="sf-primary"
        >
            Get in touch
            <span>↗</span>
        </a>

    </section>


    <footer class="sf-footer">

        <span>FORGE © ${new Date().getFullYear()}</span>

        <span>BUILT WITH INTENT</span>

    </footer>

</main>
`;


    const css = `
:root {
    --sf-bg: ${palette.background};
    --sf-surface: ${palette.surface};
    --sf-text: ${palette.text};
    --sf-muted: ${palette.muted};
    --sf-accent: ${palette.accent};
    --sf-border: ${analysis.isDark
        ? "rgba(255,255,255,.10)"
        : "rgba(0,0,0,.10)"
    };

    --sf-radius: 16px;
}


* {
    box-sizing: border-box;
}


html {
    scroll-behavior: smooth;
}


body {
    margin: 0;

    background:
        var(--sf-bg);

    color:
        var(--sf-text);

    font-family:
        Inter,
        Arial,
        sans-serif;

    -webkit-font-smoothing:
        antialiased;
}


a {
    color: inherit;

    text-decoration: none;
}


.sf-page {
    min-height: 100vh;

    overflow: hidden;
}


/* NAV */

.sf-nav {
    min-height: 78px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 6vw;

    border-bottom:
        1px solid var(--sf-border);

    position: relative;
    z-index: 5;
}


.sf-logo {
    display: flex;
    align-items: center;

    gap: 10px;

    font-size: 12px;

    font-weight: 800;

    letter-spacing: .12em;
}


.sf-logo-mark {
    width: 26px;
    height: 26px;

    display: flex;
    align-items: flex-end;

    gap: 3px;

    padding: 5px;

    border:
        1px solid
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 45%
        );

    border-radius: 7px;
}


.sf-logo-mark i {
    flex: 1;

    background:
        var(--sf-accent);

    border-radius: 2px;
}


.sf-logo-mark i:nth-child(1) {
    height: 35%;
}


.sf-logo-mark i:nth-child(2) {
    height: 65%;
}


.sf-logo-mark i:nth-child(3) {
    height: 100%;
}


.sf-nav-links {
    display: flex;

    gap: 34px;

    color: var(--sf-muted);

    font-size: 11px;
}


.sf-nav-links a {
    transition: color .2s ease;
}


.sf-nav-links a:hover {
    color: var(--sf-text);
}


.sf-nav-button {
    padding: 9px 14px;

    border:
        1px solid var(--sf-border);

    border-radius: 8px;

    font-size: 10px;
}


/* HERO */

.sf-hero {
    min-height: 700px;

    position: relative;

    display: flex;
    align-items: center;

    padding:
        100px 10vw;

    overflow: hidden;
}


.sf-hero-grid {
    position: absolute;

    inset: 0;

    background-image:
        linear-gradient(
            var(--sf-border) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            var(--sf-border) 1px,
            transparent 1px
        );

    background-size:
        70px 70px;

    mask-image:
        radial-gradient(
            ellipse at center,
            black,
            transparent 72%
        );

    opacity: .45;
}


.sf-hero-content {
    max-width: 800px;

    position: relative;

    z-index: 2;
}


.sf-kicker {
    display: inline-block;

    color: var(--sf-accent);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 10px;

    letter-spacing: .14em;

    margin-bottom: 25px;
}


.sf-hero h1 {
    margin: 0;

    font-size:
        clamp(52px, 8vw, 115px);

    line-height: .92;

    letter-spacing: -.08em;

    font-weight: 800;
}


.sf-hero h1 span {
    display: block;

    color: var(--sf-accent);
}


.sf-hero p {
    max-width: 520px;

    margin:
        28px 0 0;

    color: var(--sf-muted);

    line-height: 1.7;

    font-size: 14px;
}


.sf-actions {
    display: flex;

    gap: 9px;

    margin-top: 30px;
}


.sf-primary,
.sf-secondary {
    display: inline-flex;
    align-items: center;

    gap: 20px;

    padding: 13px 16px;

    border-radius: 9px;

    font-size: 11px;

    transition:
        transform .2s ease,
        background .2s ease;
}


.sf-primary {
    background:
        var(--sf-accent);

    color: white;
}


.sf-primary:hover {
    transform:
        translateY(-2px);
}


.sf-secondary {
    border:
        1px solid var(--sf-border);

    color: var(--sf-text);
}


.sf-secondary:hover {
    background:
        rgba(255,255,255,.04);
}


/* ORBIT */

.sf-orbit {
    position: absolute;

    width: 520px;
    height: 520px;

    right: -100px;

    top: 50%;

    transform:
        translateY(-50%);

    opacity: .85;
}


.sf-orbit-ring {
    position: absolute;

    inset: 0;

    border:
        1px solid
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 70%
        );

    border-radius: 50%;

    box-shadow:
        0 0 100px
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 85%
        );
}


.sf-orbit-ring::before,
.sf-orbit-ring::after {
    content: "";

    position: absolute;

    inset: 15%;

    border:
        1px solid
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 80%
        );

    border-radius: 50%;
}


.sf-orbit-ring::after {
    inset: 30%;
}


.sf-orbit-core {
    position: absolute;

    width: 130px;
    height: 130px;

    top: 50%;
    left: 50%;

    transform:
        translate(-50%, -50%);

    display: flex;
    align-items: center;
    justify-content: center;

    border:
        1px solid
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 40%
        );

    background:
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 90%
        );

    border-radius: 50%;

    box-shadow:
        0 0 70px
        color-mix(
            in srgb,
            var(--sf-accent),
            transparent 65%
        );
}


.sf-orbit-core span {
    color: var(--sf-accent);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 11px;
}


/* STRIP */

.sf-strip {
    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    border-top:
        1px solid var(--sf-border);

    border-bottom:
        1px solid var(--sf-border);
}


.sf-strip div {
    padding: 24px 6vw;

    border-right:
        1px solid var(--sf-border);

    color: var(--sf-muted);

    font-size: 9px;

    font-family:
        "JetBrains Mono",
        monospace;

    letter-spacing: .08em;
}


.sf-strip div:last-child {
    border-right: 0;
}


.sf-strip strong {
    color: var(--sf-accent);

    margin-right: 12px;
}


/* WORK */

.sf-work {
    padding:
        120px 10vw;
}


.sf-section-top {
    display: flex;
    justify-content: space-between;

    padding-bottom: 25px;

    border-bottom:
        1px solid var(--sf-border);

    color: var(--sf-muted);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 9px;

    letter-spacing: .08em;
}


.sf-project {
    display: grid;

    grid-template-columns: 80px 1fr 50px;

    align-items: center;

    min-height: 130px;

    border-bottom:
        1px solid var(--sf-border);

    transition:
        padding .25s ease,
        background .25s ease;
}


.sf-project:hover {
    padding:
        0 20px;

    background:
        rgba(255,255,255,.025);
}


.sf-project-number {
    color: var(--sf-muted);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 10px;
}


.sf-project-main h2 {
    margin: 0;

    font-size:
        clamp(23px, 3vw, 38px);

    letter-spacing: -.05em;
}


.sf-project-main p {
    margin: 7px 0 0;

    color: var(--sf-muted);

    font-size: 10px;
}


.sf-project-arrow {
    color: var(--sf-accent);

    font-size: 20px;

    text-align: right;
}


/* ABOUT */

.sf-about {
    display: grid;

    grid-template-columns: .4fr 1fr;

    gap: 60px;

    padding:
        120px 10vw;

    background:
        var(--sf-surface);
}


.sf-about-label {
    color: var(--sf-accent);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 10px;

    letter-spacing: .1em;
}


.sf-about-content {
    max-width: 800px;
}


.sf-about-content h2 {
    margin: 0;

    font-size:
        clamp(40px, 6vw, 80px);

    line-height: .95;

    letter-spacing: -.07em;
}


.sf-about-content h2 span {
    display: block;

    color: var(--sf-accent);
}


.sf-about-content p {
    max-width: 580px;

    margin:
        35px 0 0;

    color: var(--sf-muted);

    font-size: 14px;

    line-height: 1.8;
}


/* CONTACT */

.sf-contact {
    padding:
        150px 10vw;

    text-align: center;

    border-bottom:
        1px solid var(--sf-border);
}


.sf-contact h2 {
    margin:
        0 0 35px;

    font-size:
        clamp(50px, 9vw, 120px);

    line-height: .9;

    letter-spacing: -.08em;
}


.sf-contact h2 span {
    display: block;

    color: var(--sf-accent);
}


/* FOOTER */

.sf-footer {
    display: flex;

    justify-content: space-between;

    padding:
        25px 6vw;

    color: var(--sf-muted);

    font-family:
        "JetBrains Mono",
        monospace;

    font-size: 8px;

    letter-spacing: .08em;
}


/* ANIMATION */

${animations ? `
.sf-hero-content {
    animation:
        sfReveal .8s ease both;
}


.sf-orbit {
    animation:
        sfFloat 8s ease-in-out infinite;
}


@keyframes sfReveal {

    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }

}


@keyframes sfFloat {

    0%, 100% {
        transform:
            translateY(-50%)
            rotate(0deg);
    }

    50% {
        transform:
            translateY(-53%)
            rotate(3deg);
    }

}
` : ""}


/* RESPONSIVE */

${responsive ? `
@media (max-width: 850px) {

    .sf-nav {
        padding: 0 5vw;
    }

    .sf-nav-links {
        display: none;
    }

    .sf-hero {
        min-height: 650px;

        padding:
            80px 7vw;
    }

    .sf-orbit {
        width: 380px;
        height: 380px;

        right: -180px;

        opacity: .35;
    }

    .sf-strip {
        grid-template-columns:
            repeat(2, 1fr);
    }

    .sf-strip div:nth-child(2) {
        border-right: 0;
    }

    .sf-strip div {
        border-bottom:
            1px solid var(--sf-border);
    }

    .sf-work,
    .sf-about,
    .sf-contact {
        padding-left: 7vw;
        padding-right: 7vw;
    }

    .sf-about {
        grid-template-columns: 1fr;
    }

}


@media (max-width: 520px) {

    .sf-nav-button {
        display: none;
    }

    .sf-hero {
        min-height: 600px;
    }

    .sf-hero h1 {
        font-size:
            clamp(45px, 14vw, 70px);
    }

    .sf-actions {
        flex-direction: column;
        align-items: flex-start;
    }

    .sf-strip {
        grid-template-columns: 1fr;
    }

    .sf-strip div {
        border-right: 0;
    }

    .sf-project {
        grid-template-columns:
            40px 1fr 25px;

        min-height: 105px;
    }

    .sf-project:hover {
        padding: 0 8px;
    }

    .sf-project-main h2 {
        font-size: 24px;
    }

    .sf-footer {
        flex-direction: column;

        gap: 10px;
    }

}
` : ""}
`;


    const js = `
const links =
    document.querySelectorAll(
        'a[href^="#"]'
    );


links.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const target =
                document.querySelector(
                    link.getAttribute("href")
                );

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });

        }
    );

});


const projects =
    document.querySelectorAll(
        ".sf-project"
    );


projects.forEach(project => {

    project.addEventListener(
        "click",
        () => {

            project.animate(
                [
                    {
                        transform: "scale(1)"
                    },
                    {
                        transform: "scale(.99)"
                    },
                    {
                        transform: "scale(1)"
                    }
                ],
                {
                    duration: 220
                }
            );

        }
    );

});
`;


    return {
        html,
        css,
        js,
        palette
    };
}


/* =========================================================
   BUILD COMPLETE DOCUMENT
========================================================= */

function buildDocument(files) {

    const safeCss =
        files.css
            .replace(
                /<\/style/gi,
                "<\\\\/style"
            );


    const safeJs =
        files.js
            .replace(
                /<\/script/gi,
                "<\\\\/script"
            );


    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>ScreenForge Website</title>

<meta
    name="description"
    content="Generated with ScreenForge"
/>

<style>
${safeCss}
</style>

</head>

<body>

${files.html}

<script>
${safeJs}
<\/script>

</body>

</html>
`;
}


/* =========================================================
   GENERATE — REAL AI / NETLIFY FUNCTION
========================================================= */

generateButton.addEventListener("click", generate);

function prepareImageForApi(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            let maxSize = 1600;
            let quality = 0.82;

            const render = () => {
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                const output = canvas.toDataURL("image/webp", quality);

                if (output.length <= 3800000) {
                    resolve(output);
                    return;
                }

                if (quality > 0.62) {
                    quality -= 0.10;
                    render();
                    return;
                }

                if (maxSize > 1200) {
                    maxSize = 1200;
                    quality = 0.68;
                    render();
                    return;
                }

                reject(new Error("Screenshot is too large to send safely"));
            };

            render();
        };

        image.onerror = () => reject(new Error("Could not read the screenshot"));
        image.src = dataUrl;
    });
}

async function generate() {
    if (!currentImageData) {
        showToast("Upload a screenshot first");
        return;
    }

    generateButton.classList.add("loading");
    generateButton.disabled = true;

    try {
        await new Promise(resolve => requestAnimationFrame(resolve));

        const optimizedImage = await prepareImageForApi(currentImageData);

        const response = await fetch("/.netlify/functions/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: optimizedImage,
                options: {
                    responsive: responsiveToggle.checked,
                    modernize: modernToggle.checked,
                    animations: animationToggle.checked
                }
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("The AI server returned an invalid response");
        }

        if (!response.ok) {
            throw new Error(data?.error || "AI generation failed");
        }

        if (!data.html || !data.css || typeof data.js !== "string") {
            throw new Error("The AI returned incomplete website code");
        }

        generatedFiles.html = data.html.trim();
        generatedFiles.css = data.css.trim();
        generatedFiles.js = data.js.trim();

        htmlCode.textContent = generatedFiles.html;
        cssCode.textContent = generatedFiles.css;
        jsCode.textContent = generatedFiles.js;

        previewIframe.srcdoc = buildDocument(generatedFiles);
        previewPlaceholder.classList.add("hidden");

        copyButton.disabled = false;

        document.querySelectorAll(".download-button").forEach(button => {
            button.disabled = false;
        });

        showToast("AI website generated");
    } catch (error) {
        console.error(error);
        showToast(error?.message || "Could not generate the website");
    } finally {
        generateButton.classList.remove("loading");
        generateButton.disabled = false;
    }
}


/* =========================================================
   DEVICE PREVIEW
========================================================= */

document
    .querySelectorAll(".device-button")
    .forEach(button => {

        if (
            button.id ===
            "fullscreenButton"
        ) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                currentDevice =
                    button.dataset.device;


                document
                    .querySelectorAll(
                        ".device-button"
                    )
                    .forEach(item => {

                        if (
                            item.id !==
                            "fullscreenButton"
                        ) {
                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        }

                    });


                previewFrame.className =
                    `preview-frame ${currentDevice}`;

            }
        );

    });


/* =========================================================
   FULLSCREEN
========================================================= */

fullscreenButton.addEventListener(
    "click",
    () => {

        browserWindow.classList.toggle(
            "fullscreen"
        );


        const isFullscreen =
            browserWindow.classList.contains(
                "fullscreen"
            );


        fullscreenButton.innerHTML =
            isFullscreen
                ? '<i data-lucide="minimize"></i>'
                : '<i data-lucide="maximize"></i>';


        if (window.lucide) {
            lucide.createIcons();
        }

    }
);


/* =========================================================
   CODE TABS
========================================================= */

document
    .querySelectorAll(".code-tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const target =
                    tab.dataset.code;


                document
                    .querySelectorAll(
                        ".code-tab"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === tab
                        );

                    });


                document
                    .querySelectorAll(
                        ".code-content"
                    )
                    .forEach(content => {

                        content.classList.remove(
                            "active"
                        );

                    });


                document
                    .getElementById(
                        `${target}Code`
                    )
                    .classList.add(
                        "active"
                    );

            }
        );

    });


/* =========================================================
   COPY CODE
========================================================= */

copyButton.addEventListener(
    "click",
    async () => {

        if (!generatedFiles.html) {
            return;
        }


        const activeTab =
            document.querySelector(
                ".code-tab.active"
            );


        const type =
            activeTab?.dataset.code ||
            "html";


        const code =
            generatedFiles[type];


        try {

            await navigator.clipboard.writeText(
                code
            );

            showToast(
                `${type.toUpperCase()} copied`
            );

        } catch {

            /*
                Clipboard fallback.
            */

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                code;

            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();

            showToast(
                `${type.toUpperCase()} copied`
            );

        }

    }
);


/* =========================================================
   DOWNLOAD FILES
========================================================= */

document
    .getElementById("downloadHtml")
    .addEventListener(
        "click",
        () => {

            if (!generatedFiles.html) {
                return;
            }

            downloadFile(
                "index.html",
                buildDocument({
                    html: generatedFiles.html,
                    css: generatedFiles.css,
                    js: generatedFiles.js
                }),
                "text/html"
            );

            showToast(
                "index.html downloaded"
            );

        }
    );


document
    .getElementById("downloadCss")
    .addEventListener(
        "click",
        () => {

            if (!generatedFiles.css) {
                return;
            }

            downloadFile(
                "style.css",
                generatedFiles.css,
                "text/css"
            );

            showToast(
                "style.css downloaded"
            );

        }
    );


document
    .getElementById("downloadJs")
    .addEventListener(
        "click",
        () => {

            if (!generatedFiles.js) {
                return;
            }

            downloadFile(
                "script.js",
                generatedFiles.js,
                "text/javascript"
            );

            showToast(
                "script.js downloaded"
            );

        }
    );


/* =========================================================
   ZIP CREATOR
========================================================= */

/*
    Tiny ZIP implementation.

    It uses the ZIP "store" method.
    No external library is required.

    This means ScreenForge remains:
    HTML + CSS + JS only.
*/


function crc32(data) {

    let crc = 0xffffffff;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        crc ^= data[i];


        for (
            let j = 0;
            j < 8;
            j++
        ) {

            crc =
                (crc >>> 1) ^
                (
                    0xedb88320 &
                    -(
                        crc & 1
                    )
                );

        }

    }


    return (
        crc ^ 0xffffffff
    ) >>> 0;
}


function uint32(value) {

    return new Uint8Array([
        value & 255,
        (value >>> 8) & 255,
        (value >>> 16) & 255,
        (value >>> 24) & 255
    ]);

}


function uint16(value) {

    return new Uint8Array([
        value & 255,
        (value >>> 8) & 255
    ]);

}


function concatArrays(arrays) {

    let total = 0;

    arrays.forEach(
        array => {
            total += array.length;
        }
    );


    const result =
        new Uint8Array(total);


    let offset = 0;


    arrays.forEach(
        array => {

            result.set(
                array,
                offset
            );

            offset +=
                array.length;

        }
    );


    return result;
}


function createZip(files) {

    const encoder =
        new TextEncoder();

    const localParts = [];

    const centralParts = [];

    let offset = 0;


    for (const file of files) {

        const name =
            encoder.encode(
                file.name
            );

        const data =
            encoder.encode(
                file.content
            );

        const crc =
            crc32(data);


        const localHeader =
            concatArrays([

                new Uint8Array([
                    0x50,
                    0x4b,
                    0x03,
                    0x04
                ]),

                uint16(20),

                uint16(0),

                uint16(0),

                uint16(0),

                uint16(0),

                uint32(crc),

                uint32(data.length),

                uint32(data.length),

                uint16(name.length),

                uint16(0),

                name

            ]);


        localParts.push(
            localHeader,
            data
        );


        const centralHeader =
            concatArrays([

                new Uint8Array([
                    0x50,
                    0x4b,
                    0x01,
                    0x02
                ]),

                uint16(20),

                uint16(20),

                uint16(0),

                uint16(0),

                uint16(0),

                uint16(0),

                uint32(crc),

                uint32(data.length),

                uint32(data.length),

                uint16(name.length),

                uint16(0),

                uint16(0),

                uint16(0),

                uint16(0),

                uint32(0),

                uint32(offset),

                name

            ]);


        centralParts.push(
            centralHeader
        );


        offset +=
            localHeader.length +
            data.length;

    }


    const centralDirectory =
        concatArrays(
            centralParts
        );


    const localDirectory =
        concatArrays(
            localParts
        );


    const end =
        concatArrays([

            new Uint8Array([
                0x50,
                0x4b,
                0x05,
                0x06
            ]),

            uint16(0),

            uint16(0),

            uint16(files.length),

            uint16(files.length),

            uint32(
                centralDirectory.length
            ),

            uint32(
                localDirectory.length
            ),

            uint16(0)

        ]);


    return concatArrays([
        localDirectory,
        centralDirectory,
        end
    ]);
}


document
    .getElementById("downloadZip")
    .addEventListener(
        "click",
        () => {

            if (!generatedFiles.html) {
                return;
            }


            const completeHtml =
                buildDocument(
                    generatedFiles
                );


            const zip =
                createZip([
                    {
                        name: "index.html",
                        content: completeHtml
                    },
                    {
                        name: "style.css",
                        content: generatedFiles.css
                    },
                    {
                        name: "script.js",
                        content: generatedFiles.js
                    }
                ]);


            const blob =
                new Blob(
                    [zip],
                    {
                        type:
                            "application/zip"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "screenforge-website.zip";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();


            setTimeout(() => {

                URL.revokeObjectURL(
                    url
                );

            }, 1000);


            showToast(
                "ZIP downloaded"
            );

        }
    );


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            generate();

        }


        if (
            event.ctrlKey &&
            event.key === ","
        ) {

            event.preventDefault();

            openSettings();

        }


        if (
            event.key === "Escape"
        ) {

            closeSettingsDrawer();

            closeShortcutModal();

            browserWindow.classList.remove(
                "fullscreen"
            );

        }

    }
);


/* =========================================================
   HOME
========================================================= */

brandHome.addEventListener(
    "click",
    event => {

        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   LUCIDE
========================================================= */

if (window.lucide) {
    lucide.createIcons();
}


/* =========================================================
   INITIAL STATE
========================================================= */

previewIframe.srcdoc = `
<!DOCTYPE html>
<html>
<head>

<style>

* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    width: 100%;
    height: 100%;
}

body {
    display: grid;
    place-items: center;

    background:
        #07070a;

    color:
        #777780;

    font-family:
        Arial,
        sans-serif;
}

div {
    text-align: center;
}

strong {
    display: block;

    margin-bottom: 8px;

    color: #b0b0b8;

    font-size: 13px;
}

span {
    font-size: 10px;
}

</style>

</head>

<body>

<div>

<strong>SCREENFORGE</strong>

<span>Upload a screenshot to generate a website.</span>

</div>

</body>
</html>
`;


/* =========================================================
   CONSOLE BRANDING
========================================================= */

console.log(
    "%cScreenForge",
    "font-size:22px;font-weight:bold;"
);

console.log(
    "%cBuilt by Arb",
    "font-size:12px;"
);