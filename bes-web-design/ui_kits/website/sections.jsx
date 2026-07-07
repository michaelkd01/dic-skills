/* global React, DesignSystem_ec4586 */
const { useState, useEffect } = React;
const { Logo, Button, Eyebrow, Card, Tag, Input, Textarea, Select } = window.BPCDesignSystem_ec4586;

const GUTTER = "clamp(24px, 6vw, 96px)";
const MAXW = 1280;

/* ---- Navigation ------------------------------------------------------- */
function Nav({ onEnquire }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const onHero = !scrolled;
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: `20px ${GUTTER}`,
      background: scrolled ? "rgba(249,248,247,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--bpc-border-hairline)" : "1px solid transparent",
      transition: "background 240ms var(--bpc-ease-standard), border-color 240ms",
    }}>
      <Logo variant="horizontal" color={onHero ? "white" : "black"} height={32} basePath="../../assets/logos" />
      <nav style={{ display: "flex", gap: 40 }}>
        {["Our service", "Approach", "Residences", "Journal"].map((l) => (
          <a key={l} href="#" style={{
            fontSize: 13, fontWeight: 500, letterSpacing: "0.02em", borderBottom: "none",
            color: onHero ? "var(--bpc-pastel)" : "var(--bpc-charcoal)", transition: "color 240ms",
          }}>{l}</a>
        ))}
      </nav>
      <Button variant={onHero ? "primary" : "secondary"} size="sm" uppercase onClick={onEnquire}
        style={onHero ? { background: "var(--bpc-pastel)", color: "var(--bpc-charcoal)", borderColor: "var(--bpc-pastel)" } : {}}>
        Enquire
      </Button>
    </header>
  );
}

/* ---- Hero -------------------------------------------------------------- */
function Hero() {
  return (
    <section style={{
      position: "relative", minHeight: 760, height: "100vh", marginTop: -72,
      background: "linear-gradient(180deg, rgba(24,24,24,0.20) 0%, rgba(24,24,24,0.44) 100%), url('../../assets/imagery/house_JLeung.jpg') center/cover",
      display: "flex", alignItems: "flex-end", padding: `0 ${GUTTER} clamp(64px,10vh,120px)`,
    }}>
      <div style={{ maxWidth: 820 }}>
        <Eyebrow tone="inverse" style={{ color: "rgba(255,255,255,0.82)", letterSpacing: "0.26em", marginBottom: 36 }}>
          Bespoke Property Concierge
        </Eyebrow>
        <h1 className="bpc-display" style={{ fontSize: "clamp(48px,8vw,88px)", color: "var(--bpc-pastel)", margin: 0 }}>
          Tailored<br />stewardship for<br />prestige homes.
        </h1>
      </div>
    </section>
  );
}

/* ---- Intro ------------------------------------------------------------- */
function Intro() {
  return (
    <section style={{ padding: `clamp(96px,16vh,200px) ${GUTTER}`, maxWidth: MAXW, margin: "0 auto" }}>
      <div style={{ maxWidth: 780, marginLeft: "auto" }}>
        <Eyebrow style={{ marginBottom: 40, letterSpacing: "0.26em" }}>No two homes are the same</Eyebrow>
        <p style={{ fontSize: "clamp(22px,2.6vw,28px)", lineHeight: 1.5, color: "var(--bpc-fg-1)", margin: 0, fontWeight: 400, letterSpacing: "-0.005em" }}>
          Bespoke Property Concierge brings tailored stewardship to premium, high-value
          residential homes. Through the careful oversight of maintenance, improvements
          and long-term care, BPC delivers an unmatched experience for homeowners who
          expect the very best.
        </p>
      </div>
    </section>
  );
}

