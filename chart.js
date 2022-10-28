let dataset;

async function loadDataset() {
    dataset = await d3.json("my_weather_data.json");
    console.log(dataset);
}

const tempLowAccessor = d => d.temperatureLow;
const tempHighAccessor = d => d.temperatureHigh;
const tempMinAccessor = d => d.temperatureMin;
const tempMaxAccessor = d => d.temperatureMax;

function showTempLow() {
    drawHistogram(tempLowAccessor);
}

function showTempHigh() {
    drawHistogram(tempHighAccessor);
}

function showTempMin() {
    drawHistogram(tempMinAccessor);
}

function showTempMax() {
    drawHistogram(tempMaxAccessor);
}

function clearBox(elementID)
{
    document.getElementById(elementID).innerHTML = "";
}

function drawHistogram(tempAccessor) {
    //Accessor
    const yAccessor = d => d.length;


    let dimensions = {
        width: 1000,
        height: 400,
        margin: {
            left: 30,
            right: 30,
            top: 40,
            bottom: 20,
        },
    }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left
        - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top
        - dimensions.margin.bottom;



    clearBox("histogram");
    const wrapper = d3.select("#histogram").append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const bounds = wrapper.append("g")
        .style("translate",`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

    const xScaler = d3.scaleLinear()
        .domain(d3.extent(dataset,tempAccessor))
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .nice()

    const binsGen = d3.bin()
        .domain(xScaler.domain())
        .value(tempAccessor)
        .thresholds(12);

    const bins = binsGen(dataset);
    console.log(bins);

    const yScaler = d3.scaleLinear()
        .domain([0, d3.max(bins, yAccessor)])
        .range([dimensions.height - dimensions.margin.bottom - dimensions.margin.top, dimensions.margin.top])

    const binGroup = bounds.append("g");
    const binGroups = binGroup.selectAll("g")
        .data(bins)
        .enter()
        .append("g");


    const barPadding = 1
    const barRect = binGroups.append("rect")
        .attr("x", d => xScaler(d.x0) + barPadding/2)
        .attr("y", d => yScaler(yAccessor(d)))
        .attr("width", d => d3.max([0, xScaler(d.x1) - xScaler(d.x0) - barPadding]))
        .attr("height", d => dimensions.boundedHeight - yScaler(yAccessor(d)))
        .attr("fill", "#008080");

    const mean = d3.mean(dataset,tempAccessor);
    console.log(mean);

    const ymeanLine = bounds.append("line")
        .attr("x1", dimensions.boundedWidth)
        .attr("x2", 0)
        .attr("y1", yScaler(mean)+120)
        .attr("y2", yScaler(mean)+120)
        .attr("stroke","black")
        .attr("stroke-dasharray","2px 4px");

    const xAxisGen = d3.axisBottom()
        .scale(xScaler);

    const xAxis = bounds.append("g")
        .call(xAxisGen)
        .style("transform",`translateY(${dimensions.boundedHeight}px)`);

    const yAxisGen = d3.axisRight()
        .scale(yScaler);

    const yAxis = bounds.append("g")
        .call(yAxisGen)
        .style("transform",`translateX(${dimensions.boundedWidth}, 0)`);

    const barText = binGroups.filter(yAccessor)
        .append("text")
        .attr("x", d => xScaler(d.x0) + (xScaler(d.x1)-xScaler(d.x0))/2)
        .attr("y", d => yScaler(yAccessor(d)) - 5)
        .text(yAccessor)
        .attr("fill","darkgrey")
        .attr("font-size","12px")
        .attr("text-anchor","middle");

}

async function start(){
    await loadDataset();
    drawHistogram(tempMaxAccessor);
}

start();