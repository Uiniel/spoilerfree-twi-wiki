function updateSelectedChapter(title, date_string) {
    const elem = document.getElementById("selected-date");
    const date = new Date(date_string);
    elem.innerText = date.toLocaleDateString() + " (" + title + ")";
    browser.storage.local.set({
        "chapter": title,
        "date": date
    })
}


const selected = (await browser.storage.local.get("chapter")).chapter || "1.00";

const selected_elem = document.getElementById(selected);
selected_elem.checked = true;
const volume = selected_elem.closest("details");
volume.open = true;
selected_elem.scrollIntoView({"block": "center"});
updateSelectedChapter(selected_elem.id, selected_elem.value);


const enabled_elem = document.getElementById("enabled");
enabled_elem.checked = (await browser.storage.local.get("enabled")).enabled || true;

const form = document.getElementsByTagName("form")[0];
form.addEventListener("change", (e) => {
    if (e.target.id === "enabled") {
        let enabled = e.target.checked;
        browser.storage.local.set({
            "enabled": enabled
        });
        const enabled_text = document.getElementById("enabled-text").children[0];
        if (enabled) {
            browser.runtime.sendMessage({
                "type": "enabled"
            });
            enabled_text.innerText = "Wiki Redirects Enabled";
        } else {
            browser.runtime.sendMessage({
                "type": "disabled"
            });
            enabled_text.innerText = "Wiki Redirects Disabled";
        }
    } else {
        updateSelectedChapter(e.target.id, e.target.value);
        browser.runtime.sendMessage({
            "type": "date",
            date_string: e.target.value
        });
    }
});