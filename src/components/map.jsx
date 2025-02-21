import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const MapView = (props) => {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  var token = import.meta.env.MAPBOX_ACCESS_TOKEN;
  useEffect(() => {
    // if (map.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

    map.current.on("load", () => {
      map.current.addSource("routes", {
        type: "geojson",
        data: "../data/bus_delay_routes.geojson",
      });

      // map.current.addLayer({
      //   id: 'routes',
      //   type: 'circle',
      //   source: 'routes',
      //   // filter: ['==', ['get', 'Severe_Injury'], true],
      //   paint: {
      //   },
      // });
    });
    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <div>
      <p>{props.title}</p>
      <div
        className="map-container"
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default MapView;
