import { useRef, useEffect } from "react";
import * as d3 from "d3";
import "./style.css";

const DeferredMaintenanceChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 150, bottom: 20, left: 70 };
    const innerWidth = 800 - margin.left - margin.right;
    const innerHeight = 300 - margin.top - margin.bottom;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0,0,800,300")
      .attr("preserveAspectRatio", "xMinYMin");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([2026, 2036]).range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, 16_000_000_000])
      .range([innerHeight, 0]);

    const yFormat = (v) => `$${(v / 1_000_000_000).toFixed(1)}B`;

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .style("font-family", "monospace")
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(2026, 2037))
          .tickFormat(d3.format("d")),
      );

    g.append("g")
      .style("font-family", "monospace")
      .call(d3.axisLeft(y).tickFormat(yFormat));

    // Stacked areas: repaving (bottom) + ramps (top)
    const repavingArea = d3
      .area()
      .x((d) => x(2026 + d.year))
      .y0(innerHeight)
      .y1((d) => y(d.total_deferred_repaving))
      .curve(d3.curveMonotoneX);

    const totalArea = d3
      .area()
      .x((d) => x(2026 + d.year))
      .y0((d) => y(d.total_deferred_repaving))
      .y1((d) => y(d.total_deferred))
      .curve(d3.curveMonotoneX);

    const totalLine = d3
      .line()
      .x((d) => x(2026 + d.year))
      .y((d) => y(d.total_deferred))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "#d7191c")
      .attr("fill-opacity", 0.3)
      .attr("d", repavingArea);

    g.append("path")
      .datum(data)
      .attr("fill", "#f07b3a")
      .attr("fill-opacity", 0.3)
      .attr("d", totalArea);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FFF")
      .attr("stroke-width", 8)
      .attr("stroke-opacity", 0.25)
      .attr("d", totalLine);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#d7191c")
      .attr("stroke-width", 2)
      .attr("d", totalLine);

    const last = data[data.length - 1];

    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(last.total_deferred))
      .attr("dx", 6)
      .attr("dy", "-0.6em")
      .attr("fill", "#d7191c")
      .style("font-family", "monospace")
      .style("font-size", "10")
      .text("Total deferred:");
      
    g.append("text")
      .attr("x", x(2026 + last.year))
      .attr("y", y(last.total_deferred))
      .attr("dx", 6)
      .attr("dy", "0.6em")
      .attr("fill", "#d7191c")
      .style("font-family", "monospace")
      .style("font-size", "10")
      .text(yFormat(last.total_deferred));

    // Hover tooltip
    const container = ref.current.parentNode;
    const tooltip = d3
      .select(container)
      .append("div")
      .attr("class", "pci-tooltip")
      .style("display", "none");

    const crosshair = g
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .style("display", "none");

    svg
      .append("rect")
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

        crosshair
          .style("display", null)
          .attr("x1", x(clamped))
          .attr("x2", x(clamped));

        const containerRect = container.getBoundingClientRect();
        const tx = event.clientX - containerRect.left + 12;
        const ty = event.clientY - containerRect.top + 12;

        tooltip
          .style("display", "block")
          .style("left", `${tx}px`)
          .style("top", `${ty}px`)
          .html(`
            <div class="pci-tooltip-year">${2026 + d.year}</div>
            <div class="pci-tooltip-row"><span>Total deferred</span><span>${yFormat(d.total_deferred)}</span></div>
            <div class="pci-tooltip-row"><span>Repaving</span><span>${yFormat(d.total_deferred_repaving)}</span></div>
            <div class="pci-tooltip-row"><span>Ramps</span><span>${yFormat(d.total_deferred_ramps)}</span></div>
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
    </div>
  );
};

export default DeferredMaintenanceChart;
