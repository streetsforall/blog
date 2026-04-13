import { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./style.css";

const PCIDegradationChart = ({ data }) => {
  const ref = useRef();

  const keys = ["<=40", "41-55", "56-70", "71-85", "86-100"];
  const keyLabels = { "86-100": "A", "71-85": "B", "56-70": "C", "41-55": "D", "<=40": "F" };

  const color = d3
    .scaleOrdinal()
    .domain(keys)
    .range(d3.schemeRdYlGn[5]);
  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 150, bottom: 20, left: 40 };

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
      .domain([0, 100])
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
      .x((d) => x(2026 + d.year))
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

    // Good repair line (A or B, >70 PCI)

    const goodRepairLine = d3
      .line()
      .x((d) => x(2026 + d.year))
      .y((d) => y(d["<=40"] + d["41-55"]))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FFF")
      .attr("stroke-width", 8)
      .attr("stroke-opacity", 0.25)
      .attr("d", goodRepairLine);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#d7191c")
      .attr("stroke-dasharray", "4 6")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.9)
      .attr("d", goodRepairLine);

    const last = data[data.length - 1];
    const lastGoodRepair = last["41-55"] + last["<=40"];
    const lastGoodRepairY = last["<=40"] + last["41-55"];

    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(lastGoodRepairY))
      .attr("dx", 6)
      .attr("dy", "-0.6em")
      .attr("fill", "#d7191c")
      .style("font-size", "10")
      .text("Failed Streets:");
    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(lastGoodRepairY))
      .attr("dx", 6)
      .attr("dy", "0.6em")
      .attr("fill", "#d7191c")
      .style("font-size", "10")
      .text(`${Math.round(lastGoodRepair)}%`);

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

    // Hover tooltip
    const container = ref.current.parentNode;
    const tooltip = d3.select(container)
      .append("div")
      .attr("class", "pci-tooltip")
      .style("display", "none");

    const crosshair = g.append("line")
      .attr("class", "crosshair")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .style("display", "none");

    svg.append("rect")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx));
        const clamped = Math.max(2026, Math.min(2036, year));
        const d = data[clamped - 2026];
        if (!d) return;

        crosshair.style("display", null).attr("x1", x(clamped)).attr("x2", x(clamped));

        const goodPct = Math.round(d["86-100"] + d["71-85"]);
        const fairPct = Math.round(d["56-70"]);
        const failedPct = Math.round(d["41-55"] + d["<=40"]);

        const containerRect = container.getBoundingClientRect();
        const tx = event.clientX - containerRect.left + 12;
        const ty = event.clientY - containerRect.top + 12;

        tooltip
          .style("display", "block")
          .style("left", `${tx}px`)
          .style("top", `${ty}px`)
          .html(`
            <div class="pci-tooltip-year">${2026 + d.year}</div>
            <div class="pci-tooltip-row"><span>Avg PCI</span><span>${d.avg_pci.toFixed(1)}</span></div>
            <div class="pci-tooltip-row" style="color:${color("86-100")}"><span>Good (A, B)</span><span>${goodPct}%</span></div>
            <div class="pci-tooltip-row" style="color:#888"><span>Fair (C)</span><span>${fairPct}%</span></div>
            <div class="pci-tooltip-row" style="color:${color("<=40")}"><span>Failed (D, F)</span><span>${failedPct}%</span></div>
          `);
      })
      .on("mouseleave", () => {
        crosshair.style("display", "none");
        tooltip.style("display", "none");
      });
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref} />
      <div>
        <div className="legend-title">Pavement Quality</div>
        <div className="legend">
          {[...keys].reverse().map((key) => (
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
              {keyLabels[key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PCIDegradationChart;
