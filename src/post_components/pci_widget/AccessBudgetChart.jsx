import { useRef, useEffect } from "react";
import * as d3 from "d3";

const DATA = [
  { year: 2020, repaving: 150507060, reconstruction: 25139189, ramps: 0,        sidewalk: 32022406 },
  { year: 2021, repaving: 147886881, reconstruction: 22326192, ramps: 0,        sidewalk: 34969248 },
  { year: 2022, repaving: 102185524, reconstruction: 24894086, ramps: 0,        sidewalk: 44462463 },
  { year: 2023, repaving: 121103822, reconstruction: 24437124, ramps: 9679109,  sidewalk: 35743000 },
  { year: 2024, repaving: 114310337, reconstruction: 24252931, ramps: 20327041, sidewalk: 61500443 },
  { year: 2025, repaving: 89284901, reconstruction: 3490557,  ramps: 36052158, sidewalk: 35743000 },
  { year: 2026, repaving: 74570524,  reconstruction: 0,        ramps: 30017057, sidewalk: 40262632 },
  { year: 2027, repaving: 79807807,  reconstruction: 0,        ramps: 43597524, sidewalk: 36253074 },
];

const KEYS = ["sidewalk", "reconstruction", "repaving", "ramps"];
const LABELS = {
  repaving:       "PPP Repaving",
  ramps:          "PPP Access Ramps",
  reconstruction: "Reconstruction",
  sidewalk:       "Sidewalk Repair Fund",
};
const COLORS = {
  repaving:       "#6088d1",
  reconstruction: "#be5ccb",
  ramps:          "#85db4f",
  sidewalk:       "#d6ad4d",
};

const fmt = (v) => `$${(v / 1_000_000).toFixed(1)}M`;

const BSSBudgetChart = () => {
  const ref = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 65 };
    const innerWidth = 700 - margin.left - margin.right;
    const innerHeight = 320 - margin.top - margin.bottom;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0,0,700,320")
      .attr("preserveAspectRatio", "xMinYMin");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const stackedData = d3.stack().keys(KEYS)(DATA);

    const x = d3.scaleLinear()
      .domain([2020, 2027])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]))])
      .nice()
      .range([innerHeight, 0]);

    const area = d3.area()
      .x((d) => x(d.data.year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .style("font-family", "monospace")
      .call(d3.axisBottom(x).tickValues(DATA.map((d) => d.year)).tickFormat(d3.format("d")));

    g.append("g")
      .style("font-family", "monospace")
      .call(d3.axisLeft(y).tickFormat(fmt));

    g.selectAll(".layer")
      .data(stackedData)
      .join("path")
      .attr("class", "layer")
      .attr("fill", (d) => COLORS[d.key])
      .attr("fill-opacity", 0.85)
      .attr("d", area);

    // Hover
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "white")
      .style("border", "1px solid #dadada")
      .style("border-radius", "4px")
      .style("padding", "0.5rem")
      .style("font-family", "monospace")
      .style("font-size", "0.8rem")
      .style("min-width", "12rem")
      .style("display", "none");

    const crosshair = g.append("line")
      .attr("y1", 0).attr("y2", innerHeight)
      .attr("stroke", "#333").attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .style("display", "none");

    svg.append("rect")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", innerWidth).attr("height", innerHeight)
      .attr("fill", "none").attr("pointer-events", "all")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx));
        const clamped = Math.max(2020, Math.min(2027, year));
        const d = DATA.find((r) => r.year === clamped);
        if (!d) return;

        crosshair.style("display", null).attr("x1", x(clamped)).attr("x2", x(clamped));

        const total = KEYS.reduce((s, k) => s + d[k], 0);
        const rect = containerRef.current.getBoundingClientRect();
        const tx = event.clientX - rect.left + 12;
        const ty = event.clientY - rect.top + 12;

        tooltip.style("display", "block").style("left", `${tx}px`).style("top", `${ty}px`)
          .html(`
            <div style="font-weight:bold;border-bottom:1px solid #dadada;padding-bottom:0.25rem;margin-bottom:0.25rem">${d.year}</div>
            ${[...KEYS].reverse().map((k) => `
              <div style="display:flex;justify-content:space-between;gap:1rem;color:${COLORS[k]}">
                <span>${LABELS[k]}</span><span>${fmt(d[k])}</span>
              </div>`).join("")}
            </div>
          `);
      })
      .on("mouseleave", () => {
        crosshair.style("display", "none");
        tooltip.style("display", "none");
      });
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: "monospace", fontSize: "0.9rem", margin: "1.5rem 0" }}>
      <svg ref={ref} />
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
        {[...KEYS].reverse().map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "1rem", height: "1rem", backgroundColor: COLORS[k], opacity: 0.85 }} />
            {LABELS[k]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BSSBudgetChart;
