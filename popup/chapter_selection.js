function updateSelectedChapter(title, date_string) {
    let elem = document.getElementById("selected-date");
    let date = new Date(date_string);
    elem.innerText = date.toLocaleDateString() + " (" + title + ")";
    browser.storage.local.set({
        "chapter": title,
        "date": date
    })
}


let selected = (await browser.storage.local.get("chapter")).chapter || "1.00";

let selected_elem = document.getElementById(selected);
selected_elem.checked = true;
let volume = selected_elem.closest("details");
volume.open = true;
selected_elem.scrollIntoView({"block": "center"});
updateSelectedChapter(selected_elem.id, selected_elem.value);


let enabled_elem = document.getElementById("enabled");
enabled_elem.checked = (await browser.storage.local.get("enabled")).enabled || false;

let form = document.getElementsByTagName("form")[0];
form.addEventListener("change", (e) => {
    if (e.target.id === "enabled") {
        let enabled = e.target.checked;
        browser.storage.local.set({
            "enabled": enabled
        })
        if (enabled) {
            browser.runtime.sendMessage({
                "type": "enabled"
            });
        } else {
            browser.runtime.sendMessage({
                "type": "disabled"
            });
        }
    } else {
        updateSelectedChapter(e.target.id, e.target.value);
        browser.runtime.sendMessage({
            "type": "date",
            date_string: e.target.value
        });
    }
});