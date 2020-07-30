function showClusters() {
  var width = 1160,
    height = 800,
    root;

  d3.select("#div2").style("display", "block");
  d3.select("#div2").html(`
    <p id="p2"></p>
    <fieldset style="width : 50px">
    <legend>
    Legend
    </legend>
    <table>
      <tr>
        <td>
      <svg height="10" width="10">
        <circle cx=5 cy=5 r="400" stroke="#000" stroke-width="1" fill="#ff0000" />
      </svg> </td>
      <td><span>Active/Hospitalised</span></td>
      </tr>
      <tr>
        <td>
      <svg height="10" width="10">
        <circle cx=5 cy=5 r="400" stroke="#000" stroke-width="1" fill="#11aa11" />
      </svg> </td>
      <td><span>Recovered</span></td>
      </tr>
      <tr>
        <td>
      <svg height="10" width="10">
        <circle cx=5 cy=5 r="400" stroke="#000" stroke-width="1" fill="#000" />
      </svg> </td>
      <td><span>Deceased</span></td>
      </tr>
    </table>
</fieldset>
<svg id="svg1"></svg>`);

  d3.select("#p2")
    .style("white-space", "pre-line")
    .text(
      "The below simulation shows all the clusters as of July 08, 2020.\n " +
        "Individual patients without a cluster is omitted. Hover over the nodes for more details."
    );
  d3.select("#div2").append("br");

  var force = d3.layout
    .force()
    .size([width, height])
    .linkDistance(25)
    .charge(-15)
    .on("tick", tick);
  d3.selectAll("#svg1").selectAll("*").remove();
  console.log("removed");
  var svg = d3
    .select("#svg1")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + 30 + ",0)");

  console.log(svg);
  var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

  var map = {};

  d3.json("raw_data_all.json", function (error, json) {
    if (error) throw error;

    root = json;
    update();
  });
  // root = JSON.parse(djson);
  // update();

  var div = d3
    .select("#div2")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function update() {
    var nodes = flatten(root),
      links = links1(root);
    // Restart the force layout.
    console.log(nodes);
    console.log(links);
    force.nodes(nodes).links(links).start();

    link = link.data(links, function (d) {
      return d.source.index;
    });

    link.exit().remove();

    link
      .enter()
      .insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node = node
      .data(nodes, function (d) {
        return d.patientnumber;
      })
      .style("fill", color);

    node.exit().remove();

    node
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      })
      .attr("r", function (d) {
        return 5.5;
      })
      .style("fill", color)
      // .on("click", click)
      .on("mouseover", function (d) {
        div.transition().duration(200).style("opacity", 1);
        div
          .html(
            "<table> <tr><td>Patient No. : </td><td>" +
              (!d.patientnumber ? "NA" : d.patientnumber) +
              "</td></tr>" +
              "<tr><td>Age : </td><td>" +
              (!d.agebracket ? "NA" : d.agebracket) +
              "</td></tr>" +
              "<tr><td>Contacted from : </td><td>" +
              (!d.contractedfromwhichpatientsuspected
                ? "NA"
                : d.contractedfromwhichpatientsuspected) +
              "</td></tr>" +
              "<tr><td>Current status : </td><td>" +
              (!d.currentstatus ? "NA" : d.currentstatus) +
              "</td></tr>" +
              "<tr><td>State : </td><td>" +
              (!d.detectedstate ? "NA" : d.detectedstate) +
              "</td></tr>" +
              "<tr><td>Notes : </td><td>" +
              (!d.backupnotes ? "NA" : d.backupnotes) +
              "</td></tr>" +
              "<tr><td>Type of transmission : </td><td>" +
              (!d.typeoftransmission ? "NA" : d.typeoftransmission) +
              "</td></tr></table>"
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
      })
      .call(force.drag);
  }

  function tick() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  function color(d) {
    if (d.currentstatus == "Recovered") {
      return "#11aa11";
    }
    if (d.currentstatus == "Hospitalized") {
      return "#1111ee";
    }
    if (d.currentstatus == "Deceased") return "#000";
  }

  function flatten(root) {
    var nodes = [],
      i = 0;
    for (i = 0; i < root.length; i++) {
      nodes.push(root[i]);
      map[root[i].patientnumber] = root[i];
    }
    return nodes;
  }

  function links1(root) {
    var links = [],
      i = 0;
    for (i = 0; i < root.length; i++) {
      if (root[i].contractedfromwhichpatientsuspected.length > 0) {
        var arr1 = root[i].contractedfromwhichpatientsuspected.split(",");
        var j = 0;
        for (j = 0; j < arr1.length; j++) {
          if (arr1[j].startsWith("P")) {
            m = {};
            m.source = root[i];
            m.target = map[arr1[j]];
            //  if(m.target != undefined) {
            links.push(m);
            //  }
          } else {
          }
        }
      }
    }
    return links;
  }
}
