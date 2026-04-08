import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./style.css";

const PCIDegradationChart = ({ data }) => {
  const ref = useRef();

  const keys = ["86-100", "71-85", "56-70", "41-55", "<=40"];

  const color = d3
    .scaleOrdinal()
    .domain(keys)
    .range(d3.schemeRdYlGn[5].toReversed());
  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 100, bottom: 20, left: 40 };

    const height = 400;
    const width = 800;

    const innerWidth = 800 - margin.left - margin.right;
    const innerHeight = 400 - margin.top - margin.bottom;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0,0,800,400")
      .attr("preserveAspectRatio", "xMinYMin")
      // .attr("width", width)
      // .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([2026, 2036]).range([0, innerWidth]);

    const stack = d3.stack().keys(keys);

    const stackedData = stack(data);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))])
      .nice()
      .range([innerHeight, 0]);

    const area = d3
      .area()
      .x((d) => x(2026 + d.data.year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    g.selectAll(".layer")
      .data(stackedData)
      .join("path")
      .attr("class", "layer")
      .attr("fill", (d) => color(d.key))
      .attr("d", area)
      .attr("opacity", 0.9);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .style("font-family", "monospace")
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(2026, 2037))
          .tickFormat(d3.format("d")),
      );

    g.append("g").style("font-family", "monospace").call(d3.axisLeft(y));

    // Moving Average:

    const line = d3
      .line()
      .x((d, i) => x(2026 + d.year))
      .y((d) => y(d.avg_pci))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00E")
      .attr("stroke-dasharray", "4 6")
      .attr("stroke-linecap", "round")

      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.9)
      .attr("d", line);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FFF")

      // .attr("stroke-linecap", "en")

      .attr("stroke-width", 8)
      .attr("stroke-opacity", 0.25)
      .attr("d", line);

    const last = data[data.length - 1];

    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(last.avg_pci))
      .attr("dx", 6)
      .attr("dy", "-0.6em")
      .attr("fill", "#333")
      .style("font-size", "10")
      .text("Average PCI:");
    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(last.avg_pci))
      .attr("dx", 6)
      .attr("dy", "0.6em")
      .attr("fill", "#333")
      .style("font-size", "10")
      .text(`${Math.round(last.avg_pci)}`);
  }, [data]);

  return (
    <div>
      <svg ref={ref} />
      <div>
        <div className="legend-title">Pavement Condition Index:</div>
        <div className="legend">
          {keys.map((key, i) => (
            <div key={key} className="legend-item">
              <div
                style={{
                  backgroundColor: color(key),
                  height: "1rem",
                  width: "1rem",
                  display: "inline-block",
                  marginRight: "1rem",
                }}
              ></div>
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PCIDegradationChart;
