import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./crosswalk_maps.css";

const COLOR_SCALE = (property) => [
  "interpolate", ["linear"], ["get", property],
  262,  "#2dc653",
  328,  "#f6cf57",
  600,  "#f5820d",
  1200, "#e84a4a",
  3000, "#8B0000",
];

const LEGEND_ITEMS = [
  { color: "#2dc653", label: "≤262 ft (within NACTO)" },
  { color: "#f6cf57", label: "328 ft (NACTO max)" },
  { color: "#f5820d", label: "600 ft" },
  { color: "#e84a4a", label: "1,200 ft" },
  { color: "#8B0000", label: "3,000+ ft" },
];

const CrosswalkMap = ({ map, desc }) => {
  const mapRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/jawshv/ckrfuew3j1n8j17o1bppw1n5z",
      center: [-118.35, 34.02],
      zoom: 10,
    });

    mapRef.current.on("load", () => {
      if (map === "crosswalks") {
        mapRef.current.addSource("crosswalks", {
          type: "geojson",
          data: "/data/Crosswalks_Arterials_Only.geojson",
        });

        mapRef.current.addLayer({
          id: "crosswalks",
          type: "circle",
          source: "crosswalks",
          paint: {
            "circle-radius": 3,
            "circle-color": COLOR_SCALE("nearest_same_primary_ft"),
            "circle-opacity": 0.8,
          },
        });

        mapRef.current.on("click", "crosswalks", (e) => {
          const p = e.features[0].properties;
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <b>${p.Primary_St} @ ${p.Cross_Stre}</b><br/>
              <span>Spacing:</span> ${Math.round(p.nearest_same_primary_ft).toLocaleString()} ft<br/>
              <span>Type:</span> ${p.Street_Designation_WO_Mod}<br/>
              <span>Control:</span> ${p.ControlTyp}
            `)
            .addTo(mapRef.current);
        });

        mapRef.current.on("mouseenter", "crosswalks", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "crosswalks", () => {
          mapRef.current.getCanvas().style.cursor = "";
        });
      }

      if (map === "neighborhoods") {
        mapRef.current.addSource("neighborhoods", {
          type: "geojson",
          data: "/data/Neighborhood_Crosswalk_Spacing_Arterials.geojson",
        });

        mapRef.current.addLayer({
          id: "neighborhoods-fill",
          type: "fill",
          source: "neighborhoods",
          paint: {
            "fill-color": COLOR_SCALE("Median_Spacing_ft"),
            "fill-opacity": 0.75,
          },
        });

        mapRef.current.addLayer({
          id: "neighborhoods-line",
          type: "line",
          source: "neighborhoods",
          paint: {
            "line-color": "#000",
            "line-opacity": 0.2,
            "line-width": 0.5,
          },
        });

        mapRef.current.on("click", "neighborhoods-fill", (e) => {
          const p = e.features[0].properties;
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <b>${p.NAME}</b><br/>
              <span>Median spacing:</span> ${Math.round(p.Median_Spacing_ft).toLocaleString()} ft<br/>
              <span>Mean spacing:</span> ${Math.round(p.Mean_Spacing_ft).toLocaleString()} ft<br/>
              <span>Crosswalks:</span> ${p.Crosswalk_Count.toLocaleString()}
            `)
            .addTo(mapRef.current);
        });

        mapRef.current.on("mouseenter", "neighborhoods-fill", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "neighborhoods-fill", () => {
          mapRef.current.getCanvas().style.cursor = "";
        });
      }
    });

    return () => mapRef.current?.remove();
  }, []);

  return (
    <div>
      <div ref={containerRef} className="crosswalk-map-container" />
      <div className="crosswalk-map-legend">
        <div className="legend-title">Crosswalk Spacing</div>
        {LEGEND_ITEMS.map(({ color, label }) => (
          <div key={label} className="legend-item">
            <div style={{ backgroundColor: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="subtitle">{desc}</p>
    </div>
  );
};

export default CrosswalkMap;
