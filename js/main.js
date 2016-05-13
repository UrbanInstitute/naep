var main_data_url = "data/main.csv",
    $graphic = $("#graphic"),
    $tooltipgraph = $("#tooltipgraph"),
    data,
    data_long,
    ttdata,
    STATESELECT = null,
    GRAPHHEIGHT = 880,
    CIRCLERADIUS = 5,
    STATEVAR = "state",
    LABELS = ["Unadjusted", "Adjusted"];
var VALUES = {
    unadjusted: "score_000000",
    adjusted: "score_111111"
};
var RANKVALS;
//default settings for data
var YEARVAL = 2015,
    GRADEVAL = 4,
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
    frpl: "free and reduced-price lunch",
    eng: "English spoken at home"
}

function RANKFORMATTER(d) {
    if (d == "rank_000000") {
        return "unadjusted";
    } else {
        return "adjusted";
    }
}

var dispatch = d3.dispatch("dotsMove", "clickState", "hoverState", "dehoverState");

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

    //default: don't see dropdowns
    $('.dd').hide();

    //don't see year warn statement
    $('#yearwarn').hide();

    //set text that appears in controls dropdown box
    //default value is all on
    d3.select("#controlsdisplay").html("All on");
    d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    d3.select("#gradedisplay").html(GRADEVAL + "th");
    d3.select("#yeardisplay").html(YEARVAL);

    //make sure all the checkboxes are checked
    $(".css-checkbox").prop("checked", true);

    //set the dropdowns to the default starting values
    $('input[name="year-select"][value=2015]').prop('checked', true);
    $('input[name="grade-select"][value=4]').prop('checked', true);
    $('input[name="subject-select"][value="math"]').prop('checked', true);

    //set the description of the graph on initial load
    graphname(YEARVAL, GRADEVAL, SUBJECTVAL);
});

//use radio buttons in faked dropdowns to change the graph
$('input:radio[name="year-select"]').change(function () {
    //set year value to selected
    YEARVAL = $(this).val();
    d3.select("#yeardisplay").html(YEARVAL);
    // if the year/subject combo is unavailable, change the subject, radio button and the test dropdown box
    // disable the other subject's radio button
    // display sentence about limited data
    if (YEARVAL == 1996 | YEARVAL == 2000) {
        $('input[name="subject-select"][value="reading"]').prop('disabled', true);
        $('input[name="subject-select"][value="math"]').prop('disabled', false);
        $('input[name="subject-select"][value="math"]').prop('checked', true);
        if (SUBJECTVAL == "reading") {
            SUBJECTVAL = "math";
            d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
        }
        $('#yearwarn').show();
    } else if (YEARVAL == 1998 | YEARVAL == 2002) {
        $('input[name="subject-select"][value="math"]').prop('disabled', true);
        $('input[name="subject-select"][value="reading"]').prop('disabled', false);
        $('input[name="subject-select"][value="reading"]').prop('checked', true);
        if (SUBJECTVAL == "math") {
            SUBJECTVAL = "reading";
            d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
        }
        $('#yearwarn').show();
    } else {
        $('input[name="subject-select"][value="reading"]').prop('disabled', false);
        $('input[name="subject-select"][value="math"]').prop('disabled', false);
        $('#yearwarn').hide();
    }
    //hide the dropdown
    ($(this).parent()).hide();
    //reset the graph name text
    graphname(YEARVAL, GRADEVAL, SUBJECTVAL);
    //redraw
    //dotplot();
    dispatch.dotsMove(YEARVAL, GRADEVAL, SUBJECTVAL);
});

$('input:radio[name="grade-select"]').change(function () {
    //set grade value to selected
    GRADEVAL = $(this).val();
    d3.select("#gradename").html(GRADEVAL + "th");
    d3.select("#gradedisplay").html(GRADEVAL + "th");
    //hide the dropdown
    ($(this).parent()).hide();
    //redraw
    dispatch.dotsMove(YEARVAL, GRADEVAL, SUBJECTVAL);
});

