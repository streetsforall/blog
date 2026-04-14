import { useState } from "react";
import "./style.scss";
import data from "../../../public/data/pci_scenario_results.json";

import PCIDegradationChart from "./PCIDegradationChart";
import BudgetSlider from "./BudgetSlider";

const BUDGET_OPTIONS = [72, 100, 200, 400];
const RAMP_OPTIONS = [
  "Large Asphalt Repair",
  "Curb Ramps - 10k",
  "Curb Ramps - 50k",
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
  const [selectedModel, setSelectedModel] = useState("resurf_50k_72m");
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [selectedRampStrategy, setSelectedRampStrategy] = useState(
    RAMP_OPTIONS[2],
  );
  let modelResults = data[selectedModel];
  let pciChange = calculateChange(selectedModel);
  let imageUrl = `/images/pci_maps/${selectedBudget}M_${selectedRampStrategy === "Large Asphalt Repair" ? "lar" : "resurf"}.png`;

  return (
    <div className="full-bleed-article-item">
      <div className="pci_widget">
        <div
          className="pci-map-image-desktop"
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        ></div>
        <div className="mobile-controls">
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

                //simplistic version, will change
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
        <div className="chart-side-by-side">
          <div className="controls">
            <div className="desktop-controls slider">
              <div>
                <div>Street Maintenance </div>
                <h3>
                  Annual Budget:
                  <select
                    name="budget_selector"
                    className="selector budget-selector"
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
                        ${option}M
                      </option>
                    ))}
                  </select>
                </h3>
              </div>
              <div>
                <BudgetSlider
                  selectedBudget={selectedBudget}
                  handleSelect={(budget) => {
                    setSelectedBudget(`${budget}`);

                    if (selectedRampStrategy === "Large Asphalt Repair") {
                      setSelectedModel(`lar_${budget}m`);
                    } else if (selectedRampStrategy === "Curb Ramps - 10k") {
                      setSelectedModel(`resurf_10k_${budget}m`);
                    } else {
                      setSelectedModel(`resurf_50k_${budget}m`);
                    }
                  }}
                />
              </div>
              <br />
              <br />
              <div>
                <label>Access Ramp Strategy</label>
                <select
                  className="selector"
                  value={selectedRampStrategy}
                  onChange={(e) => {
                    const strategy = e.target.value;
                    setSelectedRampStrategy(strategy);

                    //simplistic version, will change
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

            <div className="mobile-chart-wrap">
              <div
                className="pci-map-image-mobile"
                style={{
                  backgroundImage: `url('${imageUrl}')`,
                }}
              ></div>
              <div className="degradation-chart">
                <PCIDegradationChart data={modelResults.years} />
              </div>
            </div>
          </div>
          <div className="desktop-results">
            <h3 className="result-title">2036 Outcome</h3>
            <div className="result-title">
              <div>Outstanding Maintenance Cost</div>
              <h3>
                {modelResults.years[10].total_deferred >
                modelResults.years[0].total_deferred ? (
                  <span>
                    $
                    {Math.round(
                      (modelResults.years[10].total_deferred -
                        modelResults.years[0].total_deferred) /
                        1_000_000,
                    ).toLocaleString()}
                    M
                  </span>
                ) : (
                  <span className="result-surplus">
                    +$
                    {Math.round(
                      (modelResults.years[0].total_deferred -
                        modelResults.years[10].total_deferred) /
                        1_000_000,
                    ).toLocaleString()}
                    M
                  </span>
                )}
              </h3>
            </div>
            <div className="result-title">
              <div>Average Pavement Quality</div>
              <h3>
                <strong>{round(modelResults.years[10].avg_pci)} </strong>
                <span
                  className={`delta-${pciChange.isLower ? "negative" : "positive"}`}
                >
                  {pciChange.symbol}
                  {pciChange.delta}
                </span>
              </h3>
            </div>
            <div className="result-title">
              <div>Access Ramps Installed</div>
              <h3>{getTotalRamps(modelResults.years).toLocaleString()}</h3>
            </div>

            {/* <div className="pci-subtitle">2036 Pavement</div> */}
          </div>
        </div>

        <br />
        <div className="mobile-results results-container">
          <div className="results-container-item">
            <div>
              <strong>{round(modelResults.years[10].avg_pci)} </strong>
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
          <div className="results-container-item">
            <div>
              $
              {Math.round(
                (modelResults.years[10].total_deferred -
                  modelResults.years[0].total_deferred) /
                  1_000_000,
              ).toLocaleString()}
              M
            </div>
            <div>Total Deferred Diff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCIWidget;
