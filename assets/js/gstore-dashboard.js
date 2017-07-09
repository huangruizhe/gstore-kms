var global_ip = "localhost";
var global_port = "9000";
var global_dbname = "null";

function testServer (ip, port, on_success, on_fail) {
    // https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
    // https://api.jquery.com/jQuery.get/

    var rs = $.get(
        `http://${ip}:${port}/load/`,
        on_success
    ).fail(function () {
        on_fail();
        // alert("test server GET failed");
    });
}

function loadDB (dbname, on_success, on_fail) {
    // unload first
    try {
        $.get(
            `http://${global_ip}:${global_port}/unload`,
            function (data, status) {
                console.log("Status: " + status + "\nData: " + data);
            }
        );
    } catch (e) {}

    // then load the database
    var rs = $.get(
        `http://${global_ip}:${global_port}/load/${dbname}`,
        on_success
    ).fail(function () {
        on_fail();
        // alert("load db GET failed");
    });
}
