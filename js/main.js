var main_data_url = "data/main.csv";
var $graphic = $("#graphic");
var $rankplot = $("#rankplot");
var data;
var CIRCLERADIUS = 5;
var STATEVAR = "FIPS"

function dotplot() {

    var LABELS = ["Unadjusted", "Adjusted"];
    var VALUES = ["score_m1", "score_m128"];

    //from buttons eventually
    data = data_main.filter(function (d) {
        return d.year == 2013 & d.subject == "reading" & d.grade == 4;
    })

    data.forEach(function (d) {
        d[VALUES[0]] = +d[VALUES[0]];
        d[VALUES[1]] = +d[VALUES[1]];
    });

    data.sort(function (a, b) {
        return a[VALUES[1]] - b[VALUES[1]];
    });

    var chart_aspect_height = 1.3;
    var margin = {
        top: 55,
        right: 15,
        bottom: 25,
        left: 105
    };
    var width = $graphic.width() - margin.left - margin.right,
        height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $graphic.empty();

    var svg = d3.select("#graphic").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .1)
        .domain(data.map(function (d) {
            return d[STATEVAR];
        }));

    //do extent domain eventually
    var x = d3.scale.linear()
        .range([0, width])
        .domain(d3.extent(
    [].concat(data.map(function (d) {
                return (d[VALUES[0]]);
            }), data.map(function (d) {
                return (d[VALUES[1]]);
            }))));

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis-show")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -15);

    var lines = svg.selectAll(".line")
        .data(data)
        .enter()
        .append("g");

    var circles = svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("g")

    var legend = svg.selectAll(".legend")
        .data(VALUES)
        .enter()
        .append("g")

    var legspacing = 130;

    legend.append("circle")
        .attr("class", function (d) {
            return d;
        })
        .attr("r", CIRCLERADIUS)
        .attr("cx", function (d, i) {
            return i * legspacing + 10;
        })
        .attr("cy", -20);

    legend.append("text")
        .attr("class", "legend")
        .attr("x", function (d, i) {
            return i * legspacing + 20;
        })
        .attr("y", -15)
        .attr("text-anchor", "start")
        .text(function (d, i) {
            return LABELS[i];
        });

    lines.append("line")
        .attr("class", "chartline")
        .attr("y1", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 3;
        })
        .attr("y2", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 3;
        })
        .attr("x1", function (d) {
            return x(d[VALUES[0]]);
        })
        .attr("x2", function (d) {
            return x(d[VALUES[1]]);
        });

    for (i = 0; i < VALUES.length; i++) {
        circles.append("circle")
            .attr("class", VALUES[i])
            .attr("r", CIRCLERADIUS)
            .attr("cx", function (d) {
                return x(d[VALUES[i]]);
            })
            .attr("cy", function (d) {
                return y(d[STATEVAR]) + y.rangeBand() / 3;
            });
    }
}

function rankplot() {

    var VALUES = "rank";

    //from buttons eventually
    data = data_main.filter(function (d) {
        return d.subject == "reading" & d.grade == 4 & d.FIPS == "Texas";
    })

    data.forEach(function (d) {
        d[VALUES] = +d[VALUES];
        d.year = +d.year;
    });

    var chart_aspect_height = 1.2;
    var margin = {
        top: 55,
        right: 15,
        bottom: 25,
        left: 105
    };
    var width = $rankplot.width() - margin.left - margin.right,
        height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $rankplot.empty();

    var svg = d3.select("#rankplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([50, 1]);

    //do extent domain eventually
    var x = d3.scale.linear()
        .range([0, width])
        .domain(d3.extent(data.map(function (d) {
            return d.year;
        })));

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues([1998, 2005, 2013])
        .tickFormat(d3.format("d"))
        .orient("bottom");

    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis-show")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues([50, 25, 1])
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -4);

    data_nest = d3.nest().key(function (d) {
        return d.abbrev;
    }).entries(data.map(function (d) {
        return {
            abbrev: d.FIPS,
            year: +d.year,
            val: +d[VALUES]
        };
    }));

    var line = d3.svg.line()
        .interpolate("step-after")
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.val);
        });

    var states = svg.selectAll(".state")
        .data(data_nest, function (d) {
            return d.key;
        })
        .enter().append("g")
        .attr("class", "state");

    states.append("path")
        .attr("class", "rankline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            return d.key;
        });

}

function drawgraphs() {
    dotplot();
    rankplot();
}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(main_data_url, function (rates) {
            data_main = rates;
            drawgraphs();
            window.onresize = drawgraphs;
        });
    }
});