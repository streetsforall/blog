const LABEL_COLORS = { Good: "#1a7a1a", Fair: "#888800", Failed: "#d7191c" };

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
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontFamily: "monospace", fontSize: "0.9rem", margin: "1.5rem 0" }}>
    {STATES.map((s) => (
      <div key={s.label}>
        <img src={s.image} alt={`${s.label} street condition`} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
        <div style={{ }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: "bold", fontSize: "1rem", color: LABEL_COLORS[s.label] }}>{s.label}</span>
            <span style={{ fontSize: "0.8rem", color: "#666" }}>{s.grade}</span>
          </div>
          <table style={{ width: "100%"}}>
            <tbody>
              {[["PCI", s.pci], ["Treatment", s.treatment], ["Cost", s.cost]].map(([k, v]) => (
                <tr key={k}>
                  <td style={{  color: "#666", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

export default PCITrifold;
