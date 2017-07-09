function getRowHtml(title, description, uri) {
    var dataId = randomString(5);

    var maxlen = 80;

    var rawHtml;
    if (description.length > maxlen) {
        var shortDescription = description.substring(0, maxlen) + " ...";
        rowHtml = `<tr> <td data-uri='${uri}'>${title}</td> <td title='${description}'>${shortDescription}</td> <td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td> </tr>`;
    } else {
        rowHtml = `<tr> <td data-uri='${uri}'>${title}</td> <td>${description}</td> <td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td> </tr>`;        
    }
    return rowHtml;
}

function doInsertRow(tb, title, description) {
    var uri = "http://www.founder/" + randomString(5);
    var rowHtml = getRowHtml(title, description, uri);

    // console.log(title);
    // console.log(description);

    var tr = document.createElement('tr');
    tr.innerHTML = rowHtml;

    tb.prepend(tr);
}

function doDelRow(tr) {
    tr.fadeOut('slow', () => tr.remove());
}

function doUpdateRow(tr, title, description) {
    tr.find('td:first-child').text(title);
    tr.find('td:nth-child(2)').text(description);
}

var buttonId = undefined;

function loadAllData(n, on_success, on_fail) {
    var sparql = "select ?subject ?name ?intro where {?subject <http://www.founder.attr:name> ?name. ?subject <http://www.founder.attr:简介> ?intro. } limit " + n;

    var url = `http://${global_ip}:${global_port}/query/\"${sparql}\"`;
    $.get(
        encodeURI(url),
        on_success
    ).fail(function () {
        on_fail();
    });
}

function parseAllData (data) {
    var obj = JSON.parse(data.replace(/"value": "\s+/g,'"value": "').replace(/\s+" }/g, '" }'));
    var result = [];

    // var vars = obj["head"]["vars"];
    var bindings = obj["results"]["bindings"];
    for (var i in bindings) {
        result.push([bindings[i]["subject"]["value"], bindings[i]["name"]["value"], bindings[i]["intro"]["value"]]);
    }

    return result;
}