$('input:radio[name="subject-select"]').change(function () {
    //set subject value to selected
    SUBJECTVAL = $(this).val();
    d3.select("#subjectname").html(SUBJECTVAL);
    d3.select("#subjectdisplay").html(capitalizeFirst(SUBJECTVAL));
    //hide the dropdown
    ($(this).parent()).hide();
    //redraw
    dispatch.dotsMove(YEARVAL, GRADEVAL, SUBJECTVAL);
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
    dispatch.dotsMove(YEARVAL, GRADEVAL, SUBJECTVAL);
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

    var dataKey = function (d) {
        return d.fips;
    };

    function setData(yv, sv, gv) {
        data = data_main.filter(function (d) {
            return d.year == yv & d.subject == sv & d.grade == gv;
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
    }

    var chart_aspect_height = 1.75;
    var margin = {
        top: 10,
        right: 15,
        bottom: 25,
        left: 135
    };
    var width = $graphic.width() - margin.left - margin.right,
        //height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;
        //fixed height
        height = GRAPHHEIGHT - margin.top - margin.bottom;

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

    setData(YEARVAL, SUBJECTVAL, GRADEVAL);

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
        .attr("fid", function (d) {
            return d;
        })
        .attr("class", "statename")
        .attr("dx", -15);

    var lines = svg.selectAll(".chartline")
        .data(data, dataKey);

    var circunadj = svg.selectAll(".circunadj")
        .data(data, dataKey);

    var circadj = svg.selectAll(".circadj")
        .data(data, dataKey);

    lines.enter().append("line")
        .attr("fid", function (d) {
            return d.state;
        })
        .attr("class", "chartline")
        .attr("y1", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 2;
        })
        .attr("y2", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 2;
        })
        .attr("x1", function (d) {
            return x(d[VALUES.unadjusted]);
        })
        .attr("x2", function (d) {
            return x(d[VALUES.adjusted]);
        })
        .on("click", function (d) {
            dispatch.clickState(d3.select(this).attr("fid"));
        })
        .on("mouseover", function (d) {
            dispatch.hoverState(d3.select(this).attr("fid"));
        })
        .on("mouseout", function (d) {
            dispatch.dehoverState();
        })
        .on("mouseleave", function (d) {
            dispatch.dehoverState();
        });

    circunadj.enter().append("circle")
        .attr("fid", function (d) {
            return d.state;
        })
        .attr("class", "dot unadjusted circunadj")
        .attr("r", CIRCLERADIUS)
        .attr("cx", function (d) {
            return x(d[VALUES.unadjusted]);
        })
        .attr("cy", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 2;
        })
        .on("click", function (d) {
            dispatch.clickState(d3.select(this).attr("fid"));
        })
        .on("mouseover", function (d) {
            dispatch.hoverState(d3.select(this).attr("fid"));
        })
        .on("mouseout", function (d) {
            dispatch.dehoverState();
        })
        .on("mouseleave", function (d) {
            dispatch.dehoverState();
        });

    circadj.enter().append("circle")
        .attr("fid", function (d) {
            return d.state;
        })
        .attr("class", "dot adjusted circadj")
        .attr("r", CIRCLERADIUS)
        .attr("cx", function (d) {
            return x(d[VALUES.adjusted]);
        })
        .attr("cy", function (d) {
            return y(d[STATEVAR]) + y.rangeBand() / 2;
        })
        .on("click", function (d) {
            dispatch.clickState(d3.select(this).attr("fid"));
        })
        .on("mouseover", function (d) {
            dispatch.hoverState(d3.select(this).attr("fid"));
        })
        .on("mouseout", function (d) {
            dispatch.dehoverState();
        })
        .on("mouseleave", function (d) {
            dispatch.dehoverState();
        });

    //when the inputs are changed, reset the scales, redraw axes,
    //rebind data and transition to new positions
    function redraw(dt) {
        gy.transition()
            .duration(1000)
            .call(yAxis);

        gy.selectAll("text")
            .attr("fid", function (d) {
                return d;
            })
            .attr("class", function (d) {
                if (STATESELECT != null) {
                    if (d == STATESELECT) {
                        return "statename selected"
                    } else {
                        return "statename deselected";
                    }
                } else {
                    return "statename";
                }
            })
            .attr("dx", -15);

        //reset x axis
        gx.transition()
            .duration(10)
            .call(xAxis);

        //move lines
        var lines = svg.selectAll(".chartline")
            .data(dt, dataKey)
            .attr("class", "chartline");

        lines.enter()
            .append("line")
            .call(newlines);

        lines.exit()
            .remove();

        lines.call(newlines);

        //move circles
        var circunadj = svg.selectAll(".circunadj")
            .data(dt, dataKey)
            .attr("class", "dot unadjusted circunadj");

        var circadj = svg.selectAll(".circadj")
            .data(dt, dataKey)
            .attr("class", "dot adjusted circadj");

        circunadj.enter()
            .append("circle")
            .call(newcircles);

        circunadj.exit()
            .remove();

        circunadj.call(newcircles);

        circadj.enter()
            .append("circle")
            .call(newcircles2);

        circadj.exit()
            .remove();

        circadj.call(newcircles2);

        function newlines(myItems) {
            myItems
                .transition()
                .duration(1000)
                .attr("class", function (d) {
                    if (STATESELECT != null) {
                        if (d.state == STATESELECT) {
                            return "chartline selected"
                        } else {
                            return "chartline deselected";
                        }
                    } else {
                        return "chartline";
                    }
                })
                .attr("fid", function (d) {
                    return d.state;
                })
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
        }

        function newcircles(myItems) {
            myItems
                .transition()
                .duration(1000)
                .attr("class", function (d) {
                    if (STATESELECT != null) {
                        //keep state selection on change
                        if (d.state == STATESELECT) {
                            return "dot unadjusted circunadj selected"
                        } else {
                            return "dot unadjusted circunadj deselected";
                        }
                    } else {
                        return "dot unadjusted circunadj";
                    }
                })
                .attr("fid", function (d) {
                    return d.state;
                })
                .attr("r", CIRCLERADIUS)
                .attr("cx", function (d) {
                    return x(d[VALUES.unadjusted]);
                })
                .attr("cy", function (d) {
                    return y(d[STATEVAR]) + y.rangeBand() / 3;
                });
        }

        function newcircles2(myItems) {
            myItems
                .transition()
                .duration(1000)
                .attr("class", function (d) {
                    if (STATESELECT != null) {
                        if (d.state == STATESELECT) {
                            return "dot adjusted circadj selected"
                        } else {
                            return "dot adjusted circadj deselected";
                        }
                    } else {
                        return "dot adjusted circadj";
                    }
                })
                .attr("fid", function (d) {
                    return d.state;
                })
                .attr("r", CIRCLERADIUS)
                .attr("cx", function (d) {
                    return x(d[VALUES.adjusted]);
                })
                .attr("cy", function (d) {
                    return y(d[STATEVAR]) + y.rangeBand() / 3;
                });
        }
    }

    //dispatch function for moving/redrawing dots & lines on changing inputs
    dispatch.on("dotsMove", function (yv, gv, sv) {
        data = data_main.filter(function (d) {
            return d.year == yv & d.subject == sv & d.grade == gv;
        })

        data.forEach(function (d) {
            d[VALUES['unadjusted']] = +d[VALUES['unadjusted']];
            d[VALUES['adjusted']] = +d[VALUES['adjusted']];
        });

        data.sort(function (a, b) {
            return a[VALUES['adjusted']] - b[VALUES['adjusted']];
        });

        y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .1);

        x = d3.scale.linear()
            .range([0, width]);

        y.rangeRoundBands([height, 0], .1)
        y.domain(data.map(function (d) {
            return d[STATEVAR];
        }));

        x.domain(d3.extent(
    [].concat(data.map(function (d) {
                return (d[VALUES.unadjusted]);
            }), data.map(function (d) {
                return (d[VALUES.adjusted]);
            }))));

        //reset y axis
        yAxis.scale(y)
        xAxis.scale(x).ticks(6)

        $tooltipgraph.empty();
        redraw(data);

    });

    function selectState(fips) {
        //select that state, deselect all others
        //d3.selectAll("circle[fid='" + fips + "'], .statename[fid='" + fips + "']")
        d3.selectAll("[fid='" + fips + "']")
            .classed("selected", true)
            .classed("deselected", false)
        d3.selectAll("circle:not([fid='" + fips + "']), .statename:not([fid='" + fips + "']), .chartline:not([fid='" + fips + "'])")
            .classed("deselected", true)
            .classed("selected", false);

        //no lowlights
        d3.selectAll(".lowlight")
            .classed("lowlight", false);
    }

    //dispatch function for click selecting state
    dispatch.on("clickState", function (fips) {
        console.log(fips);
        STATESELECT = fips;

        selectState(fips);
        ttdata = data_main.filter(function (d) {
            return d.subject == SUBJECTVAL & d.grade == GRADEVAL & d.state == fips;
        })
        ttdata.forEach(function (d) {
            d[VALUES['unadjusted']] = +d[VALUES['unadjusted']];
            d[VALUES['adjusted']] = +d[VALUES['adjusted']];
            d.year = +d.year;
        });

        RANKVALS = ["rank_000000", "rank_" + VALUES['adjusted'].split("_")[1]];

        var ranks = (RANKVALS).map(function (name) {
            return {
                name: RANKFORMATTER(name),
                values: ttdata.map(function (d) {
                    return {
                        year: d.year,
                        val: +d[name]
                    };
                })
            };
        });

        var yposition = d3.select("circle.circunadj[fid='" + fips + "']").attr("cy");

        tooltip(fips, ranks, yposition)
    });

    //dispatch function for highlighting state
    dispatch.on("hoverState", function (fips) {
        //highlight that state, make sure it's not lowlighted
        d3.selectAll("[fid='" + fips + "']")
            .classed("highlight", true)
            .classed("lowlight", false);

        //lowlight the other states
        d3.selectAll("circle:not([fid='" + fips + "']), .statename:not([fid='" + fips + "']), .chartline:not([fid='" + fips + "'])")
            .classed("lowlight", true);

        ttdata = data_main.filter(function (d) {
            return d.subject == SUBJECTVAL & d.grade == GRADEVAL & d.state == fips;
        })
        ttdata.forEach(function (d) {
            d[VALUES['unadjusted']] = +d[VALUES['unadjusted']];
            d[VALUES['adjusted']] = +d[VALUES['adjusted']];
            d.year = +d.year;
        });

        RANKVALS = ["rank_000000", "rank_" + VALUES['adjusted'].split("_")[1]];

        var ranks = (RANKVALS).map(function (name) {
            return {
                name: RANKFORMATTER(name),
                values: ttdata.map(function (d) {
                    return {
                        year: d.year,
                        val: +d[name]
                    };
                })
            };
        });

        var yposition = d3.select("circle.circunadj[fid='" + fips + "']").attr("cy");

        tooltip(fips, ranks, yposition)
    });

    //dispatch function for dehilighting state
    dispatch.on("dehoverState", function () {
        //no lowlighting
        d3.selectAll(".lowlight")
            .classed("lowlight", false);
        d3.selectAll(".highlight")
            .classed("highlight", false);

    });
}


