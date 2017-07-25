// serve as DAO for gStore

var gstore = {};

gstore.testServer = function (ip, port, on_success, on_fail) {
    // https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
    // https://api.jquery.com/jQuery.get/

    var rs = $.get(
        `http://${ip}:${port}/load/`,
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);
            on_success(data, status);
        }
    ).fail(function () {
        on_fail();
        // alert("test server GET failed");
    });
}

gstore.loadDB = function (dbname, on_success, on_fail) {
    // unload first
    try {
        $.get(
            `http://${global_ip}:${global_port}/unload`,
            function (data, status) {
                console.log("Status: " + status + "\nData: " + data);
            }
        );
    } catch (e) { }

    // then load the database
    var rs = $.get(
        `http://${global_ip}:${global_port}/load/${dbname}`,
        function (data, status) {
            console.log("Status: " + status + "\nData: " + data);
            on_success(data, status);
        }
    ).fail(function () {
        on_fail();
        // alert("load db GET failed");
    });
}

gstore.unloadDB = function (on_success, on_fail) {
    // unload first
    try {
        $.get(
            `http://${global_ip}:${global_port}/unload`,
            function (data, status) {
                console.log("Status: " + status + "\nData: " + data);
                on_success(data, status);
            }
        ).fail(function () {
            on_fail();
            // alert("load db GET failed");
        });
    } catch (e) { }
}


gstore.getSPO = function (condition, maxn, on_success, on_fail) {
    var clause1 = "",
        clause2 = "",
        clause3 = "";

    if (condition["s"] != undefined && condition["s"].length > 0) {
        clause1 = "FILTER regex(str(?s), \"" + condition["s"] + "\") ";
    }
    if (condition["p"] != undefined && condition["p"].length > 0) {
        clause2 = "FILTER regex(str(?p), \"" + condition["p"] + "\") ";
    }
    if (condition["o"] != undefined && condition["o"].length > 0) {
        clause3 = "FILTER regex(str(?o), \"" + condition["o"] + "\") ";
    }

    var sparql = `select ?s ?p ?o where {?s ?p ?o. ${clause1} ${clause2} ${clause3}}`;
    if (maxn > 0) {
        sparql += ` limit ${maxn}`
    }

    gstore.query(
        sparql,
        function (data, status) {
            console.log("Status: " + status + "\nData-length: " + data.length);

            // parse json result
            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
            var resultset = obj["results"]["bindings"].map(
                r => [r["s"]["value"], r["p"]["value"], r["o"]["value"]]
            );

            on_success(resultset);
        },
        function () {
            console.log("gstore.getTableData: failed");
            on_fail();
        }
    );
}

gstore.query = function (sparql, on_success, on_fail) {
    console.log(sparql);
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
    var sparql = `select ?s ?p ?o where {?s ?p ?o. FILTER(!isLiteral(?o))}`;

    gstore.query(
        sparql,
        function (data, status) {
            // node example: {"color":"#059e96","label":"eglinski","attributes":{"Modularity Class":"145"},"y":-1269.4113,"x":-722.0319,"id":"eglinski","size":1.379771}
            // edge example: {"source":"since1968","attributes":{"id":"11794"},"target":"vlandham","id":"11794","label":""}

            var nodes = [], edges = [];

            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));

            var entity = {};
            var nbuffer = {};
            var slast = "";
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                s = bindings[i]["s"]["value"];
                p = bindings[i]["p"]["value"];
                o = bindings[i]["o"]["value"];

                // node (only keep distint id)
                entity[s] = {};
                entity[o] = {};

                //     if (p.indexOf("isa") >= 0) {
                //         entity[s]["type"].push(o.substring(o.lastIndexOf('.') + 1));
                //     } else if (p.indexOf("name") >= 0) {
                //         entity[s]["name"] = o;
                //     } else if (p.indexOf("intro") >= 0) {
                //         entity[s]["intro"] = o;
                //     } else {
                //         console.log("error in gstore.getGraphNodes: p=" + p);
                //     }

                // edge
                var new_edge = {};
                new_edge["source"] = s;
                new_edge["target"] = o;
                new_edge["id"] = i; // randomString(6);
                new_edge["label"] = p;

                edges.push(new_edge);
            }

            for (var s in entity) {
                var new_node = {};
                new_node["id"] = s;
                new_node["label"] = s.substring(s.lastIndexOf('/') + 1); // entity[s]["name"]; // + "(" + entity[s]["intro"] + ")";
                new_node["color"] = Please.make_color();
                nodes.push(new_node);
            }

            on_success({ "nodes": nodes, "edges": edges }, call_back);
        },
        function () {
            on_fail();
        }
    );
}

gstore.getEntityPanelInfo = function (id, on_success, on_fail) {
    var sparql = `select ?p ?o where {<${id}> ?p ?o.}`;
    gstore.query(
        sparql,
        function (data, status) {
            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
            var resultset = {};
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                var p = bindings[i]["p"]["value"];
                var o = bindings[i]["o"]["value"];

                p = p.substring(p.lastIndexOf('.') + 1);
                o = o.substring(o.lastIndexOf('/') + 1);

                if (resultset[p] == undefined) {
                    resultset[p] = [];
                }
                resultset[p].push(o);
            }

            on_success(resultset);
        },
        function () {
            on_fail();
        }
    );
}

