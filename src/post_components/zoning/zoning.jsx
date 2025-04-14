import React, { useState, useRef, useEffect } from "react";
import "./zoning.css";

// Utility functions from the tag slider code
const getPercentage = (containerWidth, distanceMoved) => {
  return (distanceMoved / containerWidth) * 100;
};

const limitNumberWithinRange = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const nearestN = (N, number) => Math.ceil(number / N) * N;

// Initial zoning data from the second file
const initialZoningData = {
  City: {
    zone: "Citywide",
    zoneAcreage: 151208,
    ogAcreage: 151208,
    totalPropertyTaxes: 1833669567,
    averagePropertyTaxPerAcre: 12127,
  },
  zones: [
    {
      zone: "R5",
      zoneAcreage: 315,
      ogAcreage: 315,
      totalPropertyTaxes: 38867062,
      averagePropertyTaxPerAcre: 123207,
      ten_averagePropertyTaxPerAcre: 392560,
      color: "#9d89f2",
    },
    {
      zone: "R4",
      zoneAcreage: 3999,
      ogAcreage: 3999,
      totalPropertyTaxes: 145301116,
      averagePropertyTaxPerAcre: 36335,
      ten_averagePropertyTaxPerAcre: 64660,
      color: "#e75ce9",
    },
    {
      zone: "R3",
      zoneAcreage: 13833,
      ogAcreage: 13833,
      totalPropertyTaxes: 340792478,
      averagePropertyTaxPerAcre: 24637,
      ten_averagePropertyTaxPerAcre: 46798,
      color: "#e9685c",
    },
    {
      zone: "R2",
      zoneAcreage: 23251,
      ogAcreage: 23251,
      totalPropertyTaxes: 276019601,
      averagePropertyTaxPerAcre: 11871,
      ten_averagePropertyTaxPerAcre: 26259,
      color: "#FFC300",
    },
    {
      zone: "R1",
      zoneAcreage: 109162,
      ogAcreage: 109162,
      totalPropertyTaxes: 1026014300,
      averagePropertyTaxPerAcre: 9399,
      ten_averagePropertyTaxPerAcre: 29663,
      color: "#f2f289",
    },
    {
      zone: "P",
      zoneAcreage: 648,
      ogAcreage: 648,
      totalPropertyTaxes: 6675011,
      averagePropertyTaxPerAcre: 10304,
      ten_averagePropertyTaxPerAcre: 21710,
      color: "#b8b5b4",
    },
  ],
};

// ZoneSection component (similar to TagSection from the first file)
const ZoneSection = ({
  zone,
  color,
  width,
  onSliderSelect,
  noSliderButton,
}) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div
      className="zone"
      style={{
        background: color,
        width: width + "%",
      }}
    >
      <span>{zone}</span>
      <br />
      <span>{width.toFixed(1) + "%"}</span>

      {!noSliderButton && (
        <div
        class="slider_handle"

          onPointerDown={onSliderSelect}
          className="slider-button"
        ></div>
      )}
    </div>
  );
};

