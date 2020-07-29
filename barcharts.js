function barcharts() {
  var div2 = d3.select("#div2").style("display", "block");
  div2.selectAll("*").remove();
  div2
    .append("p")
    .attr("id", "#p2")
    .style("white-space", "pre-line")
    .text(
      "The bar chart below shows the number of cases in each status('Confirmed', 'Active', 'Recovered' and 'Deceased').\n " +
      "The data can be visualized in log and linear scale. The bar with the highest value is annotated. \nHover over the bars for more details."
    );

  div2.append("br");
  var d1;
  var allGroup = ["Confirmed", "Active", "Recovered", "Deceased"];
  var sel = div2
    .append("div")
    .attr("id", "#selectDiv1")
    .append("p")
    .text("Status : ")
    .append("select")
    .attr("id", "#selectButton");

  var selScale = div2
    .append("div")
    .attr("id", "#selectDiv2")
    .append("p")
    .text("Scale : ")
    .append("select")
    .attr("id", "#selectButton2");

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

  selScale
    .selectAll("myOptions")
    .data(["Linear Scale", "Log Scale"])
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    })
    .attr("value", function (d) {
      return d;
    });

  d3.selectAll("#svg1").selectAll("*").remove();

  var myColor = d3.scale
    .ordinal()
    .domain(allGroup)
    .range(["#ff0000", "#1111ee", "#11aa11", "#000"]);

  var div = d3
    .select("#div2")
    .append("div")
    .attr("class", "tooltip")
    .attr("width", "70px")
    .style("opacity", 0);

  // var divx = d3.select("#div2").append("div")
  //     .attr("class", "tooltip1")
  //     .attr("width", "70px")
  //     ;

  var data;
  var grp;
  var linearScale = true;
  d3.json("data.json", function (error, d) {
    d1 = d.cases_time_series;
    data = d1.map(function (d) {
      return { value: d.dailyconfirmed, key: d.date };
    });
    grp = "Confirmed";
    updateBar(data, grp);
  });

  function updateBar(data, grp) {
    base = linearScale ? 0 : 1;
    div2.selectAll("svg").remove();
    var svg = div2
        .append("svg")
        .attr("id", "#svg1")
        .attr("width", "1000")
        .attr("height", 500),
      margin = 200,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

    var g = svg
      .append("g")
      .attr("transform", "translate(" + 100 + "," + 100 + ")");

    svg
      .append("text")
      .attr("transform", "translate(0,0)")
      .attr("x", 50)
      .attr("y", 50)
      .attr("font-size", "24px")
      .text(grp + " Cases from 30th January to 26th July");
    var maxxVal = d3.max(data, function (d) {
      return parseInt(d.value);
    });
    var minnVal = d3.min(data, function (d) {
      return parseInt(d.value);
    });
    console.log(
      d3.max(data, function (d) {
        return parseInt(d.value);
      })
    );
    var xScale = d3.scale
      .ordinal()
      .domain(
        data.map(function (d) {
          return d.key;
        })
      )
      .rangeRoundBands([0, width], 0.1);
    var yScale = d3.scale.log().domain([1, maxxVal]).range([height, 0]).nice();
    if (linearScale) {
      yScale = d3.scale
        .linear()
        .domain([minnVal, maxxVal])
        .range([height, 0])
        .nice();
    }
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    g.append("g")
      .attr("transform", "translate(10," + height + ")")
      .append("text")
      .attr("y", height - 250)
      .attr("x", width - 100)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Date");

    g.append("g")
      .call(yAxis.ticks(null).tickSize(0))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text(grp);

    var maxBar = {};

    var bars = g
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        if (d.value == maxxVal) {
          maxBar.d = d;
          maxBar.x = xScale(d.key);
        }
        return xScale(d.key);
      })
      .attr("width", 3)
      .attr("fill", function (d) {
        return myColor(grp);
      })
      .on("mouseover", function (d) {
        div.transition().duration(200).style("opacity", 1);
        div
          .html(
            "<table> <tr><td>" +
              grp +
              " : </td><td>" +
              (!d.value ? "NA" : d.value) +
              "</td></tr>" +
              "<tr><td>Date : </td><td>" +
              (!d.key ? "NA" : d.key) +
              "</td></tr></table>"
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
      })
      .attr("y", yScale(0))
      .attr("height", 0)
      .transition()
      .duration(400)
      .attr("y", function (d) {
        if (d.value == maxxVal) {
          maxBar.y = yScale(d.value);
        }
        return d.value > 0 ? yScale(d.value) : yScale(base);
      })
      .attr("height", function (d) {
        if (d.value < 0 && linearScale) {
          return yScale(base) - yScale(-1 * d.value);
        }
        return yScale(base) - yScale(d.value);
      });
    bars.transition().duration(250);
    console.log(maxBar);

    g.selectAll("circle")
      .data([maxBar])
      .enter()
      .append("text")
      .attr("x", function (d) {
        return d.x - 250;
      })
      .attr("y", function (d) {
        return d.y - 30;
      })
      // .attr("r", "10")
      // .attr("fill", "#fff")
      // .append("text")
      // .attr("text-anchor", "middle")
      .text(function (d) {
        return "Highest on " + d.d.key + " (" + d.d.value + ")";
      });

    g.selectAll("circle")
      .data([maxBar])
      .enter()
      .append("line")
      .style("stroke", "black")
      .attr("x1", function (d) {
        return d.x;
      })
      .attr("y1", function (d) {
        return d.y;
      })
      .attr("x2", function (d) {
        return d.x - 70;
      })
      .attr("y2", function (d) {
        return d.y - 30;
      });

    //  divx.attr("position", "relative")
    //      .attr("left", width + maxBar.x)
    //      .attr("top", height + maxBar.y)
    //      .html("<span>This is the largest</span>")
  }
  console.log("d3.select('#selectButton1') : " + sel);

  sel.on("change", function () {
    console.log("here1");
    var selectedOption = d3.select(this).property("value");
    console.log("select" + selectedOption);
    if (selectedOption == "Confirmed")
      data = d1.map(function (d) {
        return { value: parseInt(d.dailyconfirmed), key: d.date };
      });
    if (selectedOption == "Active")
      data = d1.map(function (d) {
        return {
          value: parseInt(d.dailyconfirmed) - parseInt(d.dailyrecovered),
          key: d.date,
        };
      });
    if (selectedOption == "Recovered")
      data = d1.map(function (d) {
        return { value: parseInt(d.dailyrecovered), key: d.date };
      });
    if (selectedOption == "Deceased")
      data = d1.map(function (d) {
        return { value: parseInt(d.dailydeceased), key: d.date };
      });
    grp = selectedOption;
    updateBar(data, grp);
  });

  selScale.on("change", function () {
    console.log("here1");
    var selectedOption = d3.select(this).property("value");
    console.log("select" + selectedOption);
    if (selectedOption == "Log Scale") linearScale = false;
    else linearScale = true;
    updateBar(data, grp);
  });
}
