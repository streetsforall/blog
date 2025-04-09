import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./map_legend.css";

import "mapbox-gl/dist/mapbox-gl.css";

const MapView = (props) => {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [activeFilter, setActiveFilter] = useState("corridor_group_id_90");

  const applyFilter = (filterType) => {
    if (
      mapRef.current &&
      mapRef.current.isStyleLoaded() &&
      mapRef.current.getLayer("routes")
    ) {
      setActiveFilter(filterType);
      mapRef.current.setFilter("routes", [">", ["get", filterType], 0]);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!mapRef.current) {
      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/jawshv/ckrfuew3j1n8j17o1bppw1n5z",
          center: [-118.25, 34.05], // starting position [lng, lat]
          zoom: 10.5, // starting zoom
        });

        // error handling
        mapRef.current.on("error", (e) => {
          console.error("Mapbox error:", e);
        });

        mapRef.current.on("load", () => {
          console.log("Map loaded successfully");
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    mapRef.current.on("load", () => {
      mapRef.current.addSource("routes", {
        type: "geojson",
        data: "/data/bus_delay_routes.geojson",
      });

      // load different layers in different places
      if (props.load == "all") {
        mapRef.current.addLayer({
          id: "routes",
          type: "fill",
          source: "routes",
          filter: ["!=", ["get", "minutes_lost_per_mile"], null],
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "minutes_lost_per_mile"], // Property from your data
              0,
              "rgb(40, 200, 40)", // green
              3500,
              "rgb(255,165,40)", // orange
              6500,
              "rgb(255, 30, 30)", // red
              10000,
              "rgb(140, 30, 30)", // red
            ],
            "fill-opacity": 0.8,
          },
        });
      } else if (props.load == 'percentiles') {
        mapRef.current.addLayer({
          id: "routes",
          type: "fill",
          source: "routes",
          filter: ['>', ['get', activeFilter], 0],
          paint: {
            "fill-color":
              "rgb(255, 0, 0)",
            "fill-opacity": 0.8,
          },
        });
      }

      mapRef.current.on("click", "routes", (e) => {
        const coordinates = e.features[0].geometry.coordinates[0][0];
        const description = `
        <b>Weekday Segment Stats</b></br>
      <span>Rider delay: </span> ${Math.round(e.features[0].properties.minutes_lost_per_mile).toLocaleString()
        } minutes</br>

      <span>Segment Ridership: </span> ${e.features[0].properties.calculated_segment_ridership.toLocaleString()} </br>
      
      <span>50th Perc. Speed: </span>  ${parseFloat(
        e.features[0].properties.p50_mph
      ).toFixed(1)} MPH </br>

      `;

        console.log(coordinates);

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(mapRef.current);
      });

      mapRef.current.on("mouseenter", "routes", () => {
        mapRef.current.getCanvas().style.cursor = "pointer";
      });

      mapRef.current.on("mouseleave", "routes", () => {
        mapRef.current.getCanvas().style.cursor = "";
      });
    });
    return () => {
      if (mapRef.current) {
        ``;
        mapRef.current.remove();
      }
    };
  }, []);

  // Handle filter button click to update the map layer filter
  const handleFilterChange = (filterType) => {
    applyFilter(filterType);
  };

  return (
    <div>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "10px",
          overflow: "hidden",
          position: "relative",
        }}
      />

      {props.load === "all" && (
        <div id="legend" className="map_legend">
          <div className="legend_title">Rider Minutes Lost Per Mile</div>
          <div className="legend_item">
            <div style={{ backgroundColor: "rgb(40, 200, 40)" }}></div>
            <span>0</span>
          </div>
          <div className="legend_item">
            <div style={{ backgroundColor: "rgb(255,165,40)" }}></div>
            <span>3,500</span>
          </div>
          <div className="legend_item">
            <div style={{ backgroundColor: "rgb(255, 30, 30)" }}></div>
            <span>6,500</span>
          </div>
          <div className="legend_item">
            <div style={{ backgroundColor: "rgb(140, 30, 30)" }}></div>
            <span>10,000+</span>
          </div>
        </div>
      )}

      {props.load === "percentiles" && (
        <div className="filter-controls">
          <button
            style={{
              color: activeFilter === "corridor_group_id_85" ? "black" : "",
            }}
            onClick={() => handleFilterChange("corridor_group_id_85")}
          >
            85th Percentile
          </button>
          <button
            style={{
              color: activeFilter === "corridor_group_id_90" ? "black" : "",
            }}
            onClick={() => handleFilterChange("corridor_group_id_90")}
          >
            90th Percentile
          </button>
          <button
            style={{
              color: activeFilter === "corridor_group_id_95" ? "black" : "",
            }}
            onClick={() => handleFilterChange("corridor_group_id_95")}
          >
            95th Percentile
          </button>
        </div>
      )}

      <p class="subtitle">{props.desc}</p>
    </div>
  );
};

export default MapView;
