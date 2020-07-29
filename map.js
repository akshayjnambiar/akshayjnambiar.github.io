function mapp() {
  var proj = d3.geo.mercator();
  var path = d3.geo.path().projection(proj);
  var t = proj.translate(); // the projection's default translation
  var s = proj.scale(); // the projection's default scale

  var buckets = 10,
    colors = [
      "#f7fbff",
      "#e1edf8",
      "#cadef0",
      "#abcfe6",
      "#82badb",
      "#59a1cf",
      "#3787c0",
      "#1c6aaf",
      "#0b4d94",
      "#08306b",
    ];

  var div2 = d3.select("#div2").style("display", "block");
  div2.selectAll("*").remove();
  div2
    .append("p")
    .attr("id", "#p2")
    .style("white-space", "pre-line")
    .text(
      "The Map below shows the number of cases in each state in India based on status('Confirmed', 'Active', 'Recovered' and 'Deceased').\n " +
        "The value increases as the color gets darker. The state with the highest value is annotated. \nHover over the states for more details."
    );

  div2.append("br");
  var allGroup = ["confirmed", "active", "recovered", "deceased"];
  var allColors = {
    confirmed: [
      "#fff5f0",
      "#fee0d3",
      "#fdc3ac",
      "#fca082",
      "#fb7c5c",
      "#f5553d",
      "#e23028",
      "#c2181c",
      "#9b0d14",
      "#67000d",
    ],
    active: [
      "#f7fbff",
      "#e1edf8",
      "#cadef0",
      "#abcfe6",
      "#82badb",
      "#59a1cf",
      "#3787c0",
      "#1c6aaf",
      "#0b4d94",
      "#08306b",
    ],
    recovered: [
      "#f7fcf5",
      "#e6f5e1",
      "#cdebc7",
      "#addea7",
      "#88cd87",
      "#5db96b",
      "#38a055",
      "#1b843f",
      "#04672b",
      "#00441b",
    ],
    deceased: [
      "#ffffff",
      "#f1f1f1",
      "#dedede",
      "#c6c6c6",
      "#a7a7a7",
      "#878787",
      "#686868",
      "#474747",
      "#222222",
      "#000000",
    ],
  };
  var sel = div2
    .append("div")
    .attr("id", "#selectDiv1")
    .append("p")
    .text("Status : ")
    .append("select")
    .attr("id", "#selectButton");

  sel
    .selectAll("myOptions")
    .data(allGroup)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    })
    .attr("value", function (d) {
      return d;
    });

  d3.selectAll("#svg1").selectAll("*").remove();

  var map = div2
    .append("svg")
    .attr("id", "#svg1")
    .attr("width", 1200)
    .attr("height", 1200)
    .call(initialize);
  var india = map.append("svg:g").attr("id", "india");

  var div = d3
    .select("#div2")
    .append("div")
    .attr("class", "tooltip")
    .attr("width", "70px")
    .style("opacity", 0);

  var stateMap = {};

  var maxState = { d: { confirmed: 0 } };

  d3.json("data.json", function (error, d) {
    d1 = d.statewise;

    var j;
    for (j = 0; j < d1.length; j++) {
      stateMap[d1[j].state] = d1[j];
    }
    console.log(stateMap);
    // d3.json("states.json", function (error, json) {
    //     fts = json.features
    //     for(var i in fts) {
    //         var state = fts[i];
    //         var j;
    //         for(j=0;j<d1.length;j++) {
    //             if(d1.state == state.id) {
    //                 state.total = d1
    //             }
    //         }
    //     }

    // });
    data = d1.map(function (d) {
      if (maxState.d.confirmed < d.confirmed) maxState.d = d;
      return { value: parseInt(d.confirmed) };
    });
    grp = "confirmed";
    updateMap(data, grp);
  });

  var colorScale, maxTotal;

  function updateMap(data, grp) {
    maxTotal = d3.max(data, function (d) {
      return d.value;
    });

    colorScale = d3.scale
      .quantile()
      .domain(
        d3.range(buckets).map(function (d) {
          return (d / buckets) * maxTotal;
        })
      )
      .range(allColors[grp]);

    var y = d3.scale.sqrt().domain([0, maxTotal]).range([0, 300]);

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .tickValues(colorScale.domain())
      .orient("right");

    india.selectAll("*").remove();

    d3.json("states.json", function (error, json) {
      india
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", colors[0])
        .style("opacity", 0.5)
        .on("mouseover", function (d) {
          div.transition().duration(200).style("opacity", 1);
          div
            .html(
              "<table> <tr><td> State : </td><td>" +
                (!d.id ? "NA" : d.id) +
                "</td></tr>" +
                "<tr><td>" +
                grp +
                " : </td><td>" +
                (!stateMap[d.id] ? "NA" : stateMap[d.id][grp]) +
                "</td></tr><table>"
            )
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          div.transition().duration(200).style("opacity", 0);
        });

      india
        .selectAll("path")
        .transition()
        .duration(500)
        .style("fill", function (d) {
          console.log(stateMap[d.id] + " " + stateMap[d.id]);
          return stateMap[d.id]
            ? colorScale(parseInt(stateMap[d.id][grp]))
            : colorScale(0);
        });

      india
        .selectAll(".circle-icon")
        .data(json.features)
        .enter()
        .append("circle")
        .each(function (d) {
          if (d.id !== "Maharashtra") {
            return;
          }
          d3.select(this)
            .attr("r", 4)
            .attr("transform", function (d) {
              return "translate(" + path.centroid(d) + ")";
            })
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        })
        .filter(function (d) {
          return d.id !== "Maharashtra";
        })
        .remove();

      india
        .selectAll(".label-text")
        .data(json.features)
        .enter()
        .append("text")
        .each(function (d) {
          if (d.id !== "Maharashtra") {
            return;
          }
          //   d3.select(this)
          //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
          //     .attr("fill", "black")
          //     .style("text-anchor", "end")
          //     .text(function(d) { return d.id });
          d3.select(this)
            .attr("transform", function (d) {
              return "translate(" + path.centroid(d) + ")";
            })
            .attr("dx", "-110")
            .attr("dy", "110")
            .attr("fill", "black")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .text(
              "Highest value is in " + d.id + " (" + stateMap[d.id][grp] + ")"
            );
        })
        .filter(function (d) {
          return d.id !== "Maharashtra";
        })
        .remove();

      var line = d3.svg
        .line()
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        })
        .interpolate("basis");

      india
        .selectAll(".label-line")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "label-line")
        .attr("d", function (d) {
          var centroid = path.centroid(d);

          if (d.id === "Maharashtra") {
            var lineData = [
              { x: centroid[0] - 4, y: centroid[1] + 4 },
              { x: centroid[0] - 110, y: centroid[1] + 110 },
            ];
          } else {
            return;
          }
          return line(lineData);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .attr("fill", "#000")
        .filter(function (d) {
          return d.id !== "Maharashtra";
        })
        .remove();

      var g = india
        .append("g")
        .attr("class", "key")
        .attr("transform", "translate(845, 495)")
        .call(yAxis);
      g.selectAll("rect")
        .data(
          colorScale.range().map(function (d, i) {
            return {
              y0: i ? y(colorScale.domain()[i - 1]) : y.range()[0],
              y1:
                i < colorScale.domain().length
                  ? y(colorScale.domain()[i])
                  : y.range()[1],
              z: d,
            };
          })
        )
        .enter()
        .append("rect")
        .attr("width", 7)
        .attr("y", function (d) {
          return d.y0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        })
        .style("fill", function (d) {
          return d.z;
        });
    });
  }

  sel.on("change", function () {
    console.log("here1");
    var selectedOption = d3.select(this).property("value");
    console.log("select" + selectedOption);
    grp = selectedOption;
    data = d1.map(function (d) {
      return { value: parseInt(d[grp]) };
    });
    updateMap(data, grp);
  });

  function initialize() {
    proj.scale(1400);
    proj.translate([-1340, 950]);
  }
}
