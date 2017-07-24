function parseURL(url) {
    var obj = {};

    var searchURL = window.location.search;
    if (searchURL.length > 0) {
        searchURL = searchURL.substring(1, searchURL.length);
        var params = searchURL.split("&");
        for (var p in params) {
            var pp = params[p].split('=');
            var k = pp[0];
            var v = pp[1];
            obj[k] = v;
        }
    }

    return obj;
}

function setURL() {
    [
        "#a-dash",
        "#a-tb",
        "#a-gr",
        "#a-dt",
        "#a-sp",
        "#a-hp"
    ].map(e => $(e)[0].href = getURL($(e)[0].href, { "ip": global_ip, "port": global_port, "db": global_dbname }));
}

function initPageURLs() {
    var params = parseURL(document.URL);
    if (Object.keys(params).length > 0) {
        global_ip = params["ip"];
        global_port = params["port"];
        global_dbname = params["db"];

        setURL();
    }
}