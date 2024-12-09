let currentChapterDate = new Date((await chrome.storage.local.get("date")).date ?? "2017/3/3");

// TODO: share function between chrome and firefox implementation
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


const params = new URLSearchParams(window.location.search);

if (params.has("path")) {
    const path = "/"+params.get("path");
    findOldPage(path).then(redirect => {
        console.log(redirect.redirectUrl)
        window.location = redirect.redirectUrl;
    });
} else {
    document.getElementById("text").innerText = "Error: missing parameter"
}