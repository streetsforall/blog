import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./style.css";
import data from "./data";

const MODELS = {
  model_100M: "model_100M",
  model_100M_curbramps: "model_100M_curbramps",
  model_100M_lar: "model_100M_lar",
};

const BUDGET_OPTIONS = [72, 99, 200, 400];
const RAMP_OPTIONS = ["No Ramps", "Curb Ramps", "Large Asphalt Repair"];

// these can be pre-calculated
function calculateStats(model) {
  const modelResults = data[model];
  console.log(modelResults);
  return modelResults;
}

const PCIWidget = () => {
  const [selectedModel, setSelectedModel] = useState(MODELS.model_100M);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [selectedRampStrategy, setSelectedRampStrategy] = useState(
    RAMP_OPTIONS[0],
  );
  let stats = calculateStats(selectedModel);
  useEffect(() => {
    stats = calculateStats(selectedModel);
  }, [selectedModel]);
  return (
    <div className="pci_widget">
      <div className="controls">
        <div>
          <label htmlFor="budget_selector">
            Annual Street Maintenance Budget
          </label>
          <select
            name="budget_selector"
            className="selector"
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
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

              //simplistic version, will change
              if (strategy === "No Ramps") {
                setSelectedModel(MODELS.model_100M);
              } else if (strategy === "Curb Ramps") {
                setSelectedModel(MODELS.model_100M_curbramps);
              } else {
                setSelectedModel(MODELS.model_100M_lar);
              }
            }}
          >
            {RAMP_OPTIONS.map((option) => (
              <option value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      <div
        className="pci-map-image"
        style={{
          backgroundImage: `url('/images/pci_maps/${selectedBudget}M-pci-map.png')`,
        }}
      ></div>
      <div className="image-container"></div>
      <div className="results-container">
        <div className="results-container-item">
          <div>Average PCI</div>
          <div>{stats[9].avg_pci}</div>
        </div>
      </div>
    </div>
  );
};

export default PCIWidget;
