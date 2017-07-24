function testServer(ip, port, on_success, on_fail) {
    gstore.testServer(ip, port, on_success, on_fail);
}

function loadDB(dbname, on_success, on_fail) {
    gstore.loadDB(dbname, on_success, on_fail);
}

function unloadDB(on_success, on_fail) {
    gstore.unloadDB(on_success, on_fail);
}
