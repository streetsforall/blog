import { useState, useEffect } from "react";
import "./style.css";

import PCIDegradationChart from "./PCIDegradationChart";
import DeferredMaintenanceChart from "./DeferredMaintenanceChart";

const BUDGET_OPTIONS = [72, 100, 200, 400];
const RAMP_OPTIONS = [
  "Large Asphalt Repair",
  "Curb Ramps - 50k",
  "Curb Ramps - 10k",
];

function round(n, digits = 0) {
  const magnitude = Math.pow(10, digits);
  return (Math.round(magnitude * n) / magnitude).toLocaleString();
}
function getTotalRamps(years) {
  return years.reduce(
    (agg, b) => agg + b.ramps_from_dedicated + b.ramps_from_repaving,
    0,
  );
}

function calculateChange(data, model) {
  const modelResults = data[model];
  const difference =
    modelResults.years[10].avg_pci - modelResults.years[0].avg_pci;
  const isLower = difference < 0;
  return {
    delta: round(Math.abs(difference)),
    symbol: isLower ? "↓" : "↑",
    isLower,
  };
}

const VIEWS = ["Street Quality", "Deferred Maintenance", "City Map"];

const PCIWidget = () => {
  const [data, setData] = useState(null);
  const [selectedModel, setSelectedModel] = useState("lar_72m");
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [selectedRampStrategy, setSelectedRampStrategy] = useState(
    RAMP_OPTIONS[0],
  );
  const [selectedView, setSelectedView] = useState(VIEWS[0]);

  useEffect(() => {
    fetch("/data/pci_scenario_results.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="pci_widget">Loading...</div>;

  let modelResults = data[selectedModel];
  let pciChange = calculateChange(data, selectedModel);
  let imageUrl = `/images/pci_maps/${selectedBudget}M_${selectedRampStrategy === "Large Asphalt Repair" ? "lar" : "resurf"}.png`;
  console.log(modelResults);
  return (
    <div className="pci_widget">

      <div className="controls">
        <div>
          <label>Annual Street Maintenance Budget</label>
          <select
            name="budget_selector"
            className="selector"
            value={selectedBudget}
            onChange={(e) => {
              const budget = e.target.value;
              setSelectedBudget(e.target.value);

              if (selectedRampStrategy === "Large Asphalt Repair") {
                setSelectedModel(`lar_${budget}m`);
              } else if (selectedRampStrategy === "Curb Ramps - 10k") {
                setSelectedModel(`resurf_10k_${budget}m`);
              } else {
                setSelectedModel(`resurf_50k_${budget}m`);
              }
            }}
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                ${(option * 1_000_000).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Access Ramp Strategy</label>
          <select
            className="selector"
            value={selectedRampStrategy}
            onChange={(e) => {
              const strategy = e.target.value;
              setSelectedRampStrategy(strategy);

              if (strategy === "Large Asphalt Repair") {
                setSelectedModel(`lar_${selectedBudget}m`);
              } else if (strategy === "Curb Ramps - 10k") {
                setSelectedModel(`resurf_10k_${selectedBudget}m`);
              } else {
                setSelectedModel(`resurf_50k_${selectedBudget}m`);
              }
            }}
          >
            {RAMP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="image-container"></div>

      <table className="results-table">
        <tbody>
          <tr>
            <td>2036 Average PCI</td>
            <td>
              <strong>{(modelResults.years[10].avg_pci).toFixed(1)}</strong>
              {" "}
              <span className={`delta-${pciChange.isLower ? "negative" : "positive"}`}>
                {pciChange.symbol}{pciChange.delta}
              </span>
            </td>
          </tr>
          <tr>
            <td>Total Access Ramps Installed</td>
            <td>{getTotalRamps(modelResults.years).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Total Deferred Costs Remaining</td>
            <td>${Math.round(modelResults.years[10].total_deferred / 1_000_000).toLocaleString()}M</td>
          </tr>
        </tbody>
      </table>
      <div className="view-tabs">
        <sub>VIEW:</sub>
        {VIEWS.map((view) => (
          <button
            key={view}
            className={`view-tab${selectedView === view ? " view-tab-active" : ""}`}
            onClick={() => setSelectedView(view)}
          >
            {view}
          </button>
        ))}
      </div>


      {selectedView === "Street Quality" && (
        <PCIDegradationChart data={modelResults.years} />
      )}
      {selectedView === "Deferred Maintenance" && (
        <DeferredMaintenanceChart data={modelResults.years} />
      )}
      {selectedView === "City Map" && (
        <div
          className="pci-map-image"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      )}
    </div>
  );
};

export default PCIWidget;
