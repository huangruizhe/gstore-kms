function initEntityGraph(entity_id) {
    function initColor(r) {
        colorset = ["#A142FF", "#FF85C2", "#FFA142", "#FF4242"]
        r[0].color = "#007FFF";
            // r[1].color = "#A142FF",
            // r[2].color = "#FF85C2",
            // r[3].color = "#FFA142",
            // r[4].color = "#FF4242";

        for (var o = 1; o < r.length; o++) {
            var t = d3.color(colorset[o % 4]);
            r[o].color = t.brighter(1.5).toString()
        }
    }

    function initRadius(r) {
        r[0].radius = 18;
        // r[1].radius = 14,
        // r[2].radius = 14,
        // r[3].radius = 14,
        // r[4].radius = 14;
        for (var o = 1; o < r.length; o++)
            r[o].radius = 10
    }

    var canvas = document.querySelector("canvas"),
        width = 1300,
        height = 800;

    // mycsv = "id,name\n0,Geoff\n1,School\n2,Company\n3,Family\n4,Network\n5,Aaron\n6,Abbott\n7,Jacob\n8,James\n9,Kelvin\n10,Kendall\n11,Kendrick\n12,Leroy\n13,Leslie\n14,Lester\n15,Magnus\n16,Malcolm\n17,Melvin\n18,Perry\n19,Peter\n20,Peyton\n21,Royce\n22,Rufus\n23,Rupert\n24,Hadden\n25,Hadley\n26,Hadwin\n27,Hal\n28,Halbert\n29,Halden\n30,Hale\n31,Gilroy\n32,Glenn\n33,Goddard\n34,Godfrey\n35,Godwin\n36,Graham\n37,Grant\n38,Tobias\n39,Toby\n40,Todd\n41,Tony\n42,Travis\n43,Trent\n44,Trevor\n45,Tristan\n46,Troy\n47,Truman\n48,Tyler";

    function initGraph(nodes, edges) {
        var o = nodes.map(x => ({ id: x[0], name: x[1] }));

        var i = edges.map(x => ({ source: x[0], target: x[1], label: x[2], isuri: x[3] }));

        // for (var t = (o.length, 4), i = [], e = 1; e <= t; e++)
        //     i.push({ source: 0, target: e });

        // for (var e = t + 1; e < o.length; e++)
        //     i.push({ source: e % t + 1, target: e });

        // console.log(nodes);
        // console.log(edges);

        initColor(o),
            initRadius(o);

        var s = new relation;
        s.setNodes(o),
            s.setLinks(i),
            s.setCanvas(canvas),
            s.setSize(width, height),
            s.setRadius(12),
            s.setLinkLength(90),
            s.setCharge(-60),
            s.setShowEdgeLabel(document.showEdgeLabel == "true"),
            s.init(),
            s.run()
    }

    gstore.getEntityGraphData(
        entity_id,
        initGraph,
        function () { }
    )
}

// function getRowTr(s, p, o, timeStamp) {
//     var dataId = randomString(5);
//     var url = document.location.pathname + document.location.search;

//     var tdr0 = `<td><a href="${url}#${s}">${s}</a></td>`;
//     var tdr1 = `<td>${p}</td>`;
//     var tdr2;
//     if (o.indexOf('http://www') == 0) {
//         tdr2 = `<td><a href="${url}#${o}">${o}</a></td>`;
//     } else {
//         tdr2 = `<td>${o}</td>`;
//     }

//     var tr = document.createElement('tr');
//     tr.innerHTML = `${tdr0}${tdr1}${tdr2}<td align=\"center\"><button class=\"btn btn-primary btn-xs\" data-title=\"Edit\" data-toggle=\"modal\" data-target=\"#edit\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-pencil\"></span></button></td> <td align=\"center\"><button class=\"btn btn-danger btn-xs\" data-title=\"Delete\" data-toggle=\"modal\" data-target=\"#delete\" data-id=\"${dataId}\"><span class=\"glyphicon glyphicon-trash\"></span></button></td><td>${timeStamp}</td>`;
//     return tr;
// }

// function doInsertRow(table, s, p, o, on_success, on_fail) {
//     if (s.length == 0 || p.length == 0) {
//         alert("subject或predicate内容为空");
//         on_fail();
//         return;
//     }

//     var tr = getRowTr(s, p, o, getTimeStamp());

//     gstore.insertTriple(
//         s,
//         p,
//         o,
//         function () {
//             table.row.add(tr).draw();
//             on_success();
//         },
//         function () {
//             on_fail();
//         }
//     );
// }

// function doDelRow(table, tr, on_success, on_fail) {
//     var tds = tr.find('td');
//     var s = tds[0].innerText;
//     var p = tds[1].innerText;
//     var o = tds[2].innerText;

//     gstore.deleteTriple(
//         s, 
//         p, 
//         o,
//         function () {
//             tr.fadeOut('slow', () => { table.row(tr[0]).remove().draw(); });
//             on_success();
//         },
//         function () {
//             on_fail();
//         }
//     );
// }

// function doUpdateRow(table, tr, s, p, o, on_success, on_fail) {
//     gstore.updateTriple(
//         s,
//         p,
//         o,
//         function () {
//             var rowObj = table.row(tr[0]).data();
//             rowObj[0] = s;
//             rowObj[1] = p;
//             rowObj[2] = o;

//             table.row(tr[0]).data(rowObj).draw();

//             on_success();
//         },
//         function () {
//             on_fail();
//         }
//     );
// }