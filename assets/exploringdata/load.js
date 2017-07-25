var twitter_list = function (heading, screen_names) {
  var html = '';
  if (screen_names.length > 0) {
    list = [];
    for (i in screen_names) {
      var sn = screen_names[i];
      // make sure this is a node in the graph, could still be a rejected query
      if (visgexf.queryHasResult(sn))
        list.push('<a href="#' + sn + '">' + sn + '</a>')
    }
    html += '<h4>' + heading + '</h4>' + list.join(' - ');
  }
  return html;
};

var nodeClick = function (Graph) {
  Graph.sig.bind('upnodes', function (event) {
    hnode = Graph.sig.getNodes(event.content)[0];
    nodeClickResponse(hnode)
  });
};

var nodeClickResponse = function (node) {
  gstore.getEntityPanelInfo(
    node.id,
    function (resultset) {
      var desc = "";

      var node_url = document.location.pathname.replace("gstore-graph", "gstore-entity") + document.location.search + "#http://www.summba.com/ontologies/music/" + node.id;
      desc += '<i class="fa fa-home"></i> <a href="' + node_url + '">知识元详情</a>';

      console.log(resultset);
      if (resultset["intro"] != undefined) {
        desc += '<blockquote><p>' + resultset["intro"] + '</p></blockquote>';
      } else {
        desc += '<blockquote><p>' + '没有简介' + '</p></blockquote>';
      }

      for (var p in resultset) {
        desc += '<h4>' + p + '</h4><span class="property-span">' + resultset[p].join(', ') + '</span>';
      }

      desc = "<div id=\"div-desc\">" + desc + "</div>";

      name = node.id.substring(node.id.lastIndexOf('/') + 1);

      nodeinfo(name, desc);

    },
    function () {
      console.log("error in nodeClick");
    }
  );
}

$(function () {
  var props = {
    drawing: {
      defaultLabelColor: '#fff',
      defaultLabelSize: 12,
      defaultLabelBGColor: '#fff',
      defaultLabelHoverColor: '#000',
      labelThreshold: 6,
      defaultEdgeType: 'curve'
    },
    graph: {
      minNodeSize: 5,
      maxNodeSize: 5,
      minEdgeSize: 1.5,
      maxEdgeSize: 1.5
    },
    forceLabel: 1,
    type: 'directed'
  }

  visgexf.init('sig', '/gexf/visualisingdata-census-twitter-processed.json', props, function () {
    nodeClick(visgexf);
  });
});