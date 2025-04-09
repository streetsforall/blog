import React, { useEffect, useState } from "react";
import "./zoning.css";

const zoningData = {
  City: {
    zone: "Citywide",
    zoneAcreage: 151208,
    totalPropertyTaxes: 1833669567,
    averagePropertyTaxPerAcre: 12127,
  },
  zones: [
    {
      zone: "R5",
      zoneAcreage: 315,
      totalPropertyTaxes: 38867062,
      averagePropertyTaxPerAcre: 123207,
      zoneAcreage: 315,
      color: "#9d89f2",
    },
    {
      zone: "R4",
      zoneAcreage: 3999,
      totalPropertyTaxes: 145301116,
      averagePropertyTaxPerAcre: 36335,
      zoneAcreage: 3999,
      color: "#e75ce9",
    },
    {
      zone: "R3",
      zoneAcreage: 13833,
      totalPropertyTaxes: 340792478,
      averagePropertyTaxPerAcre: 24637,
      zoneAcreage: 13833,
      color: "#e9685c",
    },
    {
      zone: "R2",
      zoneAcreage: 23251,
      totalPropertyTaxes: 276019601,
      averagePropertyTaxPerAcre: 11871,
      zoneAcreage: 23251,
      color: "#FFC300 ",
    },
    {
      zone: "R1",
      zoneAcreage: 109162,
      totalPropertyTaxes: 1026014300,
      averagePropertyTaxPerAcre: 9399,
      zoneAcreage: 109162,
      color: " #f2f289 ",
    },
    {
      zone: "P",
      zoneAcreage: 648,
      totalPropertyTaxes: 6675011,
      averagePropertyTaxPerAcre: 10304,
      zoneAcreage: 648,
      color: "#b8b5b4",
    },
  ],
};