function tooltip(fips, rankdata, ypos) {

    var margin = {
        right: 45,
        left: 55
    };

    var padding = 50;
    var ttheight = 250;
    //want tt to be vertically aligned with dots from that state
    //if it's in the bottom section, need to adjust so it stays on screen
    if (GRAPHHEIGHT - parseInt(ypos) - padding >= ttheight + padding) {
        margin.top = parseInt(ypos) + padding;
        margin.bottom = GRAPHHEIGHT - parseInt(ypos) - ttheight - padding;
    } else {
        margin.top = GRAPHHEIGHT - ttheight - padding;
        margin.bottom = padding;
    }

    var width = $tooltipgraph.width() - margin.left - margin.right,
        height = GRAPHHEIGHT - margin.top - margin.bottom;

    $tooltipgraph.empty();

    var svg = d3.select("#tooltipgraph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", GRAPHHEIGHT)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([50, 1]);

    var years = d3.extent(ttdata.map(function (d) {
        return d.year;
    }));

    var x = d3.scale.linear()
        .range([0, width])
        .domain(years);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function (d) {
            return d;
        })
        .tickValues(function () {
            if (years[0] == 1996) {
                return [years[0], 2000, 2003, 2007, 2011, 2015];
            } else {
                return [years[0], 2003, 2007, 2011, 2015];
            }
        })
        .orient("bottom");

    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues([1, 25, 50])
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -4);

    //title for the little chart (state name)
    var charttitle = svg.append("g")
        .append("text")
        .attr("class", "charttitle")
        .attr("x", 5)
        .attr("y", -33)
        .text(fips);

    //years in chart
    var yearstitle = svg.append("g")
        .append("text")
        .attr("class", "yearstitle")
        .attr("x", 5)
        .attr("y", -15)
        .text("Rank, " + years[0] + "—" + years[1]);

    var line = d3.svg.line()
        .interpolate("step-after")
        .x(function (d) {
            return x(d.year);
        })
        .y(function (d) {
            return y(d.val);
        });

    var states = svg.selectAll(".state")
        .data(rankdata)
        .enter().append("g")
        .attr("class", "state");

    states.append("path")
        .attr("class", function (d) {
            return "rankline " + d.name;
        })
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            return d.key;
        });
}

function resizeclear() {
    dotplot();
    $tooltipgraph.empty();
}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(main_data_url, function (rates) {
            data_main = rates;
            dotplot();
            window.onresize = resizeclear;
        });
    }
});