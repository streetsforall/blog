const STATES = [
  {
    label: "Good",
    grade: "A / B",
    pci: "71–100",
    treatment: "Slurry Seal",
    cost: "$30k / lane mile",
    image: "/images/pci_maps/good.jpeg",
  },
  {
    label: "Fair",
    grade: "C",
    pci: "56–70",
    treatment: "Resurfacing",
    cost: "$190k / lane mile",
    image: "/images/pci_maps/fair.jpeg",
  },
  {
    label: "Failed",
    grade: "D / F",
    pci: "0–55",
    treatment: "Reconstruction",
    cost: "$250k–$500k / lane mile",
    image: "/images/pci_maps/failed.jpeg",
  },
];

const PCITrifold = () => (
  <>
    <style>{`
      .trifold {
        OVERFLOW: scroll;
        display: flex;
        gap: 1rem;
        font-family: monospace;
        font-size: 0.9rem;
        margin: 1.5rem 0;
      }
      .trifold-card {
        flex: 1;
      }
      .trifold-card img {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        min-width: 200px;
        display: block;
      }
      .trifold-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1rem;
      }
      .trifold-label {
        font-weight: bold;
        font-size: 1rem;
      }
      .trifold-label--good   { color: #1a7a1a; }
      .trifold-label--fair   { color: #888800; }
      .trifold-label--failed { color: #d7191c; }
      .trifold-grade {
        font-size: 0.8rem;
        color: #666;
      }
      .trifold-card table {
        width: 100%;
      }
      .trifold-key {
        color: #666;
        white-space: nowrap;
        padding-right: 0.5rem;
      }
    `}</style>
    <div className="trifold">
      {STATES.map((s) => (
        <div key={s.label} className="trifold-card">
          <img src={s.image} alt={`${s.label} street condition`} />
          <div className="trifold-body">
            <div className="trifold-header">
              <span className={`trifold-label trifold-label--${s.label.toLowerCase()}`}>{s.label}</span>
              <span className="trifold-grade">{s.grade}</span>
            </div>
            <table>
              <tbody>
                {[["PCI", s.pci], ["Treatment", s.treatment], ["Cost", s.cost]].map(([k, v]) => (
                  <tr key={k}>
                    <td className="trifold-key">{k}</td>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default PCITrifold;
