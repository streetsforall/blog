import { useRef, useEffect } from "react";
import * as d3 from "d3";

import "./budget-slider.scss";


// not sure how we want to handle SVG imports so just hardcoding it here
const ArrowSVG = () => (
  <svg
    width="103"
    height="57"
    viewBox="0 0 103 57"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.1422 0.585786C15.3612 -0.195262 14.0949 -0.195262 13.3138 0.585786L0.585892 13.3137C-0.195157 14.0948 -0.195157 15.3611 0.585892 16.1421C1.36694 16.9232 2.63327 16.9232 3.41432 16.1421L14.728 4.82843L26.0417 16.1421C26.8228 16.9232 28.0891 16.9232 28.8702 16.1421C29.6512 15.3611 29.6512 14.0948 28.8702 13.3137L16.1422 0.585786ZM14.728 45H16.728V2H14.728H12.728V45H14.728ZM102.728 55V53H24.728V55V57H102.728V55ZM14.728 45H12.728C12.728 51.6274 18.1006 57 24.728 57V55V53C20.3098 53 16.728 49.4183 16.728 45H14.728Z"
      fill="currentColor"
    />
  </svg>
);

const BudgetSlider = ({ selectedBudget, handleSelect }) => {
  const budgetValues = [72, 100, 200, 400];
  const tickValues = [15, 30, 55, 100];
  const allTicks = d3.range(0, 101, 5);
  console.log(selectedBudget, typeof selectedBudget);
  return (
    <div className="outer">
      <div className="wrap">
        <div>
          {tickValues.map((v, i) => (
            <button
              className={`button-outer ${parseInt(selectedBudget) === budgetValues[i] ? "selected" : ""}`}
              style={{ left: `${v}%` }}
              onClick={() => handleSelect(budgetValues[i])}
            >
              <div className="button-text">${budgetValues[i]}</div>
              <div className="fake-dot"></div>
            </button>
          ))}
        </div>
        {allTicks.map((v) => (
          <div className="tick" style={{ left: `${v}%` }} />
        ))}
        <div className="bg-line"></div>
      </div>
      <div className="bottom-labels">
        <div className="bottom-labels-label">
          Proposed Budget <ArrowSVG />
        </div>
        <div className="bottom-labels-label">
          <ArrowSVG /> Typical Budget
        </div>
      </div>
    </div>
  );
};

export default BudgetSlider;