gstore.getEntityGraphData = function (uri, on_success, on_fail) {
    var entities = {};

    gstore.getEntityNeighbors(
        uri,
        "",
        function (entity) {

            var nodes = [[uri, uri.substring(uri.lastIndexOf('/') + 1)]];
            var edges = [];
            var nodeset = { uri: "" };

            // out edges
            for (var i in entity["out"]) {
                var edge = entity["out"][i];
                if (edge[2]) {  // isURI
                    edges.push([uri, edge[1], edge[0], true]);
                    if (nodeset[edge[1]] == undefined) {
                        nodeset[edge[1]] = "";
                        nodes.push([edge[1], edge[1].substring(edge[1].lastIndexOf('/') + 1)]);
                    }
                } else {
                    if (edge[0] != "tag") {
                        var ll = randomString(4);
                        nodes.push([ll, edge[1].substring(edge[1].lastIndexOf('/') + 1)]);
                        edges.push([uri, ll, edge[0], false]);
                    }
                }
            }

            // in edges
            for (var i in entity["in"]) {
                var edge = entity["in"][i];
                if (edge[2]) {
                    edges.push([edge[1], uri, edge[0], true]);
                    if (nodeset[edge[1]] == undefined) {
                        nodeset[edge[1]] = "";
                        nodes.push([edge[1], edge[1].substring(edge[1].lastIndexOf('/') + 1)]);
                    }
                } else {
                    console.log("gstore.getEntityGraphData: cannot come here");
                }
            }

            // sort out edges
            var new_edges = [];
            var edge_dict = {};
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];

                var eid;
                if (edge[0] < edge[1]) {
                    eid = edge[0] + edge[1];
                } else {
                    eid = edge[1] + edge[0];
                }

                if (edge_dict[eid] == undefined) {
                    new_edges.push(edge);
                    edge_dict[eid] = new_edges.length - 1;
                } else {
                    new_edges[edge_dict[eid]][2] += ("/" + edge[2]);
                }
            }

            on_success(nodes, new_edges);
        },
        function () {
            console.log("error in gstore.getEntityGraphData: 1");
            on_fail();
        }
    )
}

gstore.getEntityNeighbors = function (uri, pred_filter, on_success, on_fail) {
    var entity = { "uri": uri, "out": [], "in": [] };
    gstore.getEntityOutLinks(
        uri,
        pred_filter,
        function (outedges) {
            entity["out"] = outedges;

            gstore.getEntityInLinks(
                uri,
                pred_filter,
                function (inedges) {
                    entity["in"] = inedges;

                    on_success(entity);
                },
                function () {
                    console.log("error in gstore.getEntityNeighbors: in");
                    on_fail();
                }
            );
        },
        function () {
            console.log("error in gstore.getEntityNeighbors: out");
            on_fail();
        }
    );
}

gstore.getEntityOutLinks = function (uri, pred_filter, on_success, on_fail) {
    var con1 = "";
    if (pred_filter != undefined && pred_filter.length > 0) {
        con1 = "FILTER regex(str(?p), \"" + pred_filter + "\") ";
    }

    var sparql = `select ?p ?o where {<${uri}> ?p ?o. ${con1}}`;
    gstore.query(
        sparql,
        function (data, status) {
            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
            var outedges = [];
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                var p = bindings[i]["p"]["value"];
                var o = bindings[i]["o"]["value"];
                var isUri = (bindings[i]["o"]["type"] == "uri");

                p = p.substring(p.lastIndexOf('.') + 1);

                outedges.push([p, o, isUri]); // outedge
            }

            // sparql = `select ?s ?p where {?s ?p <${uri}>.}`;

            on_success(outedges);
        },
        function () {
            on_fail();
        }
    );
}

gstore.getEntityInLinks = function (uri, pred_filter, on_success, on_fail) {
    var con1 = "";
    if (pred_filter != undefined && pred_filter.length > 0) {
        con1 = "FILTER regex(str(?p), \"" + pred_filter + "\") ";
    }

    var sparql = `select ?s ?p where {?s ?p <${uri}>. ${con1}}`;
    gstore.query(
        sparql,
        function (data, status) {
            var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
            var inedges = [];
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                var s = bindings[i]["s"]["value"];
                var p = bindings[i]["p"]["value"];
                var isUri = (bindings[i]["s"]["type"] == "uri");

                p = p.substring(p.lastIndexOf('.') + 1);

                inedges.push([p, s, isUri]); // inedge
            }

            on_success(inedges);
        },
        function () {
            on_fail();
        }
    );
}

gstore.insertTriple = function (s, p, o, on_success, on_fail) {
    var triples = `<${s}> <${p}> "${o}"`;

    // at the moment, only treat ?o as literal

    var sparql = "insert data {" + triples + "}";

    gstore.query(
        sparql,
        on_success,
        on_fail
    );
}

gstore.deleteTriple = function (s, p, o, on_success, on_fail) {
    var triples = `<${s}> <${p}> "${o}"`;

    // at the moment, only treat ?o as literal

    var sparql = "delete data {" + triples + "}";

    gstore.query(
        sparql,
        on_success,
        on_fail
    );
}

gstore.updateTriple = function (s, p, o, on_success, on_fail) {
    gstore.insertTriple(
        s,
        p,
        o,
        function () {
            gstore.deleteTriple(
                s,
                p,
                o,
                on_success,
                on_fail,
            );
        },
        function () {
            console.log("error in gstore.updateTriple");
        }
    )
}



