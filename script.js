(() => {
  "use strict";

  const C = window.CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const params = new URLSearchParams(location.search);
  const PREVIEW = params.has("preview") || params.has("lv");

  // ============================================================
  //  Pixel art (grid string -> SVG)
  // ============================================================
  const PAL = {
    k: "#3a2e39", w: "#fff7ee", p: "#ffb3c6", d: "#ff8fab", r: "#e5536f",
    y: "#ffd166", o: "#f4845f", c: "#ffe8a3", s: "#e9cfd6", g: "#b8a9b6",
  };
  const R = (ch, n) => ch.repeat(n);
  const ART = {
    heart: [".rr.rr.", "rwrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."],
    gift: [
      "..rr...rr..", "...rrrrr...", "kkkkkkkkkkk", "kpppprppppk", "kpppprppppk",
      "kkkkkkkkkkk", ".kppprpppk.", ".kppprpppk.", ".kppprpppk.", ".kkkkkkkkk.",
    ],
    cake: [
      ".." + R("k", 20) + "..",
      ".k" + R("w", 20) + "k.",
      "kwwrwwwywwwwrwwwwywwrwwk",
      "k" + R("w", 22) + "k",
      "kpwwpppwwppwwwpppwwppwwk",
      "kppwppppwppppwpppppwpppk",
      "k" + R("p", 22) + "k",
      "k" + R("c", 22) + "k",
      "k" + R("p", 22) + "k",
      "k" + R("p", 22) + "k",
      "k" + R("dp", 11) + "k",
      "k" + R("p", 22) + "k",
      ".k" + R("p", 20) + "k.",
      ".." + R("k", 20) + "..",
      R("s", 24),
      "." + R("g", 22) + ".",
    ],
    candle: ["..k..", "kkkkk", "kwwpk", "kwppk", "kppwk", "kpwwk", "kwwpk", "kwppk", "kppwk", "kkkkk"],
    flame: ["..y..", ".yy..", ".yyy.", "yyoyy", "yoroy", ".yoy."],
  };

  function pixelSVG(rows, scale = 4) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    let rects = "";
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (!PAL[ch]) { x++; continue; }
        let run = 1;
        while (row[x + run] === ch) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${PAL[ch]}"/>`;
        x += run;
      }
    });
    return `<svg width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  function drawPixelGrid(ctx, rows, x0, y0, scale) {
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (!PAL[ch]) return;
        ctx.fillStyle = PAL[ch];
        ctx.fillRect(x0 + x * scale, y0 + y * scale, scale, scale);
      });
    });
  }

  $$("[data-art]").forEach((el) => (el.innerHTML = pixelSVG(ART[el.dataset.art], +el.dataset.scale || 4)));
  $$(".nama").forEach((el) => (el.textContent = C.nama.toUpperCase()));

  // Kelap-kelip di background
  const sp = $("#sparkles");
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    s.style.animationDuration = 2 + Math.random() * 3 + "s";
    sp.appendChild(s);
  }

  // ============================================================
  //  Suara chiptune (Web Audio, tanpa file)
  // ============================================================
  const Sound = {
    ctx: null,
    master: null,
    muted: false,
    init() {
      if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.14;
      this.master.connect(this.ctx.destination);
    },
    tone(freq, dur, { type = "square", when = 0, vol = 1, slide = 0 } = {}) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + when;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.linearRampToValueAtTime(Math.max(20, freq + slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    click() { this.tone(660, 0.06); },
    right() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, { when: i * 0.08 })); },
    wrong() { this.tone(220, 0.15, { slide: -80 }); this.tone(150, 0.25, { when: 0.15, slide: -60 }); },
    blip() { this.tone(820 + Math.random() * 160, 0.025, { vol: 0.35 }); },
    puff() { this.tone(320, 0.28, { type: "sawtooth", slide: -240, vol: 0.6 }); },
    scratch() { this.tone(1400 + Math.random() * 900, 0.02, { vol: 0.12 }); },
    birthday() {
      if (!this.ctx) return 0;
      const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
      const song = [
        ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
        ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
        ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
        ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
      ];
      const beat = 0.34;
      let t = 0.1;
      for (const [n, d] of song) {
        this.tone(N[n], d * beat * 0.92, { when: t, vol: 0.9 });
        this.tone(N[n] / 2, d * beat * 0.92, { when: t, type: "triangle", vol: 0.5 });
        t += d * beat;
      }
      return t;
    },
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.value = m ? 0 : 0.14;
      if (Music.el) Music.el.muted = m;
    },
  };
  document.addEventListener("pointerdown", () => Sound.init(), { once: true });

  // Lagu latar opsional (assets/lagu.mp3)
  const Music = {
    el: null,
    fade: 0,
    prepare() {
      if (this.el || !C.lagu) return;
      const a = new Audio();
      a.src = C.lagu;
      a.loop = true;
      a.preload = "auto";
      a.addEventListener("error", () => { if (this.el === a) this.el = null; });
      this.el = a;
    },
    // iOS: harus "dibuka" saat ada tap, biar nanti bisa diputar
    unlock() {
      this.prepare();
      const a = this.el;
      if (!a) return;
      a.muted = true;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = Sound.muted; }).catch(() => {});
    },
    play() {
      this.prepare();
      const a = this.el;
      if (!a) return;
      a.muted = Sound.muted;
      a.volume = 0;
      a.play().catch(() => {});
      clearInterval(this.fade);
      this.fade = setInterval(() => {
        a.volume = Math.min(0.7, a.volume + 0.05);
        if (a.volume >= 0.7) clearInterval(this.fade);
      }, 120);
    },
    stop() {
      clearInterval(this.fade);
      if (this.el) { this.el.pause(); this.el.currentTime = 0; }
    },
  };

  $("#mute").addEventListener("click", () => {
    Sound.setMuted(!Sound.muted);
    $("#mute").textContent = Sound.muted ? "♪ OFF" : "♪ ON";
  });

  // ============================================================
  //  Confetti pixel
  // ============================================================
  const Confetti = (() => {
    const cv = $("#confetti");
    const ctx = cv.getContext("2d");
    const COLS = ["#ff8fab", "#e5536f", "#ffd166", "#9be3c8", "#a0c4ff", "#c3b1e1"];
    let parts = [];
    let raf = 0;
    let rainUntil = 0;

    function resize() {
      cv.width = innerWidth * DPR;
      cv.height = innerHeight * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    addEventListener("resize", resize);
    resize();

    function add(x, y, vx, vy) {
      parts.push({ x, y, vx, vy, s: pick([4, 6, 8]), c: pick(COLS), life: Math.random() * 10 });
    }
    function burst(x = innerWidth / 2, y = innerHeight * 0.6, n = 140) {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
        const sp = 6 + Math.random() * 10;
        add(x, y, Math.cos(a) * sp, Math.sin(a) * sp);
      }
      start();
    }
    function rain(ms = 3000) {
      rainUntil = performance.now() + ms;
      start();
    }
    function start() { if (!raf) raf = requestAnimationFrame(step); }
    function step(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (now < rainUntil) {
        for (let i = 0; i < 3; i++) add(Math.random() * innerWidth, -10, (Math.random() - 0.5) * 2, 2 + Math.random() * 2);
      }
      parts = parts.filter((p) => p.y < innerHeight + 20);
      for (const p of parts) {
        p.vy = Math.min(p.vy + 0.25, 3.2);
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const w = Math.floor(p.life / 6) % 2 ? p.s : p.s / 2; // efek "berputar" ala pixel
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, w, p.s);
      }
      if (parts.length || now < rainUntil) raf = requestAnimationFrame(step);
      else { raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    return { burst, rain };
  })();

  // ============================================================
  //  Transisi antar layar: pixel dissolve
  // ============================================================
  let transitioning = false;
  function pixelTransition(mid) {
    return new Promise((resolve) => {
      const c = $("#fx");
      const ctx = c.getContext("2d");
      const W = innerWidth, H = innerHeight, S = 24;
      c.width = W * DPR;
      c.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const cells = [];
      for (let y = 0; y < Math.ceil(H / S); y++) for (let x = 0; x < Math.ceil(W / S); x++) cells.push([x, y]);
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      c.style.display = "block";
      const T = 300;
      let t0 = performance.now(), phase = 0, done = 0;
      ctx.fillStyle = "#ff8fab";
      const frame = (now) => {
        const p = Math.min(1, (now - t0) / T);
        const target = Math.floor(p * cells.length);
        for (; done < target; done++) {
          const [x, y] = cells[done];
          if (phase === 0) ctx.fillRect(x * S, y * S, S, S);
          else ctx.clearRect(x * S - 0.5, y * S - 0.5, S + 1, S + 1);
        }
        if (p >= 1) {
          if (phase === 0) {
            phase = 1; done = 0; t0 = now;
            mid && mid();
          } else {
            c.style.display = "none";
            return resolve();
          }
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  // ============================================================
  //  Navigasi layar
  // ============================================================
  const LEVEL = { quiz: 1, cake: 2, gallery: 3, coupon: 4, letter: 5 };
  let current = null;

  function show(name) {
    if (current === "cake" && name !== "cake") stopMic();
    if (current === "letter" && name !== "letter") typingToken = null;
    current = name;
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === "s-" + name));
    const lv = LEVEL[name];
    $("#hud").hidden = !lv;
    if (lv) $("#hud-lv").textContent = `LV ${lv}/5`;
    window.scrollTo(0, 0);
    INITS[name] && INITS[name]();
  }

  async function go(name) {
    if (transitioning) return;
    transitioning = true;
    await pixelTransition(() => show(name));
    transitioning = false;
  }

  function unlockName() {
    $("#hud-title").textContent = `♥ ${C.nama.toUpperCase()}.EXE`;
  }

  // ============================================================
  //  0. Countdown
  // ============================================================
  let cdTimer = 0;
  function initCountdown() {
    const target = new Date(C.bukaPada).getTime();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const ms = target - Date.now();
      if (ms <= 0) {
        clearInterval(cdTimer);
        go("start");
        return;
      }
      const s = Math.floor(ms / 1000);
      $("#cd-h").textContent = pad(Math.floor(s / 3600));
      $("#cd-m").textContent = pad(Math.floor((s % 3600) / 60));
      $("#cd-s").textContent = pad(s % 60);
    };
    clearInterval(cdTimer);
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  $("#btn-start").addEventListener("click", () => {
    Sound.init();
    Sound.right();
    Music.unlock();
    go("quiz");
  });

  // ============================================================
  //  LV.1 Kuis
  // ============================================================
  const BULAN = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

  function dateAnswers(iso) {
    const d = new Date(iso);
    const D = d.getDate(), M = d.getMonth() + 1, Y = d.getFullYear();
    const days = [String(D), String(D).padStart(2, "0")];
    const months = [String(M), String(M).padStart(2, "0"), BULAN[M - 1], BULAN[M - 1].slice(0, 3)];
    const years = ["", String(Y), String(Y).slice(2)];
    const out = new Set();
    days.forEach((dd) => months.forEach((mm) => years.forEach((yy) => out.add(dd + mm + yy))));
    return [...out];
  }

  let qi = 0, lives = 3, wrongs = 0, infinite = false, qBusy = false;

  function initQuiz() {
    qi = 0; lives = 3; infinite = false; qBusy = false;
    renderQ();
  }
  function renderQ() {
    const q = C.kuis[qi];
    wrongs = 0;
    $("#q-num").textContent = `SOAL ${qi + 1}/${C.kuis.length}`;
    $("#q-text").textContent = q.tanya;
    $("#q-input").value = "";
    setQMsg("", "");
    $("#q-giveup").hidden = true;
    renderLives();
  }
  function renderLives() {
    const hearts = infinite ? "∞" : "♥".repeat(lives) + "♡".repeat(3 - lives);
    $("#q-lives").innerHTML = `NYAWA <span class="hearts">${hearts}</span>`;
  }
  function setQMsg(text, cls) {
    const m = $("#q-msg");
    m.textContent = text;
    m.className = "q-msg " + cls;
  }

  $("#q-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (qBusy) return;
    const q = C.kuis[qi];
    const val = norm($("#q-input").value);
    if (!val) return;
    if (q.jawaban === "BEBAS") return quizCorrect(q.pesanBenar);
    const answers = q.jawaban === "TANGGAL_JADIAN" ? dateAnswers(C.tanggalJadian) : [].concat(q.jawaban).map(norm);
    if (answers.includes(val)) quizCorrect(q.pesanBenar);
    else quizWrong(q);
  });
  $("#q-giveup").addEventListener("click", () => quizCorrect("Hmm... oke deh, dimaafin kali ini 😤"));

  function quizCorrect(msg) {
    msg = msg || "BENAR! ✓";
    qBusy = true;
    Sound.right();
    setQMsg(msg, "ok");
    setTimeout(() => {
      qi++;
      qBusy = false;
      if (qi < C.kuis.length) renderQ();
      else quizGranted();
    }, msg.length > 20 ? 2200 : 1000); // pesan panjang dikasih waktu lebih buat dibaca
  }
  function quizWrong(q) {
    Sound.wrong();
    wrongs++;
    const box = $("#quiz-box");
    box.classList.remove("shake");
    void box.offsetWidth;
    box.classList.add("shake");
    let msg = pick(C.pesanSalah);
    if (!infinite) {
      lives--;
      if (lives <= 0) {
        infinite = true;
        msg = "NYAWA HABIS... tapi karena aku sayang kamu, nyawamu jadi ∞ 💗";
      }
    }
    renderLives();
    if (wrongs >= 2 && q.petunjuk) msg += `\nPetunjuk: ${q.petunjuk}`;
    if (wrongs >= 5) $("#q-giveup").hidden = false;
    setQMsg(msg, "bad");
    $("#q-input").select();
  }
  function quizGranted() {
    qBusy = true;
    $("#q-input").blur();
    $("#q-num").textContent = "SELESAI";
    $("#q-text").textContent = `Halo, ${C.nama} 👋`;
    setQMsg("AKSES DITERIMA ♥", "ok");
    unlockName();
    Sound.right();
    setTimeout(() => go("cake"), 1400);
  }

  // ============================================================
  //  LV.2 Kue + tiup lilin pakai mic
  // ============================================================
  let mic = null;
  let cakeDone = false;

  function initCake() {
    cakeDone = false;
    const wrap = $("#candles");
    wrap.innerHTML = "";
    for (let i = 0; i < (C.jumlahLilin || 3); i++) {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "candle";
      c.setAttribute("aria-label", `Tiup lilin ${i + 1}`);
      c.innerHTML = `<span class="flame">${pixelSVG(ART.flame, 5)}</span><span class="smoke"><i></i><i></i><i></i></span>${pixelSVG(ART.candle, 5)}`;
      c.querySelector(".flame").style.animationDelay = `${-Math.random()}s`;
      c.addEventListener("click", () => blowOut(c));
      wrap.appendChild(c);
    }
    $("#cake-title").textContent = "TIUP LILINNYA!";
    $("#cake-hint").textContent = "Make a wish dulu... terus tiup HP-nya kayak niup lilin beneran 🌬️";
    $("#btn-mic").hidden = false;
    $("#mic-alt").hidden = false;
    $("#meter").hidden = true;
    $("#cake-next").hidden = true;
  }

  function blowOut(c) {
    if (!c || c.classList.contains("out") || cakeDone) return;
    c.classList.add("out");
    c.classList.remove("windy");
    Sound.puff();
    if (!$$(".candle:not(.out)").length) celebrate();
  }

  async function celebrate() {
    cakeDone = true;
    stopMic();
    $("#btn-mic").hidden = true;
    $("#mic-alt").hidden = true;
    $("#meter").hidden = true;
    await sleep(500);
    $("#cake-title").innerHTML = `HAPPY BIRTHDAY,<br>${esc(C.nama.toUpperCase())}!`;
    $("#cake-hint").textContent = "Semoga semua wish kamu tadi dikabulin ✦";
    Confetti.burst();
    Confetti.rain(4000);
    const dur = Sound.birthday();
    setTimeout(() => { $("#cake-next").hidden = false; }, Math.min(dur * 1000, 5000));
  }

  $("#btn-mic").addEventListener("click", startMic);
  $("#cake-next").addEventListener("click", () => { Sound.click(); go("gallery"); });

  async function startMic() {
    Sound.init();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !Sound.ctx) {
      return micFail("Browser ini gak bisa akses mic 🥲 tap lilinnya aja ya 👆");
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      return micFail("Mic-nya gak diizinin 🥲 gapapa, tap lilinnya aja ya 👆");
    }
    if (current !== "cake" || cakeDone) { stream.getTracks().forEach((t) => t.stop()); return; }

    const ctx = Sound.ctx;
    if (ctx.state === "suspended") await ctx.resume();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 1024;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    mic = { stream, src, raf: 0 };

    $("#btn-mic").hidden = true;
    $("#cake-hint").textContent = "Ayo tiup! 🌬️ yang kenceng ya";
    const meter = $("#meter");
    meter.innerHTML = "<i></i>".repeat(12);
    meter.hidden = false;
    const bars = $$("i", meter);

    // Kalibrasi kebisingan ruangan ~0.6 detik pertama
    const t0 = performance.now();
    let base = 0, hot = 0, cooldown = 0;
    const loop = (now) => {
      if (!mic) return;
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      const calibrating = now - t0 < 600;
      if (calibrating) base = Math.max(base, rms);
      const thr = Math.max(0.12, base * 2.5);
      const level = Math.min(1, rms / (thr * 1.3));
      bars.forEach((b, i) => b.classList.toggle("on", i < Math.round(level * bars.length)));
      $$(".candle:not(.out)").forEach((c) => c.classList.toggle("windy", rms > thr * 0.5));
      if (!calibrating) {
        hot = rms > thr ? hot + 1 : Math.max(0, hot - 1);
        if (hot >= 5 && now > cooldown) {
          blowOut($(".candle:not(.out)"));
          hot = 0;
          cooldown = now + 350;
        }
      }
      if (mic) mic.raf = requestAnimationFrame(loop);
    };
    mic.raf = requestAnimationFrame(loop);
  }

  function micFail(msg) {
    $("#btn-mic").hidden = true;
    $("#mic-alt").textContent = msg;
  }

  function stopMic() {
    if (!mic) return;
    cancelAnimationFrame(mic.raf);
    mic.stream.getTracks().forEach((t) => t.stop());
    try { mic.src.disconnect(); } catch {}
    mic = null;
  }

  // ============================================================
  //  LV.3 Galeri polaroid (foto muncul dari pixel -> jernih)
  // ============================================================
  let togetherTimer = 0;
  const tmpCanvas = document.createElement("canvas");

  function startTogether() {
    clearInterval(togetherTimer);
    const start = new Date(C.tanggalJadian).getTime();
    const upd = () => {
      let s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      $("#together").innerHTML =
        `<b>${d}</b> hari <b>${h}</b> jam <b>${m}</b> menit <b>${s}</b> detik<br>` +
        `<span class="muted small">udah kita lewatin bareng ♥</span>`;
    };
    upd();
    togetherTimer = setInterval(upd, 1000);
  }

  function placeholderImage(i) {
    const c = document.createElement("canvas");
    c.width = c.height = 240;
    const x = c.getContext("2d");
    x.fillStyle = ["#ffd6e0", "#ffe8a3", "#c9f0e1", "#e3d9ff"][i % 4];
    x.fillRect(0, 0, 240, 240);
    drawPixelGrid(x, ART.heart, 120 - 7 * 7, 70, 14);
    x.fillStyle = PAL.k;
    x.font = '12px "Press Start 2P", monospace';
    x.textAlign = "center";
    x.fillText(`FOTO ${i + 1}`, 120, 190);
    return c;
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function drawPixelated(item, block) {
    const cv = item.cv;
    const ctx = cv.getContext("2d");
    const img = item.img;
    const W = cv.width, H = cv.height;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.min(iw, ih);
    const sx = (iw - s) / 2, sy = (ih - s) * 0.3; // crop persegi, sedikit ke atas (biar muka gak kepotong)
    if (block <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, W, H);
      return;
    }
    const n = Math.max(2, Math.round(W / DPR / block));
    tmpCanvas.width = tmpCanvas.height = n;
    const t = tmpCanvas.getContext("2d");
    t.imageSmoothingEnabled = true;
    t.drawImage(img, sx, sy, s, s, 0, 0, n, n);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(tmpCanvas, 0, 0, n, n, 0, 0, W, H);
  }

  async function initGallery() {
    startTogether();
    const stack = $("#stack");
    const next = $("#gallery-next");
    stack.innerHTML = "";
    next.hidden = true;
    if (!C.foto.length) { next.hidden = false; return; }

    await document.fonts.ready;
    const items = C.foto.map((f, i) => {
      const el = document.createElement("div");
      el.className = "polaroid";
      el.innerHTML = `<canvas></canvas><p class="cap"></p>`;
      $(".cap", el).textContent = f.caption || "";
      el.dataset.rot = (Math.random() * 10 - 5).toFixed(1);
      stack.appendChild(el);
      return { i, el, cv: $("canvas", el), src: f.src, img: null, revealed: false };
    });
    const size = Math.round(items[0].cv.offsetWidth * DPR); // offsetWidth: tidak terpengaruh animasi scale
    items.forEach((it) => { it.cv.width = it.cv.height = size; });

    const order = [...items];
    const seen = new Set();
    let flinging = false;
    let drag = null;

    async function reveal(it) {
      it.revealed = true;
      for (const b of [36, 26, 18, 12, 8, 6, 4, 3, 2, 1]) {
        drawPixelated(it, b);
        await sleep(85);
      }
    }

    function layout() {
      order.forEach((it, k) => {
        it.el.style.zIndex = order.length - k;
        it.el.style.transition = "";
        it.el.style.transform = `translate(${k * 3}px, ${k * 5}px) rotate(${k === 0 ? 0 : it.el.dataset.rot}deg)`;
        it.el.style.visibility = k < 4 ? "visible" : "hidden";
        it.el.classList.toggle("top", k === 0);
      });
      const top = order[0];
      seen.add(top.i);
      if (top.img && !top.revealed) reveal(top);
      $("#g-count").textContent = `FOTO ${top.i + 1}/${items.length} · geser atau tap ⇆`;
      if (seen.size === items.length) next.hidden = false;
    }

    function fling(dir) {
      if (flinging) return;
      flinging = true;
      const top = order[0];
      Sound.click();
      top.el.style.transition = "transform 0.3s steps(6)";
      top.el.style.transform = `translate(${dir * innerWidth}px, -40px) rotate(${dir * 25}deg)`;
      setTimeout(() => {
        order.push(order.shift());
        layout();
        flinging = false;
      }, 300);
    }

    stack.onpointerdown = (e) => {
      const top = order[0];
      if (flinging || !top.el.contains(e.target)) return;
      drag = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, el: top.el };
      top.el.setPointerCapture(e.pointerId);
      top.el.style.transition = "none";
    };
    stack.onpointermove = (e) => {
      if (!drag) return;
      drag.dx = e.clientX - drag.x;
      drag.dy = e.clientY - drag.y;
      drag.el.style.transform = `translate(${drag.dx}px, ${drag.dy * 0.2}px) rotate(${drag.dx / 15}deg)`;
    };
    const end = () => {
      if (!drag) return;
      const { dx, dy } = drag;
      drag = null;
      if (Math.abs(dx) > 70) fling(Math.sign(dx));
      else if (Math.abs(dx) < 6 && Math.abs(dy) < 6) fling(1); // tap = foto berikutnya
      else layout();
    };
    stack.onpointerup = end;
    stack.onpointercancel = () => { drag = null; layout(); };

    layout();
    items.forEach(async (it) => {
      it.img = (await loadImage(it.src)) || placeholderImage(it.i);
      if (it === order[0] && !it.revealed) reveal(it);
      else if (!it.revealed) drawPixelated(it, 36);
    });
  }

  $("#gallery-next").addEventListener("click", () => { Sound.click(); go("coupon"); });

  // ============================================================
  //  LV.4 Kupon gosok
  // ============================================================
  function initCoupon() {
    const wrap = $("#coupons");
    const next = $("#coupon-next");
    wrap.innerHTML = "";
    next.hidden = true;
    let done = 0;
    C.kupon.forEach((k) => {
      const el = document.createElement("div");
      el.className = "coupon";
      el.innerHTML = `<span class="emo"></span><p></p><canvas></canvas>`;
      $(".emo", el).textContent = k.emoji || "🎟️";
      $("p", el).textContent = k.teks;
      wrap.appendChild(el);
    });
    if (!C.kupon.length) { next.hidden = false; return; }
    document.fonts.ready.then(() => {
      $$(".coupon", wrap).forEach((el) =>
        scratchable(el, () => {
          if (++done === C.kupon.length) next.hidden = false;
        })
      );
    });
  }

  function scratchable(el, onDone) {
    const cv = $("canvas", el);
    const W = el.offsetWidth, H = el.offsetHeight, B = 10;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    const ctx = cv.getContext("2d");
    ctx.scale(DPR, DPR);

    const cols = Math.ceil(W / B), rows = Math.ceil(H / B);
    const cleared = new Uint8Array(cols * rows);
    let count = 0, finished = false;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#ffc2d1" : "#ffb3c6";
        ctx.fillRect(x * B, y * B, B, B);
      }
    }
    drawPixelGrid(ctx, ART.heart, Math.round(W / 2 - 14), Math.round(H / 2 - 34), 4);
    ctx.fillStyle = PAL.k;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.fillText("GOSOK!", W / 2, H / 2 + 18);

    function scratchAt(px, py) {
      const bx = Math.floor(px / B), by = Math.floor(py / B);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy > 5) continue;
          const x = bx + dx, y = by + dy;
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const k = y * cols + x;
          if (cleared[k]) continue;
          cleared[k] = 1;
          count++;
          ctx.clearRect(x * B - 0.5, y * B - 0.5, B + 1, B + 1);
        }
      }
      if (!finished && count / cleared.length > 0.5) {
        finished = true;
        el.classList.add("done");
        Sound.right();
        const rr = el.getBoundingClientRect();
        Confetti.burst(rr.left + rr.width / 2, rr.top + rr.height / 2, 40);
        onDone();
      }
    }

    let last = null;
    const pos = (e) => {
      const b = cv.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    cv.addEventListener("pointerdown", (e) => {
      cv.setPointerCapture(e.pointerId);
      last = pos(e);
      scratchAt(...last);
    });
    cv.addEventListener("pointermove", (e) => {
      if (!last) return;
      const p = pos(e);
      const steps = Math.max(1, Math.ceil(Math.hypot(p[0] - last[0], p[1] - last[1]) / (B / 2)));
      for (let s = 1; s <= steps; s++) {
        scratchAt(last[0] + ((p[0] - last[0]) * s) / steps, last[1] + ((p[1] - last[1]) * s) / steps);
      }
      last = p;
      if (Math.random() < 0.3) Sound.scratch();
    });
    const up = () => (last = null);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
  }

  $("#coupon-next").addEventListener("click", () => {
    Sound.click();
    Music.play(); // dipanggil langsung saat tap biar gak diblok browser
    go("letter");
  });

  // ============================================================
  //  LV.5 Surat (efek mesin ketik)
  // ============================================================
  let typingToken = null;
  let skipTyping = false;

  function initLetter() {
    const box = $("#letter");
    box.innerHTML = "";
    $("#ending").hidden = true;
    $("#letter-skip").hidden = false;
    skipTyping = false;
    typeLetter(box);
  }

  async function typeLetter(box) {
    const token = {};
    typingToken = token;
    const fill = (s) => s.replaceAll("{nama}", C.nama).replaceAll("{pengirim}", C.pengirim);
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    await sleep(500);

    for (const text of C.surat.map(fill)) {
      const p = document.createElement("p");
      const node = document.createTextNode("");
      p.append(node, cursor);
      box.appendChild(p);
      let n = 0;
      for (const ch of Array.from(text)) {
        if (typingToken !== token) return;
        node.data += ch;
        if (!skipTyping) {
          if (ch !== " " && Math.random() < 0.5) Sound.blip();
          if (++n % 12 === 0) cursor.scrollIntoView({ block: "nearest" });
          await sleep(/[.,!?…—]/.test(ch) ? 220 : 38);
        }
      }
      if (!skipTyping) await sleep(380);
    }
    if (typingToken !== token) return;

    const sign = document.createElement("p");
    sign.className = "sign";
    sign.textContent = `— ${C.pengirim} ♥`;
    box.appendChild(sign);
    cursor.remove();
    finishLetter();
  }

  function finishLetter() {
    $("#letter-skip").hidden = true;
    const ending = $("#ending");
    ending.hidden = false;
    Sound.right();
    setTimeout(() => {
      ending.scrollIntoView({ behavior: "smooth", block: "center" });
      Confetti.burst(innerWidth / 2, innerHeight * 0.7, 90);
    }, 300);
  }

  $("#letter").addEventListener("click", () => { skipTyping = true; });
  $("#btn-replay").addEventListener("click", () => {
    Sound.click();
    Music.stop();
    go("cake");
  });

  // ============================================================
  //  Boot
  // ============================================================
  const INITS = {
    countdown: initCountdown,
    quiz: initQuiz,
    cake: initCake,
    gallery: initGallery,
    coupon: initCoupon,
    letter: initLetter,
  };

  const jump = params.get("lv");
  if (jump && document.getElementById("s-" + jump)) {
    if (LEVEL[jump] > 1) unlockName();
    show(jump);
  } else {
    const locked = !PREVIEW && Date.now() < new Date(C.bukaPada).getTime();
    show(locked ? "countdown" : "start");
  }
})();
