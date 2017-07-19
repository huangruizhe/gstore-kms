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
  gstore.getInfoPanel(
    node.id,
    function (resultset) {
      var desc = "";

      if (resultset["intro"] != undefined) {
        desc += '<blockquote><p>' + resultset["intro"] + '</p></blockquote>';
      } else {
        desc += '<blockquote><p>' + '(空)' + '</p></blockquote>';
      }

      if (resultset["hasId"] != undefined) {
        desc += '<h4>ID</h4><span class="property-span">' + resultset["hasId"] + '</span>';
      }

      if (resultset["isa"] != undefined) {
        desc += '<h4>类别</h4><span class="property-span">' + resultset["isa"].join(", ") + '</span>';
      }

      if (resultset["album"] != undefined) {
        desc += '<h4>所在专辑</h4><span class="property-span">' + resultset["album"] + '</span>';
      }

      if (resultset["singer"] != undefined) {
        desc += '<h4>演唱</h4><span class="property-span">' + resultset["singer"] + '</span>';
      }

      if (resultset["originalSinger"] != undefined) {
        desc += '<h4>原唱</h4><span class="property-span">' + resultset["originalSinger"] + '</span>';
      }

      if (resultset["composer"] != undefined) {
        desc += '<h4>作曲</h4><span class="property-span">' + resultset["composer"] + '</span>';
      }

      if (resultset["lyricist"] != undefined) {
        desc += '<h4>作词</h4><span class="property-span">' + resultset["lyricist"] + '</span>';
      }

      if (resultset["visitNum"] != undefined) {
        desc += '<h4>播放次数</h4><span class="property-span">' + resultset["visitNum"] + '</span>';
      }

      if (resultset["albumCreatedBy"] != undefined) {
        desc += '<h4>专辑歌手</h4><span class="property-span">' + resultset["albumCreatedBy"].join(", ") + '</span>';
      }

      if (resultset["createdAlbum"] != undefined) {
        desc += '<h4>专辑</h4><span class="property-span">' + resultset["createdAlbum"].join(", ") + '</span>';
      }
      if (resultset["createdSong"] != undefined) {
        desc += '<h4>作品</h4><span class="property-span">' + resultset["createdSong"].join(", ") + '</span>';
      }

      if (resultset["composed"] != undefined) {
        desc += '<h4>作曲</h4><span class="property-span">' + resultset["composed"].join(", ") + '</span>';
      }

      if (resultset["wroteLyrics"] != undefined) {
        desc += '<h4>作词</h4><span class="property-span">' + resultset["wroteLyrics"].join(", ") + '</span>';
      }

      if (resultset["workedWith"] != undefined) {
        desc += '<h4>合作关系</h4><span class="property-span">' + resultset["workedWith"].join(", ") + '</span>';
      }

      if (resultset["tag"] != undefined) {
        desc += '<h4>标签</h4><span class="property-span">' + resultset["tag"].join(" | ") + '</span>';
      }

      desc = "<div id=\"div-desc\">" + desc + "</div>"
      nodeinfo(resultset["name"], desc);

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