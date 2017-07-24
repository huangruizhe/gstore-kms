function getRowTr(s, p, o, timeStamp) {
    var dataId = randomString(5);
    var maxlen = 70;

    // title = randomString(7);
    // description = randomString(12);
    var url = document.location.pathname.replace("gstore-table", "gstore-entity") + document.location.search;

    var tdr0 = `<td><a href="${url}#${s}">${s}</a></td>`;
    var tdr1 = `<td>${p}</td>`;
    var tdr2;
    if (o.indexOf('http://www') == 0) {
        tdr2 = `<td><a href="${url}#${o}">${o}</a></td>`;
    } else {
        if (o.length > maxlen) {
            var o = o.substring(0, maxlen) + " ...";
        }
        tdr2 = `<td>${o}</td>`;
    }

    var tr = document.createElement('tr');
    tr.innerHTML = `${tdr0}${tdr1}${tdr2}<td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td><td>${timeStamp}</td>`;
    return tr;
}

function doInsertRow(table, s, p, o, on_success, on_fail) {
    if (s.length == 0 || p.length == 0) {
        alert("subject或predicate内容为空");
        on_fail();
        return;
    }

    var tr = getRowTr(s, p, o, getTimeStamp());

    gstore.insertTriple(
        s,
        p,
        o,
        function () {
            table.row.add(tr).draw();
            on_success();
        },
        function () {
            on_fail();
        }
    );
}

function doDelRow(table, tr, on_success, on_fail) {
    var tds = tr.find('td');
    var s = tds[0].innerText;
    var p = tds[1].innerText;
    var o = tds[2].innerText;

    gstore.deleteTriple(
        s,
        p,
        o,
        function () {
            tr.fadeOut('slow', () => { table.row(tr[0]).remove().draw(); });
            on_success();
        },
        function () {
            on_fail();
        }
    );
}

function doUpdateRow(table, tr, s, p, o, on_success, on_fail) {
    gstore.updateTriple(
        s,
        p,
        o,
        function () {
            var url = document.location.pathname.replace("gstore-table", "gstore-entity") + document.location.search;

            var rowObj = table.row(tr[0]).data();
            rowObj[0] = `<a href="${url}#${s}">${s}</a>`;
            rowObj[1] = p;
            rowObj[2] = o;

            table.row(tr[0]).data(rowObj).draw();

            on_success();
        },
        function () {
            on_fail();
        }
    );
}

function loadTable(table, condition, maxn, on_success, on_fail) {

    gstore.getSPO(
        condition,
        maxn,
        function (resultset) {
            var timeStamp = getTimeStamp();

            var newRows = resultset.map(function (r) {
                return getRowTr(r[0], r[1], r[2], timeStamp);
            });

            table.rows.add(newRows).draw();

            on_success();
        },
        on_fail
    );
}

var buttonId = undefined;