const targetPage = "https://wiki.wanderinginn.com/*";

const currentChapterDate = new Date(2020, 1, 19); // Chapter 7.00 example

function findOldPage(url_path) {
    return new Promise(function (resolve, reject) {
        const url = "https://wiki.wanderinginn.com/history" + url_path + "?offset=&limit=1&date-range-to="
            + currentChapterDate.getUTCFullYear() + "-" + currentChapterDate.getUTCMonth() + "-" + currentChapterDate.getUTCDay();

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