const zoningUtility = () => {
  const zoningData = JSON.parse(JSON.stringify(initialZoningData));
  const [zones, setZones] = useState(zoningData.zones);



  // Calculate percentages based on zoneAcreage
  const calculateWidths = (zonesData) => {
    const totalAcreage = zoningData.City.zoneAcreage;
    return zonesData.map((zone) => (zone.zoneAcreage / totalAcreage) * 100);
  };

  const [widths, setWidths] = useState(calculateWidths(zones));
  const [totalPropertyTaxes, setTotalPropertyTaxes] = useState(
    zoningData.City.totalPropertyTaxes
  );
  const SliderRef = useRef(null);

  // Format numbers as currency
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Calculate total property taxes whenever zones change
  useEffect(() => {
    const updatedTotal = zones.reduce(
      (sum, zone) => sum + zone.totalPropertyTaxes,
      0
    );
    setTotalPropertyTaxes(updatedTotal);
  }, [zones]);

  // Reset function
  const resetZoning = () => {
    setZones([...zoningData.zones]);
    setWidths(calculateWidths(zoningData.zones));
  };

  return (
    <div className="zoning-slider">

      <div className="budget-info" style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          CITY BUDGET DEFICIT:
          <span
            style={{
              color:
                totalPropertyTaxes -
                  zoningData.City.totalPropertyTaxes -
                  931000000 >
                0
                  ? "green"
                  : "red",
              marginLeft: "10px",
            }}
          >
            {formatter.format(
              totalPropertyTaxes -
                zoningData.City.totalPropertyTaxes -
                931000000
            )}
          </span>
        </div>
        <div style={{ fontSize: "0.9rem" }}>
          Original Property Tax Income:{" "}
          {formatter.format(zoningData.City.totalPropertyTaxes)}
          <br />
          New Property Tax Income: {formatter.format(totalPropertyTaxes)}
        </div>
      </div>

      <div class="zone_chart marker">
        {zoningData.zones.map((z) => (
          <div
            class=""
            style={{
              width: (z.zoneAcreage / zoningData.City.zoneAcreage) * 100 + "%",
              backgroundColor: z.color,
            }}
          ></div>
        ))}
      </div>

      <div
        ref={SliderRef}
        class="zone_container"
      >
        {zones.map((zone, index) => (
          <ZoneSection
            key={index}
            zone={zone.zone}
            zoneAcreage={zone.zoneAcreage}
            color={zone.color}
            width={widths[index]}
            noSliderButton={index === zones.length - 1}
            onSliderSelect={(e) => {
              e.preventDefault();
              document.body.style.cursor = "ew-resize";

              const startDragX = e.pageX;
              const sliderWidth = SliderRef.current.offsetWidth;

              const resize = (e) => {
                e.preventDefault();
                const endDragX = e.touches ? e.touches[0].pageX : e.pageX;
                const distanceMoved = endDragX - startDragX;
                const maxPercent = widths[index] + widths[index + 1];

                const percentageMoved = nearestN(
                  0.1,
                  getPercentage(sliderWidth, distanceMoved)
                );

                const _widths = [...widths];
                const _zones = [...zones];

                const prevPercentage = _widths[index];
                const newPercentage = prevPercentage + percentageMoved;
                const currentSectionWidth = limitNumberWithinRange(
                  newPercentage,
                  0,
                  maxPercent
                );
                _widths[index] = currentSectionWidth;

                const nextSectionIndex = index + 1;
                const nextSectionNewPercentage =
                  _widths[nextSectionIndex] - percentageMoved;
                const nextSectionWidth = limitNumberWithinRange(
                  nextSectionNewPercentage,
                  0,
                  maxPercent
                );
                _widths[nextSectionIndex] = nextSectionWidth;

                // Update acreages based on new widths
                const totalAcreage = zoningData.City.zoneAcreage;
                _zones[index].zoneAcreage =
                  (currentSectionWidth / 100) * totalAcreage;
                _zones[nextSectionIndex].zoneAcreage =
                  (nextSectionWidth / 100) * totalAcreage;

                const newZoneIncome = (_zones[index].zoneAcreage - _zones[index].ogAcreage) * _zones[index].ten_averagePropertyTaxPerAcre

                // Update property taxes based on new acreages
                if (newZoneIncome > 0) {
                  _zones[index].totalPropertyTaxes = _zones[index].averagePropertyTaxPerAcre * _zones[index].ogAcreage + newZoneIncome
                } else {
                  _zones[index].totalPropertyTaxes = _zones[index].averagePropertyTaxPerAcre * _zones[index].ogAcreage
                }
            
                _zones[nextSectionIndex].totalPropertyTaxes =
                  _zones[nextSectionIndex].averagePropertyTaxPerAcre *
                  _zones[nextSectionIndex].zoneAcreage;

                setWidths(_widths);
                setZones(_zones);
              };

              window.addEventListener("pointermove", resize);
              window.addEventListener("touchmove", resize);

              const removeEventListener = () => {
                window.removeEventListener("pointermove", resize);
                window.removeEventListener("touchmove", resize);
              };

              const handleEventUp = (e) => {
                e.preventDefault();
                document.body.style.cursor = "initial";
                removeEventListener();
                window.removeEventListener("touchend", handleEventUp);
                window.removeEventListener("pointerup", handleEventUp);
              };

              window.addEventListener("touchend", handleEventUp);
              window.addEventListener("pointerup", handleEventUp);
            }}
          />
        ))}
      </div>

      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Acreage</th>
              <th>Change</th>
              <th>Total Property Taxes</th>
              <th>Tax per Acre</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.zone}>
                <td
                  style={{
                    backgroundColor: zone.color,
                  }}
                >
                  {zone.zone}
                </td>
                <td>{Math.round(zone.zoneAcreage).toLocaleString()}</td>
                <td>{Math.round(zone.zoneAcreage/zone.ogAcreage*100).toLocaleString()}%</td>
                <td>{formatter.format(zone.totalPropertyTaxes)}</td>
                <td>{formatter.format(zone.averagePropertyTaxPerAcre)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={resetZoning} style={{}}>
        Reset Zoning
      </button>
    </div>
  );
};

export default zoningUtility;
