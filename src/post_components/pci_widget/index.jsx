import { useState } from "react";
import "./style.css";
import data from "../../data/pci_scenario_results.json";

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

function calculateChange(model) {
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
const PCIWidget = () => {
  const [selectedModel, setSelectedModel] = useState("lar_72m");
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [selectedRampStrategy, setSelectedRampStrategy] = useState(
    RAMP_OPTIONS[0],
  );
  let modelResults = data[selectedModel];
  let pciChange = calculateChange(selectedModel);
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

      <div className="results-container">
        <div className="results-container-item">
          <div>
            <strong>{(modelResults.years[10].avg_pci).toFixed(1)} </strong>
            <span
              className={`delta-${pciChange.isLower ? "negative" : "positive"}`}
            >
              {pciChange.symbol}
              {pciChange.delta}
            </span>
          </div>
          <div>Average PCI</div>
        </div>

        <div className="results-container-item">
          {" "}
          <div>{getTotalRamps(modelResults.years).toLocaleString()}</div>
          <div>Access Ramps Installed</div>
        </div>
        <div className="results-container-item">
          <div>
            $
            {Math.round(
              modelResults.years[10].total_deferred / 1_000_000,
            ).toLocaleString()}
            M
          </div>
          <div>Total Deferred</div>
        </div>
      </div>
      <div>
                <br/>
        <b>Street Quality over the next 10 years</b>
        <PCIDegradationChart data={modelResults.years} />
      </div>
      <div>
        <br/>
        <b>Deferred Maintenance over the next 10 years</b>
        <DeferredMaintenanceChart data={modelResults.years} />
      </div>
            <div
        className="pci-map-image"
        style={{
          backgroundImage: `url('${imageUrl}')`,
        }}
      ></div>
    </div>
  );
};

export default PCIWidget;