/* ---- Service pillars --------------------------------------------------- */
function ServiceGrid() {
  const items = [
    { eyebrow: "01 — Oversight", title: "Proactive maintenance, meticulously planned.", body: "Quarterly inspections, seasonal schedules, and a single point of accountability for every trade and contractor on your property." },
    { eyebrow: "02 — Improvements", title: "Considered upgrades, without the coordination burden.", body: "From interior refreshes to full renovations, your Concierge manages scope, panel, and timeline on your behalf." },
    { eyebrow: "03 — Long-term care", title: "The steward your home deserves — for decades.", body: "A living record of every improvement, every supplier, every decision — handed over between Concierges without friction." },
  ];
  return (
    <section style={{ padding: `0 ${GUTTER} clamp(96px,16vh,160px)`, maxWidth: MAXW, margin: "0 auto" }}>
      <div style={{ marginBottom: 80, maxWidth: 560 }}>
        <Eyebrow style={{ marginBottom: 24 }}>The service</Eyebrow>
        <div className="bpc-display" style={{ fontSize: "clamp(36px,5vw,52px)" }}>Three pillars of care</div>
      </div>
      {items.map((i) => (
        <div key={i.eyebrow} style={{ padding: "64px 0 72px", borderTop: "1px solid var(--bpc-border-hairline)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 64, alignItems: "start" }}>
          <Eyebrow style={{ letterSpacing: "0.2em", paddingTop: 8 }}>{i.eyebrow}</Eyebrow>
          <div>
            <h3 style={{ fontSize: "clamp(26px,3.4vw,36px)", fontWeight: 500, letterSpacing: "-0.018em", lineHeight: 1.15, margin: "0 0 28px", maxWidth: 620 }}>{i.title}</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--bpc-fg-2)", maxWidth: 560, margin: 0 }}>{i.body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---- Philosophy quote (dark) ------------------------------------------ */
function QuoteBlock() {
  return (
    <section style={{ background: "var(--bpc-charcoal)", color: "var(--bpc-pastel)", padding: `clamp(112px,18vh,200px) ${GUTTER}`, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 900, textAlign: "center" }}>
        <Eyebrow tone="inverse" style={{ letterSpacing: "0.26em", marginBottom: 48 }}>Our philosophy</Eyebrow>
        <blockquote className="bpc-display" style={{ fontSize: "clamp(28px,4.4vw,44px)", lineHeight: 1.25, margin: 0 }}>
          Much like the people who own them,<br />no two homes are the same.
        </blockquote>
        <p style={{ fontSize: 13, color: "rgba(249,248,247,0.6)", marginTop: 48, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Bespoke Property Concierge intends to keep it that way
        </p>
      </div>
    </section>
  );
}

/* ---- Residences (image cards) ----------------------------------------- */
function Residences() {
  const list = [
    { image: "../../assets/imagery/QL.jpg", eyebrow: "Residence", title: "Hamilton Hill", meta: "Brisbane · Under stewardship since 2024" },
    { image: "../../assets/imagery/JaneDain.jpg", eyebrow: "Residence", title: "Sunshine Coast Estate", meta: "Noosa · Seasonal care programme" },
    { image: "../../assets/imagery/alef-morais.jpg", eyebrow: "Residence", title: "The Riverhouse", meta: "New Farm · Full renovation oversight" },
  ];
  return (
    <section style={{ padding: `clamp(96px,16vh,160px) ${GUTTER}`, maxWidth: MAXW, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
        <div>
          <Eyebrow style={{ marginBottom: 24 }}>Under our care</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 600, letterSpacing: "-0.015em", margin: 0 }}>A select portfolio</h2>
        </div>
        <Tag>By invitation</Tag>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {list.map((r) => <Card key={r.title} variant="image" interactive {...r} />)}
      </div>
    </section>
  );
}

/* ---- Enquiry CTA + modal ---------------------------------------------- */
function CTASection({ onEnquire }) {
  return (
    <section style={{ padding: `clamp(112px,18vh,200px) ${GUTTER}`, textAlign: "center" }}>
      <Eyebrow style={{ letterSpacing: "0.26em", marginBottom: 36 }}>By invitation</Eyebrow>
      <h2 className="bpc-display" style={{ fontSize: "clamp(34px,5.4vw,56px)", margin: "0 auto 48px", maxWidth: 900 }}>
        A private conversation,<br />when you are ready.
      </h2>
      <Button size="lg" uppercase onClick={onEnquire}>Request an introduction</Button>
    </section>
  );
}

function EnquiryModal({ open, onClose }) {
  const [sent, setSent] = useState(false);
  useEffect(() => { if (open) setSent(false); }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50, background: "rgba(24,24,24,0.42)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bpc-bg-2)", width: "100%", maxWidth: 520, padding: "clamp(32px,5vw,56px)",
        boxShadow: "var(--bpc-shadow-lg)", maxHeight: "90vh", overflowY: "auto",
      }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Logo variant="iso" color="black" height={56} basePath="../../assets/logos" style={{ margin: "0 auto 28px" }} />
            <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>Thank you.</h3>
            <p style={{ color: "var(--bpc-fg-2)", margin: "0 0 28px", maxWidth: 360, marginInline: "auto" }}>
              A member of the BPC team will be in touch within two business days to arrange a private conversation.
            </p>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <React.Fragment>
            <Eyebrow style={{ marginBottom: 16 }}>Request an introduction</Eyebrow>
            <h3 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em", margin: "0 0 28px" }}>Tell us about your home.</h3>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Input label="Full name" placeholder="Jane Dain" required />
              <Input label="Email" type="email" placeholder="jane@residence.com" required />
              <Select label="Where is the property?" options={["Brisbane", "Sunshine Coast", "Gold Coast", "Elsewhere"]} />
              <Textarea label="A little about your needs" placeholder="Optional" rows={3} />
              <Button type="submit" size="lg" uppercase style={{ marginTop: 8 }}>Send enquiry</Button>
            </form>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

/* ---- Footer ------------------------------------------------------------ */
function Footer() {
  const cols = [
    { h: "Service", l: ["Oversight", "Improvements", "Long-term care", "Panel"] },
    { h: "Studio", l: ["About", "Journal", "Careers", "Press"] },
    { h: "Contact", l: ["Brisbane +61 7 0000 0000", "hello@bespokeconcierge.com"] },
  ];
  return (
    <footer style={{ background: "var(--bpc-bg-1)", padding: `clamp(72px,12vh,120px) ${GUTTER} 56px`, borderTop: "1px solid var(--bpc-border-hairline)" }}>
      <div style={{ maxWidth: MAXW, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 64, alignItems: "start" }}>
        <div>
          <Logo variant="horizontal" color="black" height={34} basePath="../../assets/logos" style={{ marginBottom: 28 }} />
          <p style={{ fontSize: 14, color: "var(--bpc-fg-2)", maxWidth: 320, lineHeight: 1.7, margin: 0 }}>
            Tailored stewardship for prestige homes. Proactive, private, and held to a standard of quiet excellence.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <Eyebrow style={{ marginBottom: 22, fontSize: 10 }}>{c.h}</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {c.l.map((x) => <div key={x} style={{ fontSize: 13, color: "var(--bpc-fg-1)", lineHeight: 1.5 }}>{x}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: MAXW, margin: "80px auto 0", paddingTop: 28, borderTop: "1px solid var(--bpc-border-hairline)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--bpc-fg-3)", flexWrap: "wrap", gap: 12 }}>
        <div>© 2026 Bespoke Property Concierge</div>
        <div>Brisbane · Australia</div>
      </div>
    </footer>
  );
}

function App() {
  const [enquire, setEnquire] = useState(false);
  const open = () => setEnquire(true);
  return (
    <div>
      <Nav onEnquire={open} />
      <Hero />
      <Intro />
      <ServiceGrid />
      <QuoteBlock />
      <Residences />
      <CTASection onEnquire={open} />
      <Footer />
      <EnquiryModal open={enquire} onClose={() => setEnquire(false)} />
    </div>
  );
}

const __bpcRoot = document.getElementById("root");
if (__bpcRoot) ReactDOM.createRoot(__bpcRoot).render(<App />);
