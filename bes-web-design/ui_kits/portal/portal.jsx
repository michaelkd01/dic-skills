/* eslint-disable */
/**
 * BPC Client Portal — Application-mode exemplar.
 * Familjen Grotesk workhorse, hairline surfaces, tracked eyebrows, Tag status,
 * solid nav, dense-but-calm. No Aviano display, no full-bleed imagery — that is
 * the Promotional mode (see ui_kits/website/). Grounded in the Site 8 dataset.
 *
 * Decision surfaces follow the SKILL.md rule: recommendation before money,
 * one number stated once (inclusive of materials + concierge fee), a real
 * decision triad (Approve · Ask your concierge · Not now), provenance small.
 */
const { Logo, Button, Card, Tag, Eyebrow, Select } = window.BPCDesignSystem_ec4586;
const { useState } = React;

const C = "var(--bpc-charcoal)";
const C60 = "var(--bpc-charcoal-60)";
const HAIR = "1px solid var(--bpc-border-hairline)";
const SANS = "var(--bpc-font-sans)";
const num = { fontVariantNumeric: "tabular-nums" };

function Shell({ children }) {
  return (
    <div style={{ maxWidth: "var(--bpc-container-max)", margin: "0 auto", padding: "0 var(--bpc-space-7)" }}>
      {children}
    </div>
  );
}

function PortalNav() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "rgba(249,248,247,0.92)", backdropFilter: "blur(12px)",
      borderBottom: HAIR,
    }}>
      <Shell>
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--bpc-space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--bpc-space-6)" }}>
            <Logo variant="horizontal" color="black" height={26} basePath="../../assets/logos" />
            <div style={{ width: 1, height: 26, background: "var(--bpc-border-hairline)" }} />
            <div style={{ minWidth: 260 }}>
              <Select
                defaultValue="15 Annie Street, Hamilton"
                options={["15 Annie Street, Hamilton", "Whitfield House, Ascot", "The Coast House, Sunshine Beach"]}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--bpc-space-4)" }}>
            <Button variant="ghost" size="sm">Support</Button>
            <div style={{
              width: 32, height: 32, background: C, color: "var(--bpc-pastel)",
              display: "grid", placeItems: "center", fontFamily: SANS,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
            }}>CG</div>
          </div>
        </div>
      </Shell>
    </header>
  );
}

function PageHead() {
  return (
    <div style={{ paddingTop: "var(--bpc-space-8)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--bpc-space-6)" }}>
      <div>
        <Eyebrow>Property dashboard</Eyebrow>
        <h1 style={{
          fontFamily: SANS, fontWeight: 600, fontSize: "var(--bpc-fs-h2)",
          lineHeight: "var(--bpc-lh-heading)", letterSpacing: "-0.01em",
          margin: "var(--bpc-space-3) 0 var(--bpc-space-2)", color: C,
        }}>15 Annie Street, Hamilton</h1>
        <p style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body)", color: C60, margin: 0 }}>
          Craig Greenwood · Under stewardship since March 2024
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--bpc-space-3)" }}>
        <Tag variant="dark">Active</Tag>
        <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body-sm)", color: C60 }}>
          Annual review · Mar 2026
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: "var(--bpc-space-5)" }}>
      <div style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-eyebrow)", letterSpacing: "var(--bpc-ls-eyebrow)", textTransform: "uppercase", color: C60 }}>{label}</div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C, marginTop: "var(--bpc-space-2)", ...num }}>{value}</div>
    </div>
  );
}

function StatStrip() {
  const cells = [
    { label: "Open action items", value: "9" },
    { label: "Awaiting your approval", value: "1" },
    { label: "Works in progress", value: "3" },
    { label: "Approved this year", value: "$47,530" },
  ];
  return (
    <div style={{ marginTop: "var(--bpc-space-6)", border: HAIR, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
      {cells.map((c, i) => (
        <div key={c.label} style={{ borderLeft: i === 0 ? "none" : HAIR }}>
          <Stat {...c} />
        </div>
      ))}
    </div>
  );
}

function ItemRow({ desc, meta, value, status, last }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--bpc-space-4)", padding: "var(--bpc-space-3) 0", borderBottom: last ? "none" : HAIR }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body)", color: C }}>{desc}</div>
        <div style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-caption)", color: C60, marginTop: 2 }}>{meta}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--bpc-space-4)", flexShrink: 0 }}>
        <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body-sm)", color: C, ...num }}>{value}</span>
        <span style={{ minWidth: 132, textAlign: "right" }}>{status}</span>
      </div>
    </div>
  );
}

function Tier({ eyebrow, title, items }) {
  return (
    <Card eyebrow={eyebrow} title={title} style={{ marginBottom: "var(--bpc-space-5)" }}>
      <div style={{ marginTop: "var(--bpc-space-3)" }}>
        {items.map((it, i) => (<ItemRow key={it.desc} {...it} last={i === items.length - 1} />))}
      </div>
    </Card>
  );
}

