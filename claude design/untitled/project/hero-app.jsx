const { useState, useEffect, useRef } = React;

const ACCENTS = [
"#D8552E", // drafting orange-red
"#0071E3", // apple blue
"#1F8A5B", // urban green
"#1D1D1F", // graphite
"#B0452C" // brick
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "treatment": "line",
  "accent": "#D8552E",
  "layout": "center",
  "showCross": true
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const stageRef = useRef(null);
  const coordRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // crosshair + coordinate + gentle parallax
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const w = window.innerWidth,h = window.innerHeight;
        const x = e.clientX,y = e.clientY;
        stage.style.setProperty("--cx", x + "px");
        stage.style.setProperty("--cy", y + "px");
        const px = (x / w - 0.5) * -22;
        const py = (y / h - 0.5) * -22;
        stage.style.setProperty("--mx", px.toFixed(1) + "px");
        stage.style.setProperty("--my", py.toFixed(1) + "px");
        if (coordRef.current) {
          const E = (x / w * 1000).toFixed(1).padStart(6, "0");
          const N = ((1 - y / h) * 1000).toFixed(1).padStart(6, "0");
          coordRef.current.textContent = `E ${E}  N ${N}`;
        }
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {window.removeEventListener("mousemove", onMove);if (raf) cancelAnimationFrame(raf);};
  }, []);

  return (
    <div
      ref={stageRef}
      className={"stage" + (loaded ? " loaded" : "")}
      data-treat={t.treatment}
      data-layout={t.layout}
      data-cross={t.showCross ? "on" : "off"}
      style={{ "--accent": t.accent }}>
      
      <div className="bg"></div>
      <div className="veil"></div>

      {/* signature crosshair + coordinate */}
      <div className="cross">
        <div className="h"></div>
        <div className="v"></div>
        <div className="dot"></div>
      </div>
      <div className="coord" ref={coordRef}>E 000.0  N 000.0</div>

      <nav>
        <div className="brand">陈彦均<span className="en">Yanjun Chen</span></div>
        <div className="navlinks">
          <a href="#card">数字名片</a>
          <a href="#compare">能力对照</a>
          <a href="#skills">具备技能</a>
          <a href="#work">作品集</a>
          <a href="#life">视觉与生活</a>
          <a href="#contact">联系方式</a>
          <a href="#board">留言板</a>
        </div>
      </nav>

      <div className="hero" style={{ textAlign: "left" }}>
        <div className="eyebrow reveal d1">
          <span className="label">求职意向</span>
          <span>AI 产品经理</span>
          <span className="en">AI Product Manager</span>
        </div>

        <h1 className="name reveal d2" style={{ fontFamily: "-apple-system", textAlign: "center" }}>陈彦均</h1>

        <div className="tagline reveal d3" style={{ fontFamily: "\"Permanent Marker\"" }}>
          1&nbsp;Person <span className="op" style={{ fontFamily: "\"Permanent Marker\"" }}>+</span> AI <span className="op" style={{ fontFamily: "\"Permanent Marker\"" }}>=</span> <span className="em" style={{ fontFamily: "\"Permanent Marker\"" }}>A&nbsp;Team</span>
        </div>

        <div className="caption reveal d4">
          YANJUN CHEN <span className="dot">·</span> 上海 Shanghai
        </div>

        <div className="links reveal d5">
          <a href="#work" className="solid"><span className="txt">查看作品集</span> <span className="chev">›</span></a>
          <a href="#contact"><span className="txt">联系方式</span> <span className="chev">›</span></a>
        </div>

        <div className="keys reveal d6">
          <span>Agent 搭建</span>
          <span>Vibe Coding</span>
          <span>艺术审美</span>
          <span>产品思维</span>
        </div>
      </div>

      <div className="footer">
        <span className="pulse" style={{ backgroundColor: "rgb(250, 134, 4)" }}></span>
        <span>OPEN TO 2026 OPPORTUNITIES</span>
      </div>

      <div className="scrollcue" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <TweaksPanel>
        <TweakSection label="底图处理 · Image" />
        <TweakRadio
          label="处理方式"
          value={t.treatment}
          options={[
          { value: "line", label: "原稿" },
          { value: "spot", label: "聚光" },
          { value: "dark", label: "暗版" },
          { value: "blueprint", label: "蓝图" }]
          }
          onChange={(v) => setTweak("treatment", v)} />
        

        <TweakSection label="版式 · Layout" />
        <TweakRadio
          label="文字位置"
          value={t.layout}
          options={[{ value: "center", label: "居中" }, { value: "left", label: "左侧" }]}
          onChange={(v) => setTweak("layout", v)} />
        
        <TweakToggle label="十字光标 + 坐标" value={t.showCross} onChange={(v) => setTweak("showCross", v)} />

        <TweakSection label="强调色 · Accent" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS} onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);