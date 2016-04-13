var main_data_url = "data/main.csv";
var $graphic = $("#graphic");
var $rankplot = $("#rankplot");
var $tooltipgraph = $("#tooltipgraph");
var data;
var CIRCLERADIUS = 5;
//the column name might change, so paramaterize it
var STATEVAR = "FIPS";
var LABELS = ["Unadjusted", "Adjusted"];
var VALUES = {
    unadjusted: "score_000000",
    adjusted: "score_111111"
};

// Allow Bootstrap dropdown menus to have forms/checkboxes inside, 
// and when clicking on a dropdown item, the menu doesn't disappear.
/*$(document).on('click', '.dropdown-menu.dropdown-menu-form', function(e) {
  e.stopPropagation();
});*/


//select the metric to display using dropdowns
var gradeSelect = d3.select("#grade-select");
var subjectSelect = d3.select("#subject-select");

GRADEVAL = gradeSelect.property("value");
SUBJECTVAL = subjectSelect.property("value");

gradeSelect.on("change", function () {
    GRADEVAL = gradeSelect.property("value");
    graphname(GRADEVAL, SUBJECTVAL);
    dotplot();
    tooltip();
});
subjectSelect.on("change", function () {
    SUBJECTVAL = subjectSelect.property("value");
    graphname(GRADEVAL, SUBJECTVAL);
    dotplot();
    tooltip();
});

function graphname(GRADEVAL, SUBJECTVAL) {
    d3.select("#gradename").html(GRADEVAL + "th");
    d3.select("#subjectname").html(SUBJECTVAL);
    d3.select("#controlsname").html("age, race, limited English proficiency, free and reduced price lunch, and English spoken at home");
}

function dotplot() {

    var chart_aspect_height = 1.75;
    var margin = {
        top: 10,
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
        .rangeRoundBands([height, 0], .1);

    var x = d3.scale.linear()
        .range([0, width]);

    data = data_main.filter(function (d) {
        return d.year == 2013 & d.subject == SUBJECTVAL & d.grade == GRADEVAL;
    })

    data.forEach(function (d) {
        d[VALUES['unadjusted']] = +d[VALUES['unadjusted']];
        d[VALUES['adjusted']] = +d[VALUES['adjusted']];
    });

    data.sort(function (a, b) {
        return a[VALUES['adjusted']] - b[VALUES['adjusted']];
    });

    y.domain(data.map(function (d) {
        return d[STATEVAR];
    }));

    x.domain(d3.extent(
    [].concat(data.map(function (d) {
            return (d[VALUES.unadjusted]);
        }), data.map(function (d) {
            return (d[VALUES.adjusted]);
        }))));

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(6)
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

    lines.append("line")
        .attr("class", "chartline")
        .attr("y1", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 3;
        })
        .attr("y2", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 3;
        })
        .attr("x1", function (d) {
            return x(d[VALUES.unadjusted]);
        })
        .attr("x2", function (d) {
            return x(d[VALUES.adjusted]);
        });

    for (key in VALUES) {
        circles.append("circle")
            .attr("class", key)
            .attr("r", CIRCLERADIUS)
            .attr("cx", function (d) {
                return x(d[VALUES[key]]);
            })
            .attr("cy", function (d) {
                return y(d[STATEVAR]) + y.rangeBand() / 3;
            });
    }

    /*for (i = 0; i < VALUES.length; i++) {
        circles.append("circle")
            .attr("class", VALUES[i])
            .attr("r", CIRCLERADIUS)
            .attr("cx", function (d) {
                return x(d[VALUES[i]]);
            })
            .attr("cy", function (d) {
                return y(d[STATEVAR]) + y.rangeBand() / 3;
            });
    }*/
}


function tooltip() {

    //var VALUES = "rank";

    data.forEach(function (d) {
        d[VALUES['unadjusted']] = +d[VALUES['unadjusted']];
        d[VALUES['adjusted']] = +d[VALUES['adjusted']];
        d.year = +d.year;
    });

    var chart_aspect_height = 0.7;
    var margin = {
        top: 45,
        right: 15,
        bottom: 25,
        left: 35
    };
    var width = $tooltipgraph.width() - margin.left - margin.right,
        height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $tooltipgraph.empty();

    var svg = d3.select("#tooltipgraph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        //.domain([51, 1]);
        //.domain([200, 300]);
    
    y.domain(d3.extent(
    [].concat(data.map(function (d) {
            return (d[VALUES.unadjusted]);
        }), data.map(function (d) {
            return (d[VALUES.adjusted]);
        }))));
    
    data = data_main.filter(function (d) {
        return d.subject == SUBJECTVAL & d.grade == GRADEVAL & d.FIPS == "Virginia";
    })

    var years = d3.extent(data.map(function (d) {
        return d.year;
    }));

    var x = d3.scale.linear()
        .range([0, width])
        .domain(years);
        //.domain([1996, 2013]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function(d) {
            return d;
        })
        .ticks(5)
        .orient("bottom");

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
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
    
    var types = ([VALUES['unadjusted'], VALUES['adjusted']]).map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    year: d.year,
                    val: +d[name]
                };
            })
        };
    });

    console.log(types);
    //title for the little chart (state name)
    var charttitle = svg.append("g")
        .data(data_nest)
        .append("text")
        .attr("class", "charttitle")
        .attr("x", 5)
        .attr("y", -23)
        .text(function (d) {
            return d.key;
        });

    //years in chart
    var yearstitle = svg.append("g")
        .append("text")
        .attr("class", "yearstitle")
        .attr("x", 5)
        .attr("y", -5)
        .text(years[0] + "—" + years[1]);

    var line = d3.svg.line()
        //.interpolate("step-after")
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.val);
        });

    var states = svg.selectAll(".state")
        .data(types)
        .enter().append("g")
        .attr("class", "state");

    states.append("path")
        .attr("class", function (d) {
            return d.name + "line";
        })
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            return d.key;
        });
}

function drawgraphs() {
    dotplot();
    tooltip();
    graphname(GRADEVAL, SUBJECTVAL);
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