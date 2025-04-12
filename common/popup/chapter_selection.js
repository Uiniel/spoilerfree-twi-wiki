// WHY CAN'T CHROME JUST USE browser LIKE A NORMAL BROWSER?????
let browser_common = null;
if ("browser" in window) {
    browser_common = browser;
} else {
    browser_common = chrome;
}

function updateSelectedChapter(title, date_string) {
    const elem = document.getElementById("selected-date");
    const date = new Date(date_string);
    elem.innerText = date.toLocaleDateString() + " (" + title + ")";
    browser_common.storage.local.set({
        "chapter": title,
        "date": date_string
    }).then(r => {})
}

function update_chapters() {
    console.log("Updating chapters...");
    let req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/Uiniel/spoilerfree-twi-wiki/refs/heads/main/chapters.json");
    req.responseType = "json";

    req.onload = function () {
        if (req.status === 200) {
            let chapter_selection_elem = document.getElementsByClassName("chapter-selection")[0];
            chapter_selection_elem.innerHTML = "";

            browser_common.storage.local.set({"chapters_cache": req.response}).then(() => {
                init().then(() => {});
            });
        }
    };

    req.onerror = function () {
    };

    req.send();
}

function build_chapter_selection(volumes) {
    let chapter_selection_elem = document.getElementsByClassName("chapter-selection")[0];

    for (const volume of volumes) {
        let volume_elem = document.createElement("details");

        let volume_title_elem = document.createElement("summary");
        volume_title_elem.innerText = volume.title;
        volume_elem.appendChild(volume_title_elem);

        for (const chapter of volume.chapters) {
            let chapter_elem = document.createElement("label");
            chapter_elem.htmlFor = chapter.title;
            chapter_elem.className = "chapter";

            let input_elem = document.createElement("input");
            input_elem.type = "radio";
            input_elem.name = "chapter";
            input_elem.value = chapter.date;
            input_elem.id = chapter.title;
            chapter_elem.appendChild(input_elem);

            chapter_elem.appendChild(document.createTextNode(chapter.title));

            volume_elem.appendChild(chapter_elem);
        }

        chapter_selection_elem.appendChild(volume_elem);
    }
}

async function init() {
    const local_storage = await browser_common.storage.local.get(null);

    if (!local_storage.chapters_cache) {
        update_chapters();
        return;
    }

    build_chapter_selection(local_storage.chapters_cache);

    const selected = local_storage.chapter || "1.00";

    const selected_elem = document.getElementById(selected);
    selected_elem.checked = true;
    const volume = selected_elem.closest("details");
    volume.open = true;
    selected_elem.scrollIntoView({"block": "center"});
    updateSelectedChapter(selected_elem.id, selected_elem.value);


    const enabled_elem = document.getElementById("enabled");
    if (local_storage.enabled === undefined) {
        enabled_elem.checked = true;
    } else {
        enabled_elem.checked = local_storage.enabled;
        if (!local_storage.enabled) {
            const enabled_text = document.getElementById("enabled-text").children[0];
            enabled_text.innerText = "Wiki Redirects Disabled";
        }
    }

    const form = document.getElementsByTagName("form")[0];
    form.addEventListener("change", (e) => {
        if (e.target.id === "enabled") {
            let enabled = e.target.checked;
            browser_common.storage.local.set({
                "enabled": enabled
            });
            const enabled_text = document.getElementById("enabled-text").children[0];
            if (enabled) {
                browser_common.runtime.sendMessage({
                    "type": "enabled"
                });
                enabled_text.innerText = "Wiki Redirects Enabled";
            } else {
                browser_common.runtime.sendMessage({
                    "type": "disabled"
                });
                enabled_text.innerText = "Wiki Redirects Disabled";
            }
        } else {
            updateSelectedChapter(e.target.id, e.target.value);
            browser_common.runtime.sendMessage({
                "type": "date",
                date_string: e.target.value
            });
        }
    });
}

init();
document.getElementById("update-chapters").addEventListener("click", () => update_chapters());