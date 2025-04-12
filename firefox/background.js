const targetPage = "https://wiki.wanderinginn.com/*";

let currentChapterDate = new Date(2017, 3, 3);
let enabled = true;
browser.storage.local.get(["date", "enabled"]).then(data => {
    currentChapterDate = new Date(data.date);
    enabled = data.enabled;
});

browser.runtime.onMessage.addListener((message) => {
    console.log(message);
    if (message.type === "enabled") {
        enabled = true;
    } else if (message.type === "disabled") {
        enabled = false;
    } else if (message.type === "date") {
        currentChapterDate = new Date(message.date_string);
    }
});

function findOldPage(url_path) {
    return new Promise(function (resolve, reject) {
        const url = "https://wiki.wanderinginn.com/history" + url_path + "?offset=&limit=1&date-range-to="
            + currentChapterDate.getUTCFullYear() + "-" + (currentChapterDate.getUTCMonth() + 1) + "-" + currentChapterDate.getUTCDate();

        let req = new XMLHttpRequest();
        req.open("GET", url);
        req.responseType = "document";
        req.overrideMimeType("text/html");

        req.onload = function () {
            if (req.status === 200) {
                const redirect_url = req.responseXML
                    ?.getElementById("pagehistory")
                    ?.getElementsByClassName("mw-changeslist-date")[0]
                    ?.href;
                if (redirect_url !== undefined) {
                    resolve({
                        redirectUrl: redirect_url
                    });
                    return;
                }
            }
            resolve({
                redirectUrl: "https://wiki.wanderinginn.com/history" + url_path + "?dir=prev&limit=5"
            });
        };

        req.onerror = function () {
            resolve({
                redirectUrl: "https://wiki.wanderinginn.com/history" + url_path + "?dir=prev&limit=5"
            });
        };

        req.send();
    });
}

function redirectToOldPage(e) {
    console.log(currentChapterDate);
    if (!enabled) {
        return;
    }

    const url = new URL(e.url);
    const url_path = url.pathname;

    if (url_path === "/" || url_path.startsWith("/index.php") || url_path.startsWith("/history") || url.hash.includes("/media")) {
        console.log("Special page: " + e.url); // TODO: remove
        return;
    }
    return findOldPage(url_path);
}

browser.webRequest.onBeforeRequest.addListener(
    redirectToOldPage,
    {urls: [targetPage], types: ["main_frame"]},
    ["blocking"]
);