function ActionPlan() {
  return (
    <section>
      <Eyebrow>Action plan</Eyebrow>
      <div style={{ marginTop: "var(--bpc-space-4)" }}>
        <Tier eyebrow="Tier 1 · Essential repairs" title="Address now"
          items={[
            { desc: "Re-seal main bathroom shower recess", meta: "Job 12349 · waterproofing", value: "$1,240", status: <Tag>Scheduled</Tag> },
            { desc: "Replace failed eaves lighting transformers (×3)", meta: "Quote 12350 · electrical", value: "$880", status: <Tag variant="dark">Awaiting approval</Tag> },
          ]} />
        <Tier eyebrow="Tier 2 · Programmed maintenance" title="Keep on schedule"
          items={[
            { desc: "Quarterly gutter and downpipe clear", meta: "Job 12351 · roofing", value: "$560", status: <Tag>In progress</Tag> },
            { desc: "Annual HVAC service, four zones", meta: "Programmed · due Jul 2026", value: "$1,420", status: <Tag>Scheduled</Tag> },
          ]} />
        <Tier eyebrow="Tier 3 · Enhancements & major works" title="Plan ahead"
          items={[
            { desc: "Repaint western elevation render", meta: "Quote 12352 · written contract required", value: "$9,800", status: <Tag>Quote ready</Tag> },
            { desc: "Pool equipment upgrade and coping re-tile", meta: "Quote 12353 · full contract required", value: "$22,400", status: <Tag variant="dark">Awaiting approval</Tag> },
          ]} />
      </div>
    </section>
  );
}

function QuoteApproval() {
  const [approved, setApproved] = useState(false);
  return (
    <Card
      eyebrow={approved ? "Approved · authorised" : "Awaiting your approval"}
      title="Pool equipment upgrade & coping re-tile"
      style={{ borderColor: approved ? "var(--bpc-border-hairline)" : C }}
    >
      <div style={{ marginTop: "var(--bpc-space-3)", display: "flex", flexDirection: "column", gap: "var(--bpc-space-4)" }}>
        <div><Tag>Enhancement · plan ahead</Tag></div>

        <p style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body)", color: C, lineHeight: "var(--bpc-lh-body)", margin: 0 }}>
          Replace the ageing pool filtration and pump, and re-tile the coping for a watertight, slip-safe finish. Around three days on site; the pool is unavailable while works are underway.
        </p>

        {!approved && (
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: "var(--bpc-fs-h2)", color: C, lineHeight: 1, ...num }}>$22,400</div>
            <div style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body-sm)", color: C60, marginTop: "var(--bpc-space-2)" }}>Inclusive of materials and concierge fee.</div>
          </div>
        )}

        {approved ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--bpc-space-3)" }}>
            <Tag variant="dark">Authorised</Tag>
            <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body-sm)", color: C60 }}>Converting to a job · your Concierge will confirm scheduling.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--bpc-space-3)" }}>
            <Button variant="primary" size="md" onClick={() => setApproved(true)}>Approve & authorise</Button>
            <Button variant="secondary" size="md">Ask your concierge</Button>
            <Button variant="ghost" size="md">Not now</Button>
          </div>
        )}

        <div style={{ borderTop: HAIR, paddingTop: "var(--bpc-space-3)", fontFamily: SANS, fontSize: "var(--bpc-fs-caption)", color: C60, lineHeight: "var(--bpc-lh-body)" }}>
          Quote 12353 · over $20,000, so a full domestic building contract and consumer disclosures apply (attached). Pre-approved card authority is applied on approval.
        </div>
      </div>
    </Card>
  );
}

function Activity() {
  const events = [
    { t: "Today 9:12am", e: "Subcontractor on site — Job 12351, gutter and downpipe clear" },
    { t: "Yesterday", e: "Quote 12353 issued for your approval — pool works" },
    { t: "14 Jun", e: "Job 12349 completed — before/after photos added" },
    { t: "12 Jun", e: "Quarterly inspection report published" },
  ];
  return (
    <Card eyebrow="Recent activity" title="Across your panel">
      <div style={{ marginTop: "var(--bpc-space-3)" }}>
        {events.map((ev, i) => (
          <div key={ev.e} style={{ display: "flex", gap: "var(--bpc-space-4)", padding: "var(--bpc-space-3) 0", borderBottom: i === events.length - 1 ? "none" : HAIR }}>
            <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-caption)", color: C60, width: 84, flexShrink: 0, ...num }}>{ev.t}</span>
            <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-body-sm)", color: C, lineHeight: "var(--bpc-lh-body)" }}>{ev.e}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PortalFooter() {
  return (
    <footer style={{ borderTop: HAIR, marginTop: "var(--bpc-space-9)" }}>
      <Shell>
        <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo variant="horizontal" color="black" height={20} basePath="../../assets/logos" />
          <span style={{ fontFamily: SANS, fontSize: "var(--bpc-fs-caption)", color: C60 }}>
            Stewardship portal · For emergencies, call your Concierge line.
          </span>
        </div>
      </Shell>
    </footer>
  );
}

function App() {
  return (
    <div>
      <PortalNav />
      <Shell>
        <PageHead />
        <StatStrip />
        <div style={{ marginTop: "var(--bpc-space-8)", paddingBottom: "var(--bpc-space-8)", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--bpc-space-7)" }}>
          <ActionPlan />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--bpc-space-5)" }}>
            <div>
              <Eyebrow>For approval</Eyebrow>
              <div style={{ marginTop: "var(--bpc-space-4)" }}><QuoteApproval /></div>
            </div>
            <Activity />
          </div>
        </div>
      </Shell>
      <PortalFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
