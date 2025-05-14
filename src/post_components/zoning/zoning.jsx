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
      SB_Acreage: 2000.53,
      totalPropertyTaxes: 89706846.22,
      averagePropertyTaxPerAcre: 148750.3058,
      ten_averagePropertyTaxPerAcre: 392560.5201,
      color: "#9d89f2",
    },
    {
      zone: "R4",
      zoneAcreage: 13718.34,
      ogAcreage: 13718.34,
      SB_Acreage: 18845.24,
      totalPropertyTaxes: 332342622.51,
      averagePropertyTaxPerAcre: 24226.16204,
      ten_averagePropertyTaxPerAcre: 64660.93448,
      color: "#e75ce9",
    },
    {
      zone: "R3",
      zoneAcreage: 26958.1,
      ogAcreage: 26958.1,
      SB_Acreage: 30961.33,
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
      ten_averagePropertyTaxPerAcre: 29663.71,
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
          className="slider_handle slider-button"
          onPointerDown={onSliderSelect}
        ></div>
      )}
    </div>
  );
};

const zoningUtility = () => {
  const zoningData = JSON.parse(JSON.stringify(initialZoningData));
  const [zones, setZones] = useState(zoningData.zones);
  const [redev, setRedev] = useState(20);
  const [button, setButton] = useState(79);

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

      // solve for new zoning that has been redeveloped
      // subtract any any parcels that have been redeveloped from OG zoning
      // new acres changed if above 0

      const redevedAcres =
        zone.zoneAcreage - originalAcreage < 0
          ? 0
          : zone.zoneAcreage - originalAcreage;

      const unChangedAcres = currentAcreage - redevedAcres;

      let newDev = redevedAcres * zone.ten_averagePropertyTaxPerAcre;

      let oldDev = unChangedAcres * zone.averagePropertyTaxPerAcre;

      let newTotalTaxes = newDev + oldDev;

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

    let redevRatio =
      updatedTotal * (redev / 100) +
      zoningData.City.totalPropertyTaxes * (1 - redev / 100);

    setTotalPropertyTaxes(redevRatio);
  }, [zones]);

  // update zones
  useEffect(() => {
    const updatedZones = calculatePropertyTaxes(zones, redev, 0);
    setZones(updatedZones);
  }, [redev]);

  // Reset function
  const resetZoning = (modelType) => {
    setButton(modelType);

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

    const updatedZones = calculatePropertyTaxes(resetZones, redev, modelType);

    setZones(updatedZones);
    setWidths(calculateWidths(resetZones));
  };

  useEffect(() => {
    resetZoning(79);
  }, []);

  const handleChange = (event) => {
    setRedev(parseInt(event.target.value));
  };

  return (
    <div className="zoning-slider">
      <h4>Zoning Property Tax Calculator</h4>

      <p className="label">
        This calculator allows you to adjust zoning buckets and see how much
        revenue could be brought in by property taxes. It currently assumes a
        redevelopment ratio of
        <select value={redev} onChange={handleChange}>
          <option value="0">0%</option>
          <option value="20">20%</option>
          <option value="40">40%</option>
          <option value="60">60%</option>
          <option value="80">80%</option>
          <option value="100">100%</option>
        </select>
      </p>

      <div className="budget-info" style={{ marginBottom: "20px" }}>
        <button
          style={{
            color: button === 79 ? "black" : "",
          }}
          onClick={() => resetZoning(79)}
        >
          SB 79 Model
        </button>

        <button
          style={{
            color: button === 2024 ? "black" : "",
          }}
          onClick={() => resetZoning(2024)}
        >
          2024 Zoning
        </button>

        <div>
          <table>
            <tbody>
              <tr>
                <td>2024 Property Tax Roll:</td>
                <td>
                  {formatter.format(
                    zoningData.City.totalPropertyTaxes + 998281212
                  )}
                </td>
              </tr>
              <tr>
                <td>Modeled Property Tax Roll:</td>
                <td>{formatter.format(totalPropertyTaxes + 998281212)}</td>
              </tr>
              <tr>
                <td>New Property Tax Revenue:</td>
                <td
                  style={{
                    color:
                      totalPropertyTaxes - zoningData.City.totalPropertyTaxes >
                      0
                        ? "green"
                        : "red",
                    marginLeft: "10px",
                  }}
                >
                  {formatter.format(
                    totalPropertyTaxes - zoningData.City.totalPropertyTaxes
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="zone_chart marker">
        {zoningData.zones.map((z) => (
          <div
            key={z.zone}
            style={{
              width: (z.zoneAcreage / zoningData.City.zoneAcreage) * 100 + "%",
              backgroundColor: z.color,
            }}
          ></div>
        ))}
      </div>

      <div ref={SliderRef} className="zone_container">
        {zones.map((zone, index) => (
          // loop each zone
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

              const startDragX = e.touches ? e.touches[0].pageX : e.pageX;
              const sliderWidth = SliderRef.current.offsetWidth;

              setButton(0);

              const resize = (e) => {
                // Properly handle both touch and mouse events
                if (e.cancelable) {
                  e.preventDefault();
                }

                // Get current pointer position, properly handling touch events
                let currentX;
                if (e.touches && e.touches.length > 0) {
                  currentX = e.touches[0].pageX;
                } else {
                  currentX = e.pageX;
                }

                const distanceMoved = currentX - startDragX;
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

                let redevedAcres =
                  _zones[index].zoneAcreage - _zones[index].ogAcreage < 0
                    ? 0
                    : _zones[index].zoneAcreage - _zones[index].ogAcreage;

                let unChangedAcres = _zones[index].zoneAcreage - redevedAcres;

                let newDev =
                  redevedAcres * _zones[index].ten_averagePropertyTaxPerAcre;

                let oldDev =
                  unChangedAcres * _zones[index].averagePropertyTaxPerAcre;

                let newTotalTaxes = newDev + oldDev;

                if (newTotalTaxes < 0) {
                  newTotalTaxes = 0;
                }

                _zones[index].totalPropertyTaxes = newTotalTaxes;

                // Handle the next section
                redevedAcres =
                  _zones[nextSectionIndex].zoneAcreage -
                    _zones[nextSectionIndex].ogAcreage <
                  0
                    ? 0
                    : _zones[nextSectionIndex].zoneAcreage -
                      _zones[nextSectionIndex].ogAcreage;

                unChangedAcres =
                  _zones[nextSectionIndex].zoneAcreage - redevedAcres;

                newDev =
                  redevedAcres *
                  _zones[nextSectionIndex].ten_averagePropertyTaxPerAcre;

                oldDev =
                  unChangedAcres *
                  _zones[nextSectionIndex].averagePropertyTaxPerAcre;

                newTotalTaxes = newDev + oldDev;

                if (newTotalTaxes < 0) {
                  newTotalTaxes = 0;
                }

                _zones[nextSectionIndex].totalPropertyTaxes = newTotalTaxes;

                setWidths(_widths);
                setZones(_zones);
              };

              // Use passive: false to allow preventDefault in touchmove
              window.addEventListener("pointermove", resize, {
                passive: false,
              });
              window.addEventListener("touchmove", resize, { passive: false });

              const removeEventListeners = () => {
                window.removeEventListener("pointermove", resize);
                window.removeEventListener("touchmove", resize);
                window.removeEventListener("touchend", handleEventUp);
                window.removeEventListener("touchcancel", handleEventUp);
                window.removeEventListener("pointerup", handleEventUp);
              };

              const handleEventUp = (e) => {
                if (e.cancelable) {
                  e.preventDefault();
                }
                document.body.style.cursor = "initial";
                removeEventListeners();
              };

              window.addEventListener("touchend", handleEventUp);
              window.addEventListener("touchcancel", handleEventUp); // Add this for better mobile handling
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
              <th>Avg Tax/Acre</th>
              <th>Recent Avg Tax/Acre</th>
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
