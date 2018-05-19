//@ts-check

/**
 * Define the data type our plot will show
 * @typedef {{name: string, country: string, population:number, gdp: number, epc: number, total:number}} Datum
 */

/**
 *
 *
 * @class ScatterPlot
 */
class ScatterPlot {
  /**
   * Creates an instance of ScatterPlot.
   * @param {Datum[]} data
   * @memberof ScatterPlot
   */
  constructor(data) {
    this.data = data;

    //Define this.margin
    this.margin = { left: 80, right: 80, top: 50, bottom: 50 };
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    //Define Color
    this.colors = d3.scaleOrdinal(d3.schemeCategory10);

    // Zoom behaviror
    let zoomer = d3.zoom().on("zoom", () => {
      this.svg.attr("transform", d3.event.transform);
    });

    // Define this.svg
    this.svg = d3
      .select("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .call(zoomer)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

    // Define Scales
    // X axis shows GPD of countries
    let xMax = Math.ceil(d3.max(data.map(d => d.gdp)) * 1.05);
    this.xScale = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([0, this.width]);

    // Y axis displays the energy per capita (EPC) of countries
    let yMax = Math.ceil(d3.max(data.map(d => d.epc)) * 1.25);
    this.yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([this.height, 0]);

    // Define Axes
    this.xAxis = d3.axisBottom(this.xScale).tickPadding(2);
    this.yAxis = d3.axisLeft(this.yScale).tickPadding(2);
  }

  draw() {
    this.drawData();
    //this.drawLabels();
    this.drawXAxis();
    this.drawYAxis();
    this.drawLegend();
  }

  drawData() {
    this.svg
      .selectAll(".dot")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", d => this.pointSize(d))
      .attr("cx", d => this.xScale(d.gdp))
      .attr("cy", d => this.yScale(d.epc))
      .style("fill", d => this.colors(d.country))
      .on("mouseover", d => this.showTooltip(d))
      .on("mouseout", () => this.hideTooltip());
  }

  /**
   * Calculate the size of a point
   *
   * @param {Datum} d
   * @returns
   * @memberof ScatterPlot
   */
  pointSize(d) {
    return Math.sqrt(d.total) / 0.2;
  }

  /**
   * Displays the tooltip for a datapoint
   *
   * @param {Datum} datum
   * @memberof ScatterPlot
   */
  showTooltip(datum) {
    const tooltipWidth = 175;
    const tooltipHeight = 75;
    const xPos = this.xScale(datum.gdp) - tooltipWidth / 2;
    const yPos = this.yScale(datum.epc) - tooltipHeight - this.pointSize(datum);
    const tipMargin = 5;
    const tipSpacing = 12;
    this.tooltip = this.svg
      .append("g")
      .attr("class", "tooltip")
      .attr("transform", `translate(${xPos}, ${yPos})`)
      .html(
        `
  <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="10" ry="10"/>
  <text x="${tipMargin}" y="${tipMargin + tipSpacing * 1}">${datum.name}</text>
  <text x="${tipMargin}" y="${tipMargin + tipSpacing * 2}">Population: ${
  datum.population
} million</text>
  <text x="${tipMargin}" y="${tipMargin + tipSpacing * 3}">GDP: $${
  datum.gdp
} trillion</text>
  <text x="${tipMargin}" y="${tipMargin + tipSpacing * 4}">EPC: ${
  datum.epc
} million BTU</text>
  <text x="${tipMargin}" y="${tipMargin + tipSpacing * 5}">Total: ${
  datum.total
} trillion BTU</text>
        `
      );
  }

  /**
   * Removes the last displayed tooltip
   *
   * @memberof ScatterPlot
   */
  hideTooltip() {
    if (this.tooltip) this.tooltip.remove();
  }

  drawLabels() {
    this.svg
      .selectAll(".text")
      .data(this.data)
      .enter()
      .append("text")
      .attr("class", "text")
      .style("text-anchor", "start")
      .attr("x", d => this.xScale(d.gdp))
      .attr("y", d => this.yScale(d.epc))
      .style("fill", "black")
      .text(d => d.name);
  }

  drawXAxis() {
    this.svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis)
      .append("text")
      .attr("class", "label")
      .attr("y", 50)
      .attr("x", this.width / 2)
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("GDP (in Trillion US Dollars) in 2010");
  }

  drawYAxis() {
    this.svg
      .append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("font-size", "12px")
      .text("Energy Consumption per Capita (in Million BTUs per person)");
  }

  drawLegend() {
    this.svg
      .append("rect")
      .attr("x", this.width - 250)
      .attr("y", this.height - 190)
      .attr("width", 220)
      .attr("height", 180)
      .attr("fill", "lightgrey")
      .style("stroke-size", "1px");

    this.svg
      .append("circle")
      .attr("r", 5)
      .attr("cx", this.width - 100)
      .attr("cy", this.height - 175)
      .style("fill", "white");

    this.svg
      .append("circle")
      .attr("r", 15.8)
      .attr("cx", this.width - 100)
      .attr("cy", this.height - 150)
      .style("fill", "white");

    this.svg
      .append("circle")
      .attr("r", 50)
      .attr("cx", this.width - 100)
      .attr("cy", this.height - 80)
      .style("fill", "white");

    this.svg
      .append("text")
      .attr("class", "label")
      .attr("x", this.width - 150)
      .attr("y", this.height - 172)
      .style("text-anchor", "end")
      .text(" 1 Trillion BTUs");

    this.svg
      .append("text")
      .attr("class", "label")
      .attr("x", this.width - 150)
      .attr("y", this.height - 147)
      .style("text-anchor", "end")
      .text(" 10 Trillion BTUs");

    this.svg
      .append("text")
      .attr("class", "label")
      .attr("x", this.width - 150)
      .attr("y", this.height - 77)
      .style("text-anchor", "end")
      .text(" 100 Trillion BTUs");

    this.svg
      .append("text")
      .attr("class", "label")
      .attr("x", this.width - 150)
      .attr("y", this.height - 15)
      .style("text-anchor", "middle")
      .style("fill", "Green")
      .attr("font-size", "16px")
      .text("Total Energy Consumption");
  }
}

// Load the data
d3.csv("scatterdata.csv").then(data => {
  // Parse data into desired format
  let parsed = data.map(d => {
    return {
      name: d.country,
      country: d.country,
      population: parseFloat(d.population), // Population of country,
      gdp: parseFloat(d.gdp), // Gross domestic Product
      epc: parseFloat(d.ecc), // Energy consumption per capita
      total: parseFloat(d.ecc) * parseFloat(d.population) / 1000 // Total energy usage (in billions)
    };
  });

  // Create a plot object using the data
  let plot = new ScatterPlot(parsed);
  // Draw the plot to the screen
  plot.draw();
});
