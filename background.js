const targetPage = "https://wiki.wanderinginn.com/*";

function redirectToOldPage(e) {
    const url_path = new URL(e.url).pathname;

    if (url_path === "/" || url_path.startsWith("/index.php") || url_path.includes("#/media") || url_path.startsWith("/history")) {
        console.log("Special page: " + e.url); // TODO: remove
        return;
    }

    let redirect_url = "https://wiki.wanderinginn.com/history" + url_path + "?dir=prev&limit=5";

    return {
        redirectUrl: redirect_url
    };
}

browser.webRequest.onBeforeRequest.addListener(
    redirectToOldPage,
    {urls: [targetPage], types: ["main_frame"]},
    ["blocking"]
);