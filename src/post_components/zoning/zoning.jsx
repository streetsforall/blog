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
    zoneAcreage: 151488,
    ogAcreage: 151488,
    totalPropertyTaxes: 1840800788,
    averagePropertyTaxPerAcre: 12127,
  },
  zones: [
    {
      zone: "R5",
      zoneAcreage: 603.07,
      ogAcreage: 603.07,
      SB_Acreage: 1691.05,
      totalPropertyTaxes: 89706846.22,
      averagePropertyTaxPerAcre: 148750.3058,
      ten_averagePropertyTaxPerAcre: 392560.5201,
      color: "#9d89f2",
    },
    {
      zone: "R4",
      zoneAcreage: 13718.34,
      ogAcreage: 13718.34,
      SB_Acreage: 17320.4,
      totalPropertyTaxes: 332342622.51,
      averagePropertyTaxPerAcre: 24226.16204,
      ten_averagePropertyTaxPerAcre: 64660.93448,
      color: "#e75ce9",
    },
    {
      zone: "R3",
      zoneAcreage: 26958.1,
      ogAcreage: 26958.1,
      SB_Acreage: 32795.6,
      totalPropertyTaxes: 439214517.95,
      averagePropertyTaxPerAcre: 16292.49069,
      ten_averagePropertyTaxPerAcre: 36963.23072,
      color: "#e9685c",
    },
    {
      zone: "R2",
      zoneAcreage: 7404.66,
      ogAcreage: 7404.66,
      SB_Acreage: 5383.25,
      totalPropertyTaxes: 68994255.65,
      averagePropertyTaxPerAcre: 9317.686392,
      ten_averagePropertyTaxPerAcre: 22513.38083,
      color: "#FFC300",
    },
    {
      zone: "R1",
      zoneAcreage: 102156.57,
      ogAcreage: 102156.57,
      SB_Acreage: 93827.28,
      totalPropertyTaxes: 904077386.31,
      averagePropertyTaxPerAcre: 8849.919288,
      ten_averagePropertyTaxPerAcre: 21710.76407,
      color: "#f2f289",
    },
    {
      zone: "P",
      zoneAcreage: 647.83,
      ogAcreage: 647.83,
      SB_Acreage: 470.94,
      totalPropertyTaxes: 6675010.69,
      averagePropertyTaxPerAcre: 9979.3488,
      ten_averagePropertyTaxPerAcre: 29663.70931,
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
  const [slider, setSlider] = useState(50);

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

  // Recalculate property taxes based on prop13 toggle
  const calculatePropertyTaxes = (zonesData, sliderValue) => {
    return zonesData.map((zone) => {
      const currentAcreage = zone.zoneAcreage;
      const originalAcreage = zone.ogAcreage;

      const modAcres = currentAcreage - originalAcreage;
      let newTotalTaxes;

      // console.log(currentAcreage, modAcres + originalAcreage)

      if (modAcres > 0) {

        const newDev =
          modAcres * zone.ten_averagePropertyTaxPerAcre * (sliderValue / 100);

        const oldDev =
          originalAcreage * 
          zone.averagePropertyTaxPerAcre +
          modAcres *
            zone.averagePropertyTaxPerAcre *
            ((100 - sliderValue) / 100);

        newTotalTaxes = (newDev + oldDev) * 1.52;

      } else {
        newTotalTaxes = currentAcreage * zone.averagePropertyTaxPerAcre;
      }

      if (newTotalTaxes < 0) {
        newTotalTaxes = 0;
      }

      return {
        ...zone,
        totalPropertyTaxes: newTotalTaxes,
      };
    });
  };

  // Calculate total property taxes whenever zones change
  useEffect(() => {
    const updatedTotal = zones.reduce(
      (sum, zone) => sum + zone.totalPropertyTaxes,
      0
    );
    setTotalPropertyTaxes(updatedTotal);
  }, [zones, slider]);

  useEffect(() => {
    const updatedZones = calculatePropertyTaxes(zones, slider, 0);
    setZones(updatedZones);
  }, [slider]);

  // Reset function
  const resetZoning = (modelType) => {
    const resetZones = JSON.parse(JSON.stringify(zoningData.zones));

    if (modelType === 79) {
      resetZones.forEach((zone) => {
        zone.zoneAcreage = zone.SB_Acreage;
      });
    } else {
      resetZones.forEach((zone) => {
        zone.zoneAcreage = zone.ogAcreage;
      });
    }

    const updatedZones = calculatePropertyTaxes(resetZones, slider, modelType);

    setZones(updatedZones);
    setWidths(calculateWidths(resetZones));
  };

  // useEffect(() => {
  //   resetZoning(79);
  // }, []);

  const handleChange = (event) => {
    setSlider(parseInt(event.target.value));
  };

  return (
    <div className="zoning-slider">
      <h4>Zoning Property Tax Calculator</h4>

      <div className="budget-info" style={{ marginBottom: "20px" }}>
        <button onClick={() => resetZoning(79)} style={{}}>
          Show SB 79 Model
        </button>

        <button onClick={() => resetZoning(2024)} style={{}}>
          Show 2024 Zoning
        </button>

        <div
          style={
            {
              // fontSize: "1.2rem",
              // fontWeight: "bold",
              // marginBottom: "10px",
            }
          }
        >
          <table>
            <tbody>
              <tr>
                <td>City Budget Deficit:</td>
                <td
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
                </td>
              </tr>
              <tr>
                <td>2024 Property Tax Roll:</td>
                {formatter.format(zoningData.City.totalPropertyTaxes)}
              </tr>
              <tr>
                <td>Modeled Property Tax Roll:</td>
                <td>{formatter.format(totalPropertyTaxes)}</td>
              </tr>
              <tr>
                <td>Net Property Taxes:</td>
                <td>
                  {formatter.format(
                    totalPropertyTaxes - zoningData.City.totalPropertyTaxes
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="dev_slider">
        <input
          type="range"
          min="10"
          max="90"
          value={slider}
          onChange={handleChange}
          step="10"
        />

        <label>
          <span style={{ color: "black" }}>{slider}%</span> of rezoning
          redeveloped
        </label>
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

      <div ref={SliderRef} class="zone_container">
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

                var newZoneIncome =
                  _zones[index].averagePropertyTaxPerAcre *
                  _zones[index].zoneAcreage;

                var modAcres =
                  _zones[index].zoneAcreage - _zones[index].ogAcreage;

                if (modAcres > 0) {
                  newZoneIncome =
                    modAcres * _zones[index].ten_averagePropertyTaxPerAcre +
                    _zones[index].averagePropertyTaxPerAcre *
                      _zones[index].ogAcreage;
                }

                // Update property taxes based on new acreages
                if (newZoneIncome > 0) {
                  _zones[index].totalPropertyTaxes = newZoneIncome;
                } else {
                  _zones[index].totalPropertyTaxes = 0;
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
              <th>Total Tax/Acre</th>
              <th>Recent Tax/Acre</th>
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
                <td>
                  {Math.round(
                    (zone.zoneAcreage / zone.ogAcreage) * 100
                  ).toLocaleString()}
                  %
                </td>
                <td>{formatter.format(zone.totalPropertyTaxes)}</td>
                <td>{formatter.format(zone.averagePropertyTaxPerAcre)}</td>
                <td>{formatter.format(zone.ten_averagePropertyTaxPerAcre)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default zoningUtility;