const zoningUtility = (props) => {
  // state holds a copy of zoning
  const startingData = JSON.parse(JSON.stringify(zoningData));
  const [zones, setZones] = useState([...startingData.zones]);
  const [reZones, setReZones] = useState([]);
  const [rezoneCount, setRezoneCount] = useState(0);
  const [totalPropertyTaxesSum, setTotalPropertyTaxesSum] = useState(0);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Function to add a new rezone component
  const newRezone = () => {
    const newRezone = {
      id: rezoneCount + 1,
      from_zone: "R1",
      to_zone: "R2",
      acres: 0,
    };
    setRezoneCount((prevCount) => prevCount + 1);
    setReZones((prevReZones) => [...prevReZones, newRezone]);
  };

 // Function to handle changes in rezone values
 const handleRezoneChange = (id, field, value) => {
  setReZones(prevReZones => 
    prevReZones.map(rezone => 
      rezone.id === id ? { ...rezone, [field]: value } : rezone
    )
  );
};

  // Function to remove a rezone component
  const removeRezone = (id) => {
    setReZones(reZones.filter((rezone) => rezone.id !== id));
    setZones([...startingData.zones]);
  };

  // update calcs
  useEffect(() => {
    const updatedZones = [...zones]; // Create a copy of the zones array

    reZones.forEach((z) => {
      const f_zone = updatedZones.find((zo) => zo.zone === z.from_zone);
      const t_zone = updatedZones.find((zo) => zo.zone === z.to_zone);
      const f_base = zoningData.zones.find((zo) => zo.zone === z.from_zone);
      const t_base = zoningData.zones.find((zo) => zo.zone === z.to_zone);

      if (f_zone && t_zone) {
        const acres = Number(z.acres);

        // Ensure that acres is a valid number and not NaN
        if (!isNaN(acres) && acres > 0) {
          // make sure we aren't making zoning amount negative
          const newFromZoneAcreage = f_zone.zoneAcreage - acres;
          if (newFromZoneAcreage > 0) {

            console.log('calcularing zone change from', f_zone.zoneAcreage / f_base.zoneAcreage, acres)
            console.log('calcularing zone change to', t_zone.zoneAcreage, acres)

            // recalculate zoning data for both zoning
            f_zone.zoneAcreage = f_base.zoneAcreage  -  acres;
            f_zone.totalPropertyTaxes =
              f_zone.averagePropertyTaxPerAcre * f_zone.zoneAcreage;

            t_zone.zoneAcreage = t_base.zoneAcreage +  acres;
            t_zone.totalPropertyTaxes =
              t_zone.averagePropertyTaxPerAcre * t_zone.zoneAcreage;
          } else {

            // invalid
            // z.acres = f_zone.zoneAcreage;
          }
        }
      }
    });

    console.log("zonign data", zoningData.zones);

    const totalTaxes = zones.reduce(
      (sum, zone) => sum + zone.totalPropertyTaxes,
      0
    );
    setTotalPropertyTaxesSum(totalTaxes);

    // Update zones state with the new values
    setZones(updatedZones);
  }, [reZones]);

  return (
    <div>
      <hr />
      <p class="budget_head">
        CITY BUDGET DEFICIT:
        {
          <span
            className={
              totalPropertyTaxesSum -
                zoningData.City.totalPropertyTaxes -
                931000000 >
              0
                ? "green"
                : "red"
            }
          >
            {formatter.format(
              totalPropertyTaxesSum -
                zoningData.City.totalPropertyTaxes -
                931000000
            )}
          </span>
        }
        </p>
        <p class="budget_sub">
        2024 Property Tax Income: {formatter.format(zoningData.City.totalPropertyTaxes)}
        <br />
        New Property Tax Income: {formatter.format(totalPropertyTaxesSum)}
        </p>
      Current Zone Data
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Acreage</th>
            <th>Total Property Taxes</th>
            <th>Average Property Tax per Acre</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.zone}>
              <td style={{ backgroundColor: zone.color }}>{zone.zone}</td>
              <td>{zone.zoneAcreage}</td>
              <td>{formatter.format(zone.totalPropertyTaxes)}</td>
              <td>{formatter.format(zone.averagePropertyTaxPerAcre)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="zone_charts">
        <p>Zones by area</p>
        <div class="zone_chart marker">
          {zoningData.zones.map((z) => (
            <div
              class=""
              style={{
                width:
                  (z.zoneAcreage / zoningData.City.zoneAcreage) * 100 + "%",
                  backgroundColor: z.color,
              }}
            >
            </div>
          ))}
        </div>
        <div class="zone_chart">
          {zones.map((z) => (
            <div
              class=""
              style={{
                width:
                  (z.zoneAcreage / zoningData.City.zoneAcreage) * 100 + "%",
                backgroundColor: z.color,
              }}
            >
              {z.zone}
            </div>
          ))}
        </div>
        <p>Zones by revenue</p>
        <div class="zone_chart marker">
          {zoningData.zones.map((z) => (
            <div
              class=""
              style={{
                width:
                  (z.totalPropertyTaxes / zoningData.City.totalPropertyTaxes) * 100 + "%",
                  backgroundColor: z.color,
              }}
            >
            </div>
          ))}
        </div>
        <div class="zone_chart">
          {zones.map((zone) => (
            <div
              class=""
              style={{
                width:
                  (zone.totalPropertyTaxes /
                    zoningData.City.totalPropertyTaxes) *
                    100 +
                  "%",
                backgroundColor: zone.color,
              }}
            >
              {zone.zone}
            </div>
          ))}
        </div>
      </div>
      <br/>
      <div class="rezones">
        <button class="rezone_button" onClick={newRezone}>Add New Rezone</button>
        <div>
          {reZones &&
            reZones.map((rezone) => (
              <div class="zone_component" key={rezone.id}>
                <div class="zone_header">
                  <span> Rezone {rezone.id}</span>
                  <button onClick={() => removeRezone(rezone.id)}>
                    Remove
                  </button>
                </div>
                <div class="zone_selector">
                  <div>
                    <label>From Zone:</label>
                    <select
                      value={rezone.from_zone}
                      onChange={(e) =>
                        handleRezoneChange(
                          rezone.id,
                          "from_zone",
                          e.target.value
                        )
                      }
                    >
                      {zones.map((zone) => (
                        <option key={zone.zone} value={zone.zone}>
                          {zone.zone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>To Zone:</label>
                    <select
                      value={rezone.to_zone}
                      onChange={(e) =>
                        handleRezoneChange(rezone.id, "to_zone", e.target.value)
                      }
                    >
                      {zones.map((zone) => (
                        <option key={zone.zone} value={zone.zone}>
                          {zone.zone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label>Acres to Convert:</label>

                  <input
                    type="number"
                    step="100"
                    // value={rezone.acres}
                    onChange={(e) => {
                      handleRezoneChange(
                          rezone.id,
                          "acres",
                          Number(e.target.value),
                          rezone.acres
                      );
                    }}
                    min="0"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default zoningUtility;
