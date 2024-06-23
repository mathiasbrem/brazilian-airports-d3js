document.addEventListener('DOMContentLoaded', function() {
    load();
});

function load() {
    
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Create a map(id, column) for each data column to display
    var Pib_current = d3.map();
    var Population = d3.map();
    var TotalPop = d3.map();
    var PibPerCap = d3.map();
    var State = d3.map();
    var County = d3.map();
    var path = d3.geoPath();

    // The linear scale for the poverty rate
    var yLegend = d3.scaleLinear()
        .domain(d3.range(900, 900000, 10000))
        .rangeRound([58, 88]);

    // The scaleThreshold gives a scale transformation
    var color = d3.scaleThreshold()
        .domain(d3.range(900, 900000, 10000))
        .range([
            "#f7f7f7", // light gray
            "#d9d9d9",
            "#bdbdbd",
            "#969696",
            "#737373",
            "#525252",
            "#252525", // dark gray
            "#b0b0b0",
            "#e0e0e0"
        ]);


    var g = svg.append("g");

    // Build the vertical legend
    g.selectAll("rect")
        .data(color.range().map(function(d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = yLegend.domain()[0];
            if (d[1] == null) d[1] = yLegend.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 26)
        .attr("x", -26)
        .attr("y", function(d) {
            return yLegend(d[0]) + 12;
        })
        .attr("width", 23)
        .attr("fill", function(d) {
            return color(d[0]);
        });

    // Legend title
    g.append("text")
        .attr("font-family", "Arial")
        .attr("x", -42)
        .attr("y", 48)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text("Voos por Municipio");

    // Place the legend axis with the values in it
    g.attr("transform", "translate(984, 0)")
        .call(d3.axisRight(yLegend)
            .tickSize(0)
            .tickFormat(function(y, i) {
                if (i > 8) return "";
                if (i == 0) return "≤" + y + "";
                if (i == 8) return "≥" + y + "";
                return y + "";
            })
            .tickValues(color.domain()))
        .select(".domain")
        .remove();

    var promises = [
        d3.json("https://raw.githubusercontent.com/mathiasbrem/brazilian-airports-d3js/main/data/br_cities.json"),
        d3.csv("https://raw.githubusercontent.com/luimucar/choropleth_br_counties/master/counties_pib_2.csv", function(d) {
            Pib_current.set(d.id, d.pib_current);
            Population.set(d.id, d.population);
            PibPerCap.set(d.id, d.pib_percapita);
            County.set(d.id, d.name);
            State.set(d.id, d.state);
        })
    ];

    Promise.all(promises).then(ready);

    // Define and call the `tip` variable before using it
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([140, 140])
        .html(function(d) {
            return "<div style='opacity:0.8;background-color:steelblue;font-family:Arial;padding:8px;color:white'>" +
                "Cidade: " + d.properties.NOME_MUNI + "<br/>" +
                "Estado: " + d.properties.NOME_UF + "<br/>" +
                "Voos: " + Population.get(d.properties.COD_IBGE) + "<br/>" +
                "Aeroportos Publicos: " + PibPerCap.get(d.properties.COD_IBGE) + "<br/>" +
                "Aeroportos Privados: " + Pib_current.get(d.properties.COD_IBGE) +
                "</div>";
        });

    svg.call(tip);

    function ready([brm]) {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(brm.features)
            .enter().append("path")
            .attr("fill", function(d) {
                return color(d.Population = PibPerCap.get(d.properties.COD_IBGE));
            })
            .attr("d", path)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }
}
