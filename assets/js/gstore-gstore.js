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

    // var sparql = `select ?subject ?name ?intro where {?subject <http://www.founder.attr:name> ?name. ?subject <http://www.founder.attr:简介> ?intro. ${clause1} ${clause2}} limit ${maxn}`;
    var sparql = `select ?subject ?name ?intro where {?subject <http://gstore.attr.name> ?name. ?subject <http://gstore.attr.intro> ?intro. ${clause1} ${clause2}}`;
    if (maxn > 0) {
        sparql += ` limit ${maxn}`
    }

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
    // triples += `<${uri}> <http://www.founder.attr:name> "${title}". <${uri}> <http://www.founder.attr:简介> "${description}".`;
    triples += `<${uri}> <http://gstore.attr.name> "${title}". <${uri}> <http://gstore.attr.intro> "${description}".`;
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
    // var sparql1 = "delete where { <" + uri + "> <http://www.founder.attr:name> ?o.}";
    var sparql1 = "delete where { <" + uri + "> <http://gstore.attr.name> ?o.}";
    console.log(sparql1);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql1}\"`;
    $.get(
        encodeURI(url),
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);

            // delete sparql2
            // var sparql2 = "delete where { <" + uri + "> <http://www.founder.attr:简介> ?o.}";
            var sparql2 = "delete where { <" + uri + "> <http://gstore.attr.name> ?o.}";
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
    ).fail(function () {
        console.log("gstore.query: failed");
        on_fail();
    });
}

gstore.getGraphData = function (call_back, on_success, on_fail) {
    var mygraph = {};
    gstore.getGraphNodes(
        mygraph,
        function (g) {
            on_success(g, call_back);
        },
        function () {
            console.log("gstore.getGraphData: error");
            on_fail();
        }
    );
}

gstore.getGraphNodes = function (mygraph, on_success, on_fail) {
    // var sparql = "select ?s ?p ?o where {?s ?p ?o. FILTER (!regex(str(?p), \"tag\") && !regex(str(?p), \"intro\") && (regex(str(?p), \"attr\") || regex(str(?p), \"isa\")))}";
    // var sparql = "select ?s ?o where {?s <http://gstore.link.isa> ?o.}";
    var sparql = "select ?s ?p ?o where {?s ?p ?o. FILTER (regex(str(?p), \"intro\") || regex(str(?p), \"name\") || regex(str(?p), \"isa\"))}";

    gstore.query(
        sparql,
        function (data, status) {
            // {"color":"#059e96","label":"eglinski","attributes":{"Modularity Class":"145"},"y":-1269.4113,"x":-722.0319,"id":"eglinski","size":1.379771}
            // {"source":"since1968","attributes":{"id":"11794"},"target":"vlandham","id":"11794","label":""}

            nodes = [];

            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));

            var entities = {};
            var nbuffer = {};
            var slast = "";
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                s = bindings[i]["s"]["value"];
                p = bindings[i]["p"]["value"];
                o = bindings[i]["o"]["value"];

                p = p.substring(p.lastIndexOf('.') + 1);

                if (entities[s] == undefined) {
                    entities[s] = {};
                    entities[s]["type"] = [];
                }

                if (p.indexOf("isa") >= 0) {
                    entities[s]["type"].push(o.substring(o.lastIndexOf('.') + 1));
                } else if (p.indexOf("name") >= 0) {
                    entities[s]["name"] = o;
                } else if (p.indexOf("intro") >= 0) {
                    entities[s]["intro"] = o;
                } else {
                    console.log("error in gstore.getGraphNodes: p=" + p);
                }
            }

            for (var s in entities) {
                var new_node = {};
                new_node["id"] = s.substring(s.lastIndexOf('/') + 1);
                new_node["label"] = entities[s]["name"]; // + "(" + entities[s]["intro"] + ")";
                new_node["color"] = Please.make_color();
                nodes.push(new_node);
            }

            mygraph["nodes"] = nodes;

            gstore.getGraphEdges(mygraph, on_success, on_fail);
        },
        function () {
            on_fail();
        }
    );
}

gstore.getGraphEdges = function (mygraph, on_success, on_fail) {
    var sparql = "select ?s ?p ?o where {?s ?p ?o. FILTER ( regex(str(?p), \"link\") && !regex(str(?p), \"isa\"))}";

    gstore.query(
        sparql,
        function (data, status) {
            // {"source":"since1968","attributes":{"id":"11794"},"target":"vlandham","id":"11794","label":""}

            var edges = [];

            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));

            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                s = bindings[i]["s"]["value"];
                p = bindings[i]["p"]["value"];
                o = bindings[i]["o"]["value"];

                var new_edge = {};
                new_edge["source"] = s.substring(s.lastIndexOf('/') + 1);
                new_edge["target"] = o.substring(o.lastIndexOf('/') + 1);
                new_edge["id"] = i; // randomString(6);
                new_edge["label"] = p.substring(p.lastIndexOf('.') + 1);

                edges.push(new_edge);
            }

            console.log("edges.length=" + edges.length)

            mygraph["edges"] = edges;

            on_success(mygraph);
        },
        function () {
            on_fail();
        }
    );
}
