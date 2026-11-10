const { useState, useEffect } = React;

// 多頁：index.html 首頁、about.html 關於倚樂、process.html 服務流程，共用這份程式和 styles.css
const PAGE = window.PAGE || "home";
const HOME = PAGE === "home" ? "" : "index.html";

const PRODUCTS = [
  { id:"textbook",  en:"Textbook Printing",     zh:"教科書印刷",     num:"01",
    desc:"從中小學教材到大學教科書，精準色彩、穩定品質與大量交期。專為出版社與教育機構量身打造。",
    specs:[["紙張 Paper","依客戶需求"],["裝訂 Binding","膠裝 / 騎馬釘 / 穿線"],["色彩 Color","CMYK 四色 / 黑白"],["最小量 MOQ","10 冊起"]] },
  { id:"digital",   en:"Digital Short-Run",     zh:"數位短版印刷",   num:"02",
    desc:"少量多樣、隨需印製。從 2 本起印，適合樣書、提案、新品試銷與限定版書籍。",
    specs:[["起印量 MOQ","2 本起印"],["交期 Lead Time","視專案需求而定"],["色彩 Color","高精度數位 CMYK / 黑白"],["後加工 Finish","上膜 / 局部光 / 燙金 / 打凹 / UV"]] },
  { id:"hardcover", en:"Hardcover & Softcover", zh:"精裝平裝書籍",   num:"03",
    desc:"工藝級裝幀。布面、紙面、燙金、刷邊、書套、軋型⸺收藏級的細節，由倚樂職人逐冊把關。",
    specs:[["裝幀 Binding","穿線 / 圓背 / 方背"],["封面 Cover","布面 / 進口紙 / 燙金"],["內頁 Pages","32~1312 頁"],["特殊 Special","刷邊、書匣、書腰"]] },
  { id:"corporate", en:"Corporate Identity",    zh:"企業形象印刷品",  num:"04",
    desc:"年報、品牌書、提案冊、邀請函。以印刷工藝深化品牌語言，呈現企業氣質與專業度。",
    specs:[["項目 Items","年報 / 品牌書 / 簡介"],["紙張 Paper","特殊進口紙、再生紙"],["工藝 Craft","燙金、打凹、UV、過油"],["設計協助 Design","可協同設計團隊"]] },
  { id:"custom",    en:"Custom Solutions",       zh:"客製化印刷服務",  num:"05",
    desc:"走出規格表的需求⸺特殊尺寸、限量收藏品、藝術書、實驗性裝幀。歡迎帶著你的想法來找我們。",
    specs:[["尺寸 Size","任意客製"],["材質 Material","任意客製"],["數量 Run","2 本至無上限"],["合作 Work","從打樣到量產"]] }
];

const PROCESS = [
  { num:"01", zh:"需求洽談", en:"Brief",      desc:"電話或來訪皆可。我們會深入了解專案規格、數量、預算與期程。" },
  { num:"02", zh:"打樣校色", en:"Proofing",   desc:"提供實體樣書與校色印樣，色彩、紙張、裝幀逐一確認。" },
  { num:"03", zh:"正式印製", en:"Production", desc:"資深印務監控每一道工序，確保色彩一致與裝幀精準度。" },
  { num:"04", zh:"品檢包裝", en:"QC & Pack",  desc:"出貨前逐冊檢驗，客製包裝可選。" },
  { num:"05", zh:"出貨配送", en:"Delivery",   desc:"全台配送、海外物流皆可協助。出貨前確認交期，全力如期完成。" }
];



// 重複播放的實拍影片（靜音、循環）；使用者偏好減少動態時只顯示封面圖
function LoopVideo({ name }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.pause(); return; }
    const p = v.play();
    if (p) p.catch(() => {});
  }, [name]);
  return (
    <video
      ref={ref}
      className="loop-video"
      src={`media/${name}.mp4`}
      poster={`media/${name}.jpg`}
      autoPlay muted loop playsInline preload="metadata"
      aria-hidden="true"
    />
  );
}

