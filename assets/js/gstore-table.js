function getRowTr(title, description, uri, timeStamp) {
    var dataId = randomString(5);
    var maxlen = 70;

    // title = randomString(7);
    // description = randomString(12);
    var url = document.location.pathname.replace("gstore-table", "gstore-entity") + document.location.search;

    var innerHtml;
    if (description.length > maxlen) {
        var shortDescription = description.substring(0, maxlen) + " ...";
        innerHtml = `<td data-uri='${uri}'><a href="${url}#${uri}">${title}</a></td> <td title='${description}'>${shortDescription}</td> <td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td><td>${timeStamp}</td>`;
    } else {
        innerHtml = `<td data-uri='${uri}'><a href="${url}#${uri}">${title}</a></td> <td>${description}</td> <td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td><td>${timeStamp}</td>`;
    }

    var tr = document.createElement('tr');
    tr.innerHTML = innerHtml;

    return tr;
}

function doInsertRow(table, title, description, on_sucess, on_fail) {
    if (title.length == 0) {
        alert("知识元名称为空");
        on_fail();
        return;
    }

    var uri = "http://www.founder/" + randomString(5);
    var tr = getRowTr(title, description, uri, getTimeStamp());

    // console.log(title);
    // console.log(description);

    gstore.insertTableData(
        uri,
        title,
        description,
        function () {
            table.row.add(tr).draw();
            on_sucess();
        },
        function () {
            on_fail();
        }
    );
}

function doDelRow(table, tr, on_success, on_fail) {
    // This would have problem, because it does not change the dataTable internally
    // TODO: use dataTable built-in row.remove() function

    uri = tr[0].firstElementChild.getAttribute("data-uri");
    gstore.deleteTableData(
        uri,
        function () {
            tr.fadeOut('slow', () => { table.row(tr[0]).remove().draw(); });
            on_success();
        },
        function () {
            on_fail();
        }
    );
}

function doUpdateRow(table, tr, title, description, on_success, on_fail) {
    // tr.find('td:first-child').text(title);
    // tr.find('td:nth-child(2)').text(description);

    uri = tr[0].firstElementChild.getAttribute("data-uri");
    gstore.updateTableData(
        uri,
        title,
        description,
        function () {
            var rowObj = table.row(tr[0]).data();
            rowObj[0] = title;
            rowObj[1] = description;

            table.row(tr[0]).data(rowObj).draw();

            on_success();
        },
        function () {
            on_fail();
        }
    );
}

var buttonId = undefined;

function loadAllData(n, on_success, on_fail) {
    var sparql = "select ?subject ?name ?intro where {?subject <http://www.founder.attr:name> ?name. ?subject <http://www.founder.attr:简介> ?intro. } limit " + n;
    console.log(sparql);

    var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;
    $.get(
        encodeURI(url),
        on_success
    ).fail(function () {
        on_fail();
    });
}

function parseAllData(data) {
    var obj = JSON.parse(data.replace(/"value": "\s+/g, '"value": "').replace(/\s+" }/g, '" }'));
    var result = [];

    // var vars = obj["head"]["vars"];
    var bindings = obj["results"]["bindings"];
    for (var i in bindings) {
        result.push([bindings[i]["subject"]["value"], bindings[i]["name"]["value"], bindings[i]["intro"]["value"]]);
    }

    return result;
}

// function searchData(n, title1, intro1, on_success, on_fail) {
//     var clause1 = "";
//     var clause2 = "";
//     if (title1.length > 0) {
//         clause1 = "FILTER regex(?name, \"" + title1 + "\") ";
//     }
//     if (intro1.length > 0) {
//         clause2 = "FILTER regex(?intro, \"" + intro1 + "\") ";
//     }

//     var sparql = `select ?subject ?name ?intro where {?subject <http://www.founder.attr:name> ?name. ?subject <http://www.founder.attr:简介> ?intro. ${clause1} ${clause2}} limit ${n}`;
//     console.log(sparql);

//     var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;
//     $.get(
//         encodeURI(url),
//         on_success
//     ).fail(function () {
//         on_fail();
//     });
// }

function loadTable(table, title_condition, intro_condition, maxn) {

    function on_success(resultset) { // on_success
        var timeStamp = getTimeStamp();

        var newRows = resultset.map(function (r) {
            return getRowTr(r[1], r[2], r[0], timeStamp);
        });

        table.rows.add(newRows).draw();
    }

    function on_fail() { // on_fail
    }

    gstore.getTableData(
        title_condition,
        intro_condition,
        maxn,
        on_success,
        on_fail
    );
}

