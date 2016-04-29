var main_data_url = "data/main.csv",
    $graphic = $("#graphic"),
    $tooltipgraph = $("#tooltipgraph"),
    data,
    CIRCLERADIUS = 5,
    STATEVAR = "FIPS",
    LABELS = ["Unadjusted", "Adjusted"];
var VALUES = {
    unadjusted: "score_000000",
    adjusted: "score_111111"
};
//default settings for data
var YEARVAL = 2015;
GRADEVAL = 4;
SUBJECTVAL = "math";
//controls on or off
var ADJUST = {
    age: 1,
    race: 1,
    lep: 1,
    sped: 1,
    frpl: 1,
    eng: 1
};
//labels for controls in the graph sentence
var ADJTEXT = {
    age: "age",
    race: "race",
    lep: "limited English proficiency",
    sped: "special education status",
    frpl: "free and reduced price lunch",
    eng: "English spoken at home"
}

//select the metric to display using dropdowns
var yearSelect = d3.select("#year-select"),
    gradeSelect = d3.select("#grade-select"),
    subjectSelect = d3.select("#subject-select");

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

yearSelect.on("change", function () {
    YEARVAL = yearSelect.property("value");
    d3.select("#yeardisplay").html(YEARVAL);
    // if the year/subject combo is unavailable, change the subject and the test dropdown box
    if ((YEARVAL == 1996 | YEARVAL == 2000) & SUBJECTVAL == "reading") {
        SUBJECTVAL = "math";
        d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    } else if ((YEARVAL == 1998 | YEARVAL == 2002) & SUBJECTVAL == "math") {
        SUBJECTVAL = "reading";
        d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    }
    //reset the graph name text
    graphname(YEARVAL, GRADEVAL, SUBJECTVAL);
    dotplot();
    tooltip();
});

gradeSelect.on("change", function () {
    GRADEVAL = gradeSelect.property("value");
    d3.select("#gradename").html(GRADEVAL + "th");
    d3.select("#gradedisplay").html(GRADEVAL + "th");
    dotplot();
    tooltip();
});

subjectSelect.on("change", function () {
    SUBJECTVAL = subjectSelect.property("value");
    d3.select("#subjectname").html(capitalizeFirst(SUBJECTVAL));
    d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    dotplot();
    tooltip();
});

//line of text above the graph showing what controls are on
function setControlsText() {
    var controlsText = "";
    //if no controls selected, write "nothing"
    //otherwise, separate with commas - & last element with 'and'
    if (ADJUST.age + ADJUST.race + ADJUST.lep + ADJUST.sped + ADJUST.frpl + ADJUST.eng == 0) {
        controlsText = "nothing";
    } else {
        var temp = [];
        for (var key in ADJTEXT) {
            if (ADJTEXT.hasOwnProperty(key)) {
                if (ADJUST[key] == 1) {
                    temp.push(ADJTEXT[key]);
                }
            }
        }
        if (temp.length === 1) {
            controlsText = temp[0];
        } else if (temp.length === 2) {
            controlsText = temp.join(' and ');
        } else if (temp.length > 2) {
            controlsText = temp.slice(0, -1).join(', ') + ', and ' + temp.slice(-1);
        }
    }
    d3.select("#controlsname").html(controlsText);
}

function graphname(yv, gv, sv) {
    d3.select("#yearname").html(yv);
    d3.select("#gradename").html(gv + "th");
    d3.select("#subjectname").html(sv);
    setControlsText();
}

$(document).ready(function () {
    /*YEARVAL = 2015;
    GRADEVAL = 4;
    SUBJECTVAL = "math";*/

    //default: don't see dropdown
    $('.dd').hide();

    //set text that appears in controls dropdown box
    //default value is all on
    d3.select("#controlsdisplay").html("All on");
    d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    d3.select("#gradedisplay").html(GRADEVAL + "th");
    d3.select("#yeardisplay").html(YEARVAL);

    //make sure all the checkboxes are checked
    $(".css-checkbox").prop("checked", true);

    //set the description of the graph on initial load
    graphname(YEARVAL, GRADEVAL, SUBJECTVAL);
});

$('#yearbox').click(function () {
    if ($("#yeardd").is(":visible")) {
        $('#yeardd').hide();
    } else {
        $('#yeardd').show();
    }
});
$('#gradebox').click(function () {
    if ($("#gradedd").is(":visible")) {
        $('#gradedd').hide();
    } else {
        $('#gradedd').show();
    }
});
$('#subjectbox').click(function () {
    if ($("#subjectdd").is(":visible")) {
        $('#subjectdd').hide();
    } else {
        $('#subjectdd').show();
    }
});

//reset the adjusted score based on values of ADJUST
function changeAdjust() {
    VALUES.adjusted = "score_" + ADJUST.age + ADJUST.race + ADJUST.lep + ADJUST.sped + ADJUST.frpl + ADJUST.eng;

    var numOn = ADJUST.age + ADJUST.race + ADJUST.lep + ADJUST.sped + ADJUST.frpl + ADJUST.eng;
    //show number of selected controls in bar, set All on/All off buttons correctly
    if (numOn == 0) {
        d3.select("#controlsdisplay").html("All off");
        d3.select("#alloff").classed("selected", true)
        d3.select("#allon").classed("selected", false)

    } else if (numOn == 6) {
        d3.select("#controlsdisplay").html("All on");
        d3.select("#alloff").classed("selected", false)
        d3.select("#allon").classed("selected", true)

    } else {
        d3.select("#alloff").classed("selected", false)
        d3.select("#allon").classed("selected", false)
        d3.select("#controlsdisplay").html(numOn + " on");
    }
    setControlsText();
    dotplot();
}

//clicking on the controls box shows/hides the dropdown (which is really a div)
function controls() {

    //when you click the checkboxes, change the adjustment shown
    $(".css-checkbox").change(function () {
        ADJUST[this.id] = +this.checked;
        changeAdjust();
    });

    //if selecting the all on button, set all on and make sure deselect the all off button
    d3.select("#allon").on("click", function () {
        $(".css-checkbox").prop("checked", true);
        ADJUST.age = 1;
        ADJUST.race = 1;
        ADJUST.lep = 1;
        ADJUST.sped = 1;
        ADJUST.frpl = 1;
        ADJUST.eng = 1;
        changeAdjust();
    });

    d3.select("#alloff").on("click", function () {
        $(".css-checkbox").prop("checked", false);
        ADJUST.age = 0;
        ADJUST.race = 0;
        ADJUST.lep = 0;
        ADJUST.sped = 0;
        ADJUST.frpl = 0;
        ADJUST.eng = 0;
        changeAdjust();
    });

    //show the dropdown when clicking to it
    $('#controlsbox').click(function () {
        if ($("#controlsdd").is(":visible")) {
            $('#controlsdd').hide();
        } else {
            $('#controlsdd').show();
        }
    });
}

controls();

function dotplot() {

    var chart_aspect_height = 1.75;
    var margin = {
        top: 10,
        right: 15,
        bottom: 25,
        left: 135
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
        return d.year == YEARVAL & d.subject == SUBJECTVAL & d.grade == GRADEVAL;
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
        .tickFormat(function (d) {
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
        .ticks(5)
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