// 流程：橫向排列，往下捲一段就畫一段（米白底、黑線）
// .d 會依序被「畫」出來；data-role 的部件在畫完後跟著捲動動起來
function ProcessScroller() {
  const wrap = React.useRef(null);
  const track = React.useRef(null);
  const bar = React.useRef(null);

  React.useEffect(() => {
    const W = wrap.current, T = track.current;
    if (!W || !T) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (v, a, b) => clamp((v - a) / (b - a));
    const ease = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;

    let shown = 0;
    const panels = [...T.querySelectorAll(".hp-panel")];
    const N = panels.length;
    const parts = panels.map(() => null);
    const segs = [...bar.current.querySelectorAll(".hp-seg i")];
    const labels = [...bar.current.querySelectorAll(".hp-seg")];

    // 插圖是 media/art/proc-N.svg（由 build.py 產生），載入後直接放進頁面才能逐筆畫線
    function mount(i, svgText) {
      const box = panels[i].querySelector(".hp-art");
      box.innerHTML = svgText.replace(/<style>[\s\S]*?<\/style>/, "");
      const svg = box.querySelector("svg");
      const q = (r) => svg.querySelector(`[data-role="${r}"]`);
      // 要放進箱子的書：排在箱子後壁之後、前壁之前
      if (q("book") && q("boxfront")) q("boxfront").parentNode.insertBefore(q("book"), q("boxfront"));
      const lines = [...svg.querySelectorAll(".d, .f, .h")];
      lines.forEach((el) => { el.setAttribute("pathLength", "1"); el.style.strokeDasharray = "1 1"; });
      const vec = (el, a = "x", b = "y") => el ? [+el.dataset[a], +el.dataset[b]] : [0, 0];
      const pair = (v) => (v || "0,0").split(",").map(Number);
      const axes = q("axes");
      parts[i] = {
        lines, q,
        texts: [...svg.querySelectorAll(".tx")].filter((t) => !t.closest('[data-role="stamp"]')),
        swatches: [...svg.querySelectorAll(".sw")],
        dots: [...svg.querySelectorAll(".dot")],
        sheets: [...svg.querySelectorAll(".sheet")],
        piles: [...svg.querySelectorAll(".pile")],
        dir: vec(q("dir")), truckDir: vec(q("truck")),
        ax: axes ? pair(axes.dataset.ax) : null, ay: axes && axes.dataset.ay ? pair(axes.dataset.ay) : [0, 0], az: axes ? pair(axes.dataset.az) : null,
        wheels: [...svg.querySelectorAll('[data-role="wheelspin"]')],
        stack: axes && axes.dataset.stack ? axes.dataset.stack.split(",").map(Number) : null,
        o: axes && axes.dataset.o ? pair(axes.dataset.o) : null,
        flaps: [...svg.querySelectorAll('[data-role^="flap"]')].map((el) => ({ el, frames: JSON.parse(el.dataset.frames), t0: +el.dataset.t0, t1: +el.dataset.t1 })),
      };
      draw(shown);
    }
    panels.forEach((pn, i) => {
      fetch(pn.querySelector(".hp-art").dataset.src).then((r) => r.text()).then((t) => mount(i, t)).catch(() => {});
    });

    // 時間軸：每段「畫」1 單位、「滑到下一段」0.55 單位
    const DRAW = 1, SLIDE = 0.55, TOTAL = N * DRAW + (N - 1) * SLIDE + 0.25;
    const startOf = (i) => i * (DRAW + SLIDE);

    function animate(i, dp) {
      const P = parts[i];
      if (!P) return;
      const n = P.lines.length;
      const local = dp / 0.72;
      P.lines.forEach((el, k) => {
        const a = clamp((local - (k / n) * 0.7) / 0.3);
        el.style.strokeDashoffset = 1 - a;
      });
      P.texts.forEach((t) => (t.style.opacity = seg(local, 0.55, 0.85)));
      const m = seg(dp, 0.62, 1); // 畫完之後的動作
      if (i === 0) {
        P.dots.forEach((d, k) => (d.style.opacity = seg(dp, 0.74 + k * 0.07, 0.82 + k * 0.07)));
      } else if (i === 1) {
        P.swatches.forEach((s) => (s.style.fillOpacity = seg(local, 0.7, 0.95) * (+s.dataset.k * 0.14 + 0.04)));
        // 放大鏡像滑鼠一樣一格一格滑過色階，每格停一下
        const steps = 6, st = m * steps, k = Math.min(steps - 1, Math.floor(st));
        const d = ((m >= 1 ? steps : k + ease(seg(st - k, 0, 0.6)))) / steps * 84;
        P.q("loupe").setAttribute("transform", `translate(${P.dir[0] * d} ${P.dir[1] * d})`);
        P.q("stamp").setAttribute("opacity", seg(dp, 0.92, 0.99));
      } else if (i === 2) {
        const sp = P.q("spin");
        sp.setAttribute("transform", `rotate(${-dp * 720} ${sp.dataset.cx} ${sp.dataset.cy})`);
        // 紙在機器裡一張張疊起來，最後整疊從出紙口推到後方較低的平台
        const [sx0, sw, y0, sd, z0, h, n, px1, push] = P.stack;
        const count = Math.round(seg(dp, 0.36, 0.8) * n);
        const d = push * ease(seg(dp, 0.84, 1));
        const pr = (x, y, z) => `${(P.o[0] + x * P.ax[0] + y * P.ay[0] + z * P.az[0]).toFixed(1)},${(P.o[1] + x * P.ax[1] + y * P.ay[1] + z * P.az[1]).toFixed(1)}`;
        const y1 = y0 + sd;
        const piece = (xa, xb, z, right) => {
          const zt = z + h, poly = (pts) => `<polygon class="pl" fill="#F4EFE6" points="${pts.map((q) => pr(...q)).join(" ")}"/>`;
          return (right ? poly([[xb, y0, z], [xb, y1, z], [xb, y1, zt], [xb, y0, zt]]) : "")
            + poly([[xa, y1, z], [xb, y1, z], [xb, y1, zt], [xa, y1, zt]])
            + poly([[xa, y0, zt], [xb, y0, zt], [xb, y1, zt], [xa, y1, zt]]);
        };
        let inner = "", outer = "";
        const xa = sx0 + d, xb = xa + sw;
        for (let k = 0; k < count; k++) {
          const z = z0 + k * h;
          if (xa < px1) inner += piece(xa, Math.min(px1, xb), z, xb <= px1);
          if (xb > px1) outer += piece(Math.max(px1, xa), xb, z, true);
        }
        const key = count + ":" + d.toFixed(2);
        if (P.stackKey !== key) { P.stackKey = key; P.q("stackIn").innerHTML = inner; P.q("stackOut").innerHTML = outer; }
      } else if (i === 3) {
        // 一本書：先抬高、移到箱子正上方，再垂直放進箱子（在箱口上方時畫在最上層，進到箱子裡才被前壁擋住）
        const up = ease(seg(dp, 0.5, 0.58)), mv = ease(seg(dp, 0.58, 0.68)), down = ease(seg(dp, 0.68, 0.78));
        const dx = 162 * mv, dy = 2 * mv, dz = 51 * up - 91 * down;
        const book = P.q("book");
        book.style.opacity = seg(dp, 0.46, 0.5);
        book.setAttribute("transform", `translate(${P.ax[0] * dx + P.ay[0] * dy + P.az[0] * dz} ${P.ax[1] * dx + P.ay[1] * dy + P.az[1] * dz})`);
        const inside = 44 + dz < 58 && mv >= 1, front = P.q("boxfront");
        if (inside && book.nextSibling !== front) front.parentNode.insertBefore(book, front);
        else if (!inside && book.parentNode.lastElementChild !== book) book.parentNode.appendChild(book);
        P.flaps.forEach((fl, k) => {
          const c = ease(seg(dp, fl.t0, fl.t1));
          fl.el.setAttribute("points", fl.frames[Math.round(c * (fl.frames.length - 1))]);
        });
        const tp = P.q("tape"), [x1, y1] = tp.dataset.to.split(",").map(Number);
        const m0 = tp.getAttribute("d").match(/M([\d.]+) ([\d.]+)/);
        const t = seg(dp, 0.95, 1), x0 = +m0[1], y0 = +m0[2];
        tp.setAttribute("d", `M${x0} ${y0}L${lerp(x0, x1, t)} ${lerp(y0, y1, t)}`);
        tp.style.opacity = t > 0 ? 1 : 0;
      } else if (i === 4) {
        const go = ease(m) * 52;
        P.q("truck").setAttribute("transform", `translate(${P.truckDir[0] * go} ${P.truckDir[1] * go})`);
        P.q("speed").style.opacity = m > 0.02 && m < 0.98 ? 1 : 0;
        const deg = (go / 9) * 180 / Math.PI; // 輪子半徑 9：走多遠就轉多少
        P.wheels.forEach((w) => w.setAttribute("transform", `rotate(${deg} ${w.dataset.cx} ${w.dataset.cy})`));
      }
    }

    function draw(p) {
      const u = p * TOTAL;
      // 鏡頭位置：第幾段 + 滑動中的比例
      let pos = 0;
      for (let i = 0; i < N - 1; i++) {
        const s = startOf(i) + DRAW;
        pos += ease(seg(u, s, s + SLIDE));
      }
      const a = Math.floor(pos), f = pos - a;
      const x0 = panels[a].offsetLeft, x1 = panels[Math.min(N - 1, a + 1)].offsetLeft;
      T.style.transform = `translate3d(${-lerp(x0, x1, f) + panels[0].offsetLeft}px,0,0)`;
      const active = Math.round(pos);
      panels.forEach((pn, i) => {
        const dp = reduce ? 1 : seg(u, startOf(i) - SLIDE * 0.6, startOf(i) + DRAW);
        animate(i, dp);
        pn.classList.toggle("on", i === active);
        pn.classList.toggle("past", i < active);
        segs[i].style.transform = `scaleX(${seg(u, startOf(i) - SLIDE * 0.6, startOf(i) + DRAW)})`;
        labels[i].classList.toggle("on", i === active);
      });
    }

    let raf = 0;
    const target = () => {
      const r = W.getBoundingClientRect();
      const lead = innerHeight * 0.55; // 還沒釘住前就開始畫第一段
      return clamp((lead - r.top) / (W.offsetHeight - innerHeight + lead));
    };
    const tick = () => {
      const t = window.__hpLock ?? target();
      shown += (t - shown) * (reduce ? 1 : 0.14);
      if (Math.abs(t - shown) < 0.0004) shown = t;
      draw(shown);
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => { const t = window.__hpLock ?? target(); shown = shown + (t - shown) * 0.5; draw(shown); };
    raf = requestAnimationFrame(tick);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    draw(target());
    window.__hpDraw = (p) => { window.__hpLock = p; shown = p; draw(p); };
    // 點下方的段落標籤，捲到那一段
    window.__hpJump = (i) => {
      const u = startOf(i) + DRAW * 0.98;
      const lead = innerHeight * 0.55;
      const total = W.offsetHeight - innerHeight + lead;
      const top = W.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top - lead + (u / TOTAL) * total, behavior: "smooth" });
    };
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div className="hp" ref={wrap}>
      <div className="hp-sticky">
        <div className="hp-track" ref={track}>
          {PROCESS.map((s, i) => (
            <article className="hp-panel" key={s.num}>
              <div className="hp-text">
                <div className="num">{s.num}</div>
                <h3>{s.zh}</h3>
                <div className="en">{s.en}</div>
                <p>{s.desc}</p>
              </div>
              <div className="hp-art" data-src={`media/art/proc-${i + 1}.svg`}></div>
            </article>
          ))}
        </div>
        <div className="hp-bar container" ref={bar}>
          {PROCESS.map((s, i) => (
            <button type="button" className="hp-seg" key={s.num} onClick={() => window.__hpJump && window.__hpJump(i)}>
              <span className="bar"><i></i></span>
              <span className="t"><b>{s.num}</b>{s.zh}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [scrolled,    setScrolled]   = useState(false);
  const [quoteList,   setQuoteList]  = useState([]);
  const [modal,       setModal]      = useState(null);
  const [trayHidden,  setTrayHidden] = useState(true);
  const [svc,         setSvc]        = useState("textbook");
  const [colorMode,   setColorMode]  = useState("color");
  const [pages,       setPages]      = useState(128);
  const [qty,         setQty]        = useState(10);
  const [formStatus,  setFormStatus] = useState("idle");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 從其他分頁點「服務／流程／聯絡」過來時，內容是 React 畫完才有，要自己捲到錨點
  useEffect(() => {
    if (!location.hash) return;
    const t = setTimeout(() => {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "instant" });
    }, 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const toggleQuote = (p) => {
    setQuoteList((prev) => {
      const has  = prev.includes(p.id);
      const next = has ? prev.filter(x => x !== p.id) : [...prev, p.id];
      if (!has) setTrayHidden(false);
      return next;
    });
  };

  const pageRateRange = colorMode === "bw" ? [0.25, 0.35] : [1, 1.8];
  const [lo, hi] = pageRateRange.map((rate) => Math.round((pages * rate + 25) * qty));
  const fmt = (n) => n.toLocaleString("en-US");

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const body = [
      "您好，我想詢問印刷服務：",
      "",
      `姓名：${data.get("name") || ""}`,
      `公司：${data.get("company") || ""}`,
      `電話：${data.get("phone") || ""}`,
      `Email：${data.get("email") || ""}`,
      `需求服務：${data.get("service") || ""}`,
      "",
      "需求描述：",
      data.get("message") || ""
    ].join("\n");

    const subject = "【倚樂企業】網站詢問 from yihappy.com.tw";
    window.location.href = `mailto:yihappy.dp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormStatus("sent");
    setTimeout(() => setFormStatus("idle"), 6000);
  };


  return (
    <div>
      {/* NAV */}
      <nav className={"nav " + (scrolled ? "scrolled" : "")}>
        <a className="brand" href={PAGE === "home" ? "#top" : "index.html"} aria-label="倚樂首頁">
          <div className="brand-mark brand-mark--nav">
            <img src="logo-new.png?v=pdf-logo-20260709" alt="倚樂" width="834" height="579" />
          </div>
        </a>
        <div className="nav-links">
          <a href="about.html" className={PAGE === "about" ? "active" : ""}><span className="num">01</span>關於</a>
          <a href={`${HOME}#products`}><span className="num">02</span>服務</a>
          <a href="process.html" className={PAGE === "process" ? "active" : ""}><span className="num">03</span>流程</a>
          <a href={`${HOME}#contact`}><span className="num">04</span>聯絡</a>
        </div>
        <a href={`${HOME}#contact`} className="btn btn-primary btn-sm">立即報價 <span className="arr">→</span></a>
      </nav>

      {PAGE === "home" && (<>
      {/* HERO */}
      <section className="hero container" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Since 2009 · 新北中和</span>
            <h1 style={{ marginTop: 24 }}>
              Pages that <span className="it">last</span>,<br />
              ink that <span className="it">speaks.</span>
              <span className="han">為知識而印 · 為品牌而印</span>
            </h1>
            <p className="hero-sub">
              倚樂企業有限公司，自 2009 年起深耕教科書與精緻書籍印刷。
              以實在的合作模式、穩定的品質與一站式服務，
              成為出版社、教育機構與品牌客戶長期信賴的印刷夥伴。
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">索取報價 <span className="arr">→</span></a>
              <a href="#products" className="btn btn-ghost">查看服務</a>
            </div>
          </div>
          <figure className="hero-print">
            <div className="frame">
              <span className="crop tl"></span><span className="crop tr"></span>
              <span className="crop bl"></span><span className="crop br"></span>
              <div className="sheet">
                <div className="shot"><LoopVideo name="rotary-loop" /></div>
              </div>
            </div>
            <figcaption><span>Fig. 01 — <b>黑白輪轉機</b></span><span>中和廠 · 實拍</span></figcaption>
          </figure>
        </div>

        <div className="hero-meta">
          <div className="stat"><div className="n">24<sup>YRS</sup></div><div className="l">深耕印刷產業</div></div>
          <div className="stat"><div className="n">高效<sup>交貨</sup></div><div className="l">輪轉機支援快速量產</div></div>
          <div className="stat"><div className="n">5<sup>項</sup></div><div className="l">主要印刷服務範疇</div></div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* PRODUCTS */}
      <section id="products" className="products">
        <div className="container">
          <div className="svc-head reveal">
            <h2>Our <span className="serif">services</span></h2>
            <p>五大服務皆由廠內職人全程把關。點卡片看細節，或直接加入報價清單。</p>
          </div>
        </div>

        <div className="marquee">
          <div className="marquee-track">
            {[...PRODUCTS, ...PRODUCTS, ...PRODUCTS].map((p, i) => (
              <div className="marquee-item" key={i}>
                <span className="sep"></span>
                <span>{p.en}</span>
                <span className="han">{p.zh}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          <div className="product-grid">
            {PRODUCTS.map((p) => (
              <article className="product-card reveal" key={p.id} onClick={() => setModal(p)}>
                <div className="thumb icon-tile">
                  <div className="num">{p.num}</div>
                  <img className="svc-art" src={`media/art/svc-${p.id}.svg`} alt={`${p.zh} 線稿插圖`} loading="lazy" />
                </div>
                <div className="body">
                  <h3><span>{p.en}</span><span className="han">{p.zh}</span></h3>
                  <p className="desc">{p.desc}</p>
                  <div className="foot">
                    <span className="meta">View details →</span>
                    <button
                      className={"add " + (quoteList.includes(p.id) ? "added" : "")}
                      onClick={(e) => { e.stopPropagation(); toggleQuote(p); }}
                    >
                      <span className="plus">{quoteList.includes(p.id) ? "✓" : "+"}</span>
                      {quoteList.includes(p.id) ? "已加入" : "加入報價"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE TOOL */}
      <section className="quote-tool">
        <div className="container reveal">
          <span className="eyebrow" style={{ color: "rgba(244,239,230,0.6)" }}>Instant estimate · 即時估價</span>
          <h2 style={{ marginTop: 28 }}>
            Quick price <span className="serif">preview</span>
            <span className="han">線上預估，三十秒</span>
          </h2>
          <div className="qt-grid">
            <div className="qt-controls">
              <div className="field">
                <label>選擇服務 · Service Type</label>
                <div className="opts">
                  {PRODUCTS.map(p => (
                    <button key={p.id} className={"opt " + (svc === p.id ? "active" : "")} onClick={() => setSvc(p.id)}>
                      {p.zh}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>顏色 · Color</label>
                <div className="opts">
                  <button className={"opt " + (colorMode === "color" ? "active" : "")} onClick={() => setColorMode("color")}>
                    <span className="color-dot color"></span>
                    彩色
                  </button>
                  <button className={"opt " + (colorMode === "bw" ? "active" : "")} onClick={() => setColorMode("bw")}>
                    <span className="color-dot bw"></span>
                    黑白
                  </button>
                </div>
              </div>
              <div className="field">
                <label>頁數 · Pages</label>
                <div className="qty">
                  <input type="range" min="16" max="1312" step="2" value={pages} onChange={e => setPages(+e.target.value)} />
                  <span className="v">{fmt(pages)}頁</span>
                </div>
              </div>
              <div className="field">
                <label>數量 · Quantity (本 / Copies)</label>
                <div className="qty">
                  <input type="range" min="10" max="2000" step="2" value={qty} onChange={e => setQty(+e.target.value)} />
                  <span className="v">{fmt(qty)}</span>
                </div>
              </div>
            </div>
            <div className="qt-result">
              <div className="lbl">預估價格區間 · Estimated Range</div>
              <div className="price">
                <span className="currency">NT$</span>{fmt(lo)}<span className="dash">—</span>{fmt(hi)}
              </div>
              <p className="price-note">
                此為線上速算僅供參考。彩色每面 NT$1–1.8，黑白每面 NT$0.25–0.35，每本加計 25 元成書費。
                完成詳細需求後，我們將於 1 個工作日內提供正式報價單。
              </p>
              <a href="#contact" className="btn btn-primary">取得正式報價 <span className="arr">→</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-head reveal">
            <h2>Let's <span className="serif">talk</span><span className="han">聯絡我們</span></h2>
            <p className="lede">
              無論是緊急加印、長期合作或單純的工藝諮詢，
              都歡迎來電或填寫表單，我們將於 1 個工作日內回覆。
            </p>
          </div>
          <div className="contact-grid reveal">
            <div>
              <div className="contact-info">
                <div className="row"><span className="k">Address</span><span className="v">新北市中和區中山路二段 530 號 4 樓之一</span></div>
                <div className="row"><span className="k">Phone</span><span className="v"><a href="tel:0222265720">02 · 2226 · 5720</a></span></div>
                <div className="row"><span className="k">Hours</span><span className="v">週一至週五 · 09:00 – 22:00</span></div>
                <div className="row"><span className="k">Email</span><span className="v"><a href="mailto:yihappy.dp@gmail.com">yihappy.dp@gmail.com</a></span></div>
              </div>
              <div className="map-frame">
                <iframe
                  loading="lazy"
                  title="倚樂企業位置地圖"
                  src="https://www.google.com/maps?q=新北市中和區中山路二段530號&output=embed"
                ></iframe>
              </div>
            </div>

            <form className="form" onSubmit={handleContactSubmit}>
              <div className="field">
                <label>姓名 · Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="field">
                <label>公司 · Company</label>
                <input type="text" name="company" placeholder="" />
              </div>
              <div className="field">
                <label>電話 · Phone</label>
                <input type="tel" name="phone" required placeholder="" />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" required placeholder="" />
              </div>
              <div className="field full">
                <label>需求服務 · Service</label>
                <select name="service">
                  <option>教科書印刷</option>
                  <option>數位短版印刷</option>
                  <option>精裝平裝書籍</option>
                  <option>企業形象印刷品</option>
                  <option>客製化服務</option>
                </select>
              </div>
              <div className="field full">
                <label>需求描述 · Project Details</label>
                <textarea name="message" required placeholder="尺寸、數量、紙張、裝幀方式、期望交期⋯⋯" rows="4"></textarea>
              </div>
              <div className="form-submit">
                <span className="note">
                  {formStatus === "sent"   ? "已開啟 Email 草稿，請確認後寄出。" :
                   formStatus === "error"  ? "⚠️ 送出失敗，請稍後再試。" :
                   "送出後將開啟 Email 草稿 · 報價單免費"}
                </span>
                <button type="submit" className="btn btn-primary" disabled={formStatus === "sending"}>
                  {formStatus === "sending" ? "送出中..." : formStatus === "sent" ? "已開啟 ✓" : <span>送出詢問 <span className="arr">→</span></span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      </>)}

      {PAGE === "process" && (<>
      {/* PROCESS */}
      <section id="process" className="process process-page">
        <div className="container">
          <div className="section-head reveal">
            <h2>Our <span className="serif">process</span><span className="han">服務流程</span></h2>
            <p className="lede">五個階段，全程透明。從頭到尾負責到底，有問題一定找得到人。往下捲動，一步一步看。</p>
          </div>
        </div>
        <ProcessScroller />
      </section>

      <section className="page-cta">
        <div className="container reveal">
          <p className="lead">從需求洽談到出貨，我們負責到底，一定找得到人。</p>
          <div className="about-actions">
            <a href="index.html#contact" className="btn btn-primary">索取報價 <span className="arr">→</span></a>
            <a href="index.html#products" className="btn btn-ghost">查看服務</a>
          </div>
        </div>
      </section>

      </>)}

      {PAGE === "about" && (<>
      {/* ABOUT */}
      <section id="about" className="container about-page">
        <div className="section-head section-head--solo reveal">
          <h2>About <span className="serif">us</span><span className="han">關於倚樂</span></h2>
        </div>
        <div className="about-grid">
          <figure className="hero-print about-print reveal">
            <div className="frame">
              <span className="crop tl"></span><span className="crop tr"></span>
              <span className="crop bl"></span><span className="crop br"></span>
              <div className="sheet">
                <div className="about-figure">
                  <div className="stripes"></div>
                  <div className="stack"><div></div><div></div><div></div><div></div><div></div></div>
                </div>
              </div>
            </div>
            <figcaption><span>Fig. 02 — <b>用紙堆疊</b></span><span>Paper stack</span></figcaption>
          </figure>
          <div className="about-body reveal">
            <p className="lead">
              「以實在對待每一本書，<br />
              以誠心對待每一位客戶。」
            </p>
            <p>
              自 2009 年於新北中和創立以來，我們從出版印刷起步，累積多年出版專業後，
              逐步專注於教科書與書籍印刷。從教科書到藝術書、從萬本量產到單冊收藏，
              我們以一致的標準把關每一道工序，讓知識、品牌與情感被妥善保存並傳遞。
            </p>
            <p>
              我們的廠區位於新北中和，自有印刷、輪轉機、裝訂與後加工全產線。從打樣到出貨，
              一條龍服務讓您能直接與印務、裝幀師傅溝通，交期掌握更快，也避免層層轉手帶來的延誤與誤差。
            </p>
            <div className="about-actions">
              <a href="index.html#products" className="btn btn-primary">查看服務 <span className="arr">→</span></a>
              <a href="index.html#contact" className="btn btn-ghost">聯絡我們</a>
            </div>
          </div>
        </div>
      </section>

      </>)}

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="logo-block">
              <div className="footer-brand">
                <img className="footer-logo" src="logo-new.png?v=pdf-logo-20260709" alt="倚樂 CTP、依需印刷、數位直噴、平面設計" width="834" height="579" />
              </div>
              <p>自 2009 年起深耕教科書與精緻書籍印刷。以實在的品質與一站式服務，成為您長期信賴的印刷夥伴。</p>
            </div>
            <div className="col">
              <h4>Services</h4>
              <a href={`${HOME}#products`}>教科書印刷</a>
              <a href={`${HOME}#products`}>數位短版印刷</a>
              <a href={`${HOME}#products`}>精裝平裝書籍</a>
              <a href={`${HOME}#products`}>企業形象</a>
              <a href={`${HOME}#products`}>客製化服務</a>
            </div>
            <div className="col">
              <h4>Company</h4>
              <a href="about.html">關於我們</a>
              <a href="process.html">服務流程</a>
              <a href={`${HOME}#contact`}>聯絡我們</a>
            </div>
            <div className="col">
              <h4>Contact</h4>
              <p>新北市中和區中山路二段 530 號 4 樓之一</p>
              <p>02-22265720</p>
              <p>yihappy.dp@gmail.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2009–2026 Yi Happy Co., Ltd. All rights reserved.</div>
            <div>Made with care in Zhonghe, Taiwan</div>
          </div>
        </div>
      </footer>

      {/* QUOTE TRAY */}
      <div className={"quote-tray " + (trayHidden || quoteList.length === 0 ? "hidden" : "")}>
        <span className="ct">{quoteList.length}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{quoteList.length} 項服務已加入報價清單</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>滑至下方表單完成詢問</div>
        </div>
        <a href="#contact" className="btn btn-primary btn-sm" style={{ background: "var(--accent)" }}>查看 →</a>
        <button className="x" onClick={() => setTrayHidden(true)}>×</button>
      </div>

      {/* MODAL */}
      <div className={"modal-bg " + (modal ? "open" : "")} onClick={() => setModal(null)}>
        {modal && (
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>×</button>
            <div className="img icon-tile"><img className="svc-art" src={`media/art/svc-${modal.id}.svg`} alt={`${modal.zh} 線稿插圖`} /></div>
            <div className="content">
              <div className="eyebrow">{modal.num} · Service</div>
              <h3><span>{modal.en}</span><span className="han">{modal.zh}</span></h3>
              <p className="modal-desc">{modal.desc}</p>
              <div className="specs">
                {modal.specs.map(([k, v], i) => (
                  <React.Fragment key={i}>
                    <div className="k">{k}</div>
                    <div className="v">{v}</div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <a href="#contact" className="btn btn-primary" onClick={() => setModal(null)}>立即詢價 <span className="arr">→</span></a>
                <button className="btn btn-ghost" onClick={() => { toggleQuote(modal); setModal(null); }}>
                  {quoteList.includes(modal.id) ? "✓ 已加入" : "+ 加入報價"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
