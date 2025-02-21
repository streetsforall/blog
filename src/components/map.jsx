import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const MapView = (props) => {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!mapRef.current) {
      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/jawshv/ckrfuew3j1n8j17o1bppw1n5z",
          center: [-118.2, 34], // starting position [lng, lat]
          zoom: 9, // starting zoom
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

      if (props.load == 'all') {

        mapRef.current.addLayer({
          id: "routes",
          type: "fill",
          source: "routes",
          // filter: ['==', ['get', 'Severe_Injury'], true],
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "minutes_lost_per_mile"], // Property from your data
              0,
              "rgb(0, 255, 0)", // green
              2500,
              "rgb(255,165,0)", // orange
              10000,
              "rgb(255, 0, 0)", // red
            ],
            "fill-opacity": 0.8,
          },
        });
    } else if (props.load == 'percentiles') {
      mapRef.current.addLayer({
        id: "routes",
        type: "fill",
        source: "routes",
        filter: ['>', ['get', 'corridor_group_id_90'], 0],
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "minutes_lost_per_mile"], // Property from your data
            0,
            "rgb(0, 255, 0)", // green
            2500,
            "rgb(255,165,0)", // orange
            10000,
            "rgb(255, 0, 0)", // red
          ],
          "fill-opacity": 0.8,
        },
      });
    }
  });
    return () => {
      if (mapRef.current) {
        ``;
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
      <p class="subtitle">{props.desc}</p>
    </div>
  );
};

export default MapView;
