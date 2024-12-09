let params = new URLSearchParams(window.location.search);
if (params.has("title")) {
    history.replaceState({}, "", "https://wiki.wanderinginn.com/"+params.get("title"))
}