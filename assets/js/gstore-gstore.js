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

            var entity = {};
            var nbuffer = {};
            var slast = "";
            var bindings = obj["results"]["bindings"];
            for (var i in bindings) {
                s = bindings[i]["s"]["value"];
                p = bindings[i]["p"]["value"];
                o = bindings[i]["o"]["value"];

                p = p.substring(p.lastIndexOf('.') + 1);

                if (entity[s] == undefined) {
                    entity[s] = {};
                    entity[s]["type"] = [];
                }

                if (p.indexOf("isa") >= 0) {
                    entity[s]["type"].push(o.substring(o.lastIndexOf('.') + 1));
                } else if (p.indexOf("name") >= 0) {
                    entity[s]["name"] = o;
                } else if (p.indexOf("intro") >= 0) {
                    entity[s]["intro"] = o;
                } else {
                    console.log("error in gstore.getGraphNodes: p=" + p);
                }
            }

            for (var s in entity) {
                var new_node = {};
                new_node["id"] = s.substring(s.lastIndexOf('/') + 1);
                new_node["label"] = entity[s]["name"]; // + "(" + entity[s]["intro"] + ")";
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

            mygraph["edges"] = edges;

            on_success(mygraph);
        },
        function () {
            on_fail();
        }
    );
}

gstore.getInfoPanel = function (id, on_success, on_fail) {
    var sparql = `select ?p ?o where {<http://www.summba.com/ontologies/music/${id}> ?p ?o.}`;
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

            // get names of uri neighbors

            var sparql = `select ?o ?name where {{<${uri}> ?p ?o. ?o <http://gstore.attr.name> ?name.} UNION {?o ?p <${uri}>. ?o <http://gstore.attr.name> ?name.}}`;
            gstore.query(
                sparql,
                function (data, status) {
                    var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
                    var name_dict = {};
                    var bindings = obj["results"]["bindings"];
                    for (var i in bindings) {
                        var o = bindings[i]["o"]["value"];
                        var name = bindings[i]["name"]["value"];

                        name_dict[o] = name;
                    }

                    var nodes = [[uri, uri.substring(uri.lastIndexOf('/') + 1)]];
                    var edges = [];
                    var nodeset = { uri: "" };

                    // out edges
                    for (var i in entity["out"]) {
                        var edge = entity["out"][i];
                        if (edge[2]) {
                            edges.push([uri, edge[1], edge[0], true]);
                            if (nodeset[edge[1]] == undefined) {
                                nodeset[edge[1]] = "";
                                nodes.push([edge[1], edge[1].substring(edge[1].lastIndexOf('/') + 1)]);
                                if (edge[0] != "isa") {
                                    var ll = randomString(4);
                                    var name = name_dict[edge[1]];
                                    nodes.push([ll, name.substring(name.lastIndexOf('/') + 1)]);
                                    edges.push([edge[1], ll, "name", false]);
                                }
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
                                if (edge[0] != "isa") {
                                    var ll = randomString(4);
                                    var name = name_dict[edge[1]];
                                    nodes.push([ll, name.substring(name.lastIndexOf('/') + 1)]);
                                    edges.push([edge[1], ll, "name", false]);
                                }
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
                    console.log("error in gstore.getEntityGraphData")
                    on_fail();
                }
            );
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
    console.log(sparql);

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
    console.log(sparql);

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



