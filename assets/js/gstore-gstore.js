// serve as DAO for gStore

var gstore = {};

gstore.getTableData = function (title_condition, intro_condition, maxn, on_success, on_fail) {
    var clause1 = "";
    var clause2 = "";
    if (title_condition.length > 0) {
        clause1 = "FILTER regex(?name, \"" + title_condition + "\") ";
    }
    if (intro_condition.length > 0) {
        clause2 = "FILTER regex(?intro, \"" + intro_condition + "\") ";
    }

    var sparql = `select ?subject ?name ?intro where {?subject <http://www.founder.attr:name> ?name. ?subject <http://www.founder.attr:简介> ?intro. ${clause1} ${clause2}} limit ${maxn}`;
    console.log(sparql);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;
    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData-length: " + data.length);

            // parse json result
            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
            var resultset = [];

            // var vars = obj["head"]["vars"];
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                resultset.push([bindings[i]["subject"]["value"], bindings[i]["name"]["value"], bindings[i]["intro"]["value"]]);
            }

            on_success(resultset);
        }
    ).fail(function () {
        console.log("gstore.getTableData: failed");
        on_fail();
    });
}

gstore.insertTableData = function (uri, title, description, on_success, on_fail) {
    var triples = "";
    triples += `<${uri}> <http://www.founder.attr:name> "${title}". <${uri}> <http://www.founder.attr:简介> "${description}".`;
    var sparql = "insert data {" + triples + "}";
    console.log(sparql);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;
    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);
            on_success();
        }
    ).fail(function () {
        console.log("gstore.insertTableData: failed");
        on_fail();
    });
}

gstore.deleteTableData = function (uri, on_success, on_fail) {
    // sparql1
    var sparql1 = "delete where { <" + uri + "> ?p ?o.}";
    console.log(sparql1);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql1}\"`;
    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);

            // sparql2
            var sparql2 = "delete where { ?s ?p <" + uri + ">.}";
            console.log(sparql2);

            var url2 = `http://${global_ip}:${global_port}/query/\"${sparql2}\"`;
            $.get(
                encodeURI(url),
                function (data, status) {
                    console.log("Status: " + status + "\nData: " + data);
                    on_success();
                }
            ).fail(function () {
                console.log("gstore.insertTableData: sparql2 failed");
                on_fail();
            });
        }
    ).fail(function () {
        console.log("gstore.insertTableData: sparql1 failed");
        on_fail();
    });
}

gstore.updateTableData = function (uri, title, description, on_success, on_fail) {
    // delete sparql1
    var sparql1 = "delete where { <" + uri + "> <http://www.founder.attr:name> ?o.}";
    console.log(sparql1);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql1}\"`;
    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);

            // delete sparql2
            var sparql2 = "delete where { <" + uri + "> <http://www.founder.attr:简介> ?o.}";
            console.log(sparql2);

            var url2 = `http://${global_ip}:${global_port}/query/\"${sparql2}\"`;
            $.get(
                encodeURI(url2),
                function (data, status) {
                    console.log("Status: " + status + "\nData: " + data);

                    // insert new sparqls                    
                    gstore.insertTableData(uri, title, description, on_success, on_fail);
                }
            ).fail(function () {
                console.log("gstore.updateTableData.delete: sparql2 failed");
                on_fail();
            });
        }
    ).fail(function () {
        console.log("gstore.updateTableData.delete: sparql1 failed");
        on_fail();
    });
}

gstore.query = function (sparql, on_success, on_fail) {
    var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;

    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData-length: " + data.length);            
            on_success(data, status);
        }
    ).fail(function() {
        console.log("gstore.query: failed");
        on_fail();
    });
}