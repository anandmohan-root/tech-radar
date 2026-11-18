(function () {
  "use strict";

  var site = window.SITE, radar = window.RADAR, adrs = window.ADRS;
  var main = document.getElementById("main");
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
  }
  // Blank line = paragraph, "- " lines = bullet list.
  function md(text) {
    return String(text).split(/\n\s*\n/).map(function (block) {
      var lines = block.split("\n");
      if (lines.every(function (l) { return /^\s*- /.test(l); })) {
        return "<ul>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*- /, "")) + "</li>"; }).join("") + "</ul>";
      }
      return "<p>" + inline(block) + "</p>";
    }).join("");
  }
  function adrById(id) {
    for (var i = 0; i < adrs.length; i++) if (adrs[i].id === id) return adrs[i];
    return null;
  }
  function svg(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  // Small deterministic random generator so blips keep their positions between visits.
  function seeded(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  // Number entries in legend order: quadrant, then ring, then file order.
  var entries = radar.entries.map(function (e, i) { return Object.assign({ order: i }, e); });
  entries.sort(function (a, b) { return a.q - b.q || a.r - b.r || a.order - b.order; });
  entries.forEach(function (e, i) { e.id = i + 1; });

  // ---------- shell ----------
  document.getElementById("owner").textContent = site.owner;
  document.getElementById("role").textContent = site.role;
  document.getElementById("updated").textContent = "Updated " + site.updated;
  document.getElementById("links").innerHTML = site.links.map(function (l) {
    return '<a href="' + esc(l.url) + '" rel="me noopener" target="_blank">' + esc(l.label) + "</a>";
  }).join("");
  document.getElementById("draft").hidden = !site.draftNotice;

  // ---------- radar ----------
  var SIZE = 640, C = SIZE / 2;
  var RADII = [0, 130, 205, 262, 310];
  // Quadrant 0 = top right, 1 = top left, 2 = bottom left, 3 = bottom right (counter-clockwise).
  function placeBlips() {
    var rand = seeded(42), placed = [];
    entries.forEach(function (e) {
      var a0 = e.q * 90 + 9, a1 = e.q * 90 + 81;
      var r0 = (e.r === 0 ? 34 : RADII[e.r] + 16), r1 = RADII[e.r + 1] - 16;
      var best = null;
      for (var t = 0; t < 300; t++) {
        var a = (a0 + rand() * (a1 - a0)) * Math.PI / 180;
        var r = Math.sqrt(r0 * r0 + rand() * (r1 * r1 - r0 * r0));
        var x = C + r * Math.cos(a), y = C - r * Math.sin(a);
        var minD = Infinity;
        placed.forEach(function (p) { minD = Math.min(minD, Math.hypot(p.x - x, p.y - y)); });
        if (!best || minD > best.d) best = { x: x, y: y, d: minD };
        if (minD >= 30) break;
      }
      e.x = best.x; e.y = best.y;
      placed.push(best);
    });
  }
  placeBlips();

  function qColor(q) { return "var(--q" + q + ")"; }

  function buildSvg() {
    var s = svg("svg", { viewBox: "0 0 " + SIZE + " " + SIZE, class: "radar-svg", role: "img", "aria-label": "Technology radar" });
    for (var i = RADII.length - 1; i > 0; i--) {
      s.appendChild(svg("circle", { cx: C, cy: C, r: RADII[i], class: "ring", fill: "var(--ring-fill-" + (i - 1) + ")" }));
    }
    s.appendChild(svg("line", { x1: C - RADII[4], y1: C, x2: C + RADII[4], y2: C, class: "axis" }));
    s.appendChild(svg("line", { x1: C, y1: C - RADII[4], x2: C, y2: C + RADII[4], class: "axis" }));
    radar.rings.forEach(function (ring, i) {
      var mid = (RADII[i] + RADII[i + 1]) / 2;
      var t = svg("text", { x: C + mid, y: C - 6, class: "ring-label" });
      t.textContent = ring.name;
      s.appendChild(t);
    });
    var corners = [
      { x: SIZE - 6, y: 18, anchor: "end" }, { x: 6, y: 18, anchor: "start" },
      { x: 6, y: SIZE - 8, anchor: "start" }, { x: SIZE - 6, y: SIZE - 8, anchor: "end" },
    ];
    radar.quadrants.forEach(function (name, q) {
      var t = svg("text", { x: corners[q].x, y: corners[q].y, "text-anchor": corners[q].anchor, class: "q-label", fill: qColor(q) });
      t.textContent = name;
      s.appendChild(t);
    });
    entries.forEach(function (e) {
      var g = svg("g", { class: "blip", "data-id": e.id, tabindex: "0", role: "button", "aria-label": e.id + ". " + e.name + ", " + radar.rings[e.r].name });
      g.appendChild(svg("circle", { cx: e.x.toFixed(1), cy: e.y.toFixed(1), r: 10, fill: qColor(e.q) }));
      var t = svg("text", { x: e.x.toFixed(1), y: (e.y + 0.5).toFixed(1) });
      t.textContent = e.id;
      g.appendChild(t);
      var title = svg("title", {});
      title.textContent = e.name;
      g.appendChild(title);
      s.appendChild(g);
    });
    return s;
  }

  function renderRadar() {
    document.title = "Tech Radar · " + site.owner;
    var legend = radar.quadrants.map(function (name, q) {
      var rings = radar.rings.map(function (ring, r) {
        var items = entries.filter(function (e) { return e.q === q && e.r === r; });
        if (!items.length) return "";
        return "<h3>" + esc(ring.name) + "</h3><ol>" + items.map(function (e) {
          return '<li><button type="button" data-id="' + e.id + '"><span class="n">' + e.id + "</span><span>" + esc(e.name) + "</span></button></li>";
        }).join("") + "</ol>";
      }).join("");
      return '<section style="--qc:' + qColor(q) + '"><h2>' + esc(name) + "</h2>" + rings + "</section>";
    }).join("");

    main.innerHTML =
      '<div class="page-head"><h1>Technology Radar</h1><p>' + esc(site.intro) + "</p></div>" +
      '<ul class="ring-key">' + radar.rings.map(function (r) { return "<li><b>" + esc(r.name) + "</b> · " + esc(r.text) + "</li>"; }).join("") + "</ul>" +
      '<div class="radar-layout">' +
        '<div><div class="radar-card" id="radar-card"></div>' +
        '<div class="detail" id="detail" aria-live="polite"><p class="hint">Select a dot or a name to see why it is where it is.</p></div></div>' +
        '<div class="legend">' + legend + "</div>" +
      "</div>";
    document.getElementById("radar-card").appendChild(buildSvg());
  }

  function detailNotes(name) {
    var d = (window.DETAILS || {})[name];
    if (!d) return "";
    function list(items) { return "<ul>" + items.map(function (t) { return "<li>" + inline(t) + "</li>"; }).join("") + "</ul>"; }
    return '<div class="notes"><h4>Case study</h4><p>' + inline(d.case) + "</p>" +
      '<div class="proscons"><div><h4>Pros</h4>' + list(d.pros) + "</div><div><h4>Cons</h4>" + list(d.cons) + "</div></div>" +
      "<h4>When to use it</h4><p>" + inline(d.fit) + "</p></div>";
  }

  function select(id) {
    var e = entries[id - 1];
    if (!e) return;
    var adr = e.adr && adrById(e.adr);
    document.getElementById("detail").innerHTML =
      '<div class="meta" style="color:' + qColor(e.q) + '">' + esc(radar.quadrants[e.q]) + " · " + esc(radar.rings[e.r].name) + "</div>" +
      "<h3>" + e.id + ". " + esc(e.name) + "</h3><p>" + inline(e.text) + "</p>" +
      detailNotes(e.name) +
      (adr ? '<p style="margin-top:8px"><a href="#/decisions/' + adr.id + '">Read the decision: ' + esc(adr.title) + " →</a></p>" : "");
    document.querySelectorAll("[data-id]").forEach(function (el) {
      el.classList.toggle("is-active", el.getAttribute("data-id") === String(id));
    });
  }
  // Radar interactions, attached once; they only match elements on the radar page.
  function blipFrom(ev) { return ev.target.closest && ev.target.closest("[data-id]"); }
  main.addEventListener("mouseover", function (ev) {
    var el = blipFrom(ev);
    if (el) select(+el.getAttribute("data-id"));
  });
  main.addEventListener("focusin", function (ev) {
    var el = blipFrom(ev);
    if (el) select(+el.getAttribute("data-id"));
  });
  main.addEventListener("click", function (ev) {
    var el = blipFrom(ev);
    if (!el) return;
    select(+el.getAttribute("data-id"));
    // On narrow screens the detail box is above the legend; bring it into view.
    if (el.tagName === "BUTTON" && window.innerWidth < 980) {
      document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
  main.addEventListener("keydown", function (ev) {
    var el = ev.target.closest && ev.target.closest(".blip");
    if (el && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); select(+el.getAttribute("data-id")); }
  });

  // ---------- decisions ----------
  function statusBadge(s) {
    return '<span class="status status-' + esc(s.toLowerCase()) + '">' + esc(s) + "</span>";
  }
  function adrMeta(a) {
    return '<div class="adr-meta">' + statusBadge(a.status) + "<span>" + esc(a.id.toUpperCase()) + "</span><span>" + esc(a.date) + "</span>" +
      a.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>";
  }

  function renderDecisions() {
    document.title = "Decisions · " + site.owner;
    main.innerHTML =
      '<div class="page-head"><h1>Architecture Decisions</h1><p>Significant decisions written as Architecture Decision Records: the context, the options considered, what was decided and what it costs.</p></div>' +
      '<ul class="adr-list">' + adrs.map(function (a) {
        return '<li><a class="adr-card" href="#/decisions/' + a.id + '">' + adrMeta(a) + "<h2>" + esc(a.title) + "</h2><p>" + inline(a.context.split(". ")[0]) + ".</p></a></li>";
      }).join("") + "</ul>";
  }

  function renderAdr(id) {
    var a = adrById(id);
    if (!a) { renderNotFound(); return; }
    document.title = a.title + " · " + site.owner;
    var related = entries.filter(function (e) { return e.adr === a.id; });
    main.innerHTML =
      '<article class="adr"><a class="back" href="#/decisions">← All decisions</a>' + adrMeta(a) + "<h1>" + esc(a.title) + "</h1>" +
      "<section><h2>Context</h2>" + md(a.context) + "</section>" +
      "<section><h2>Options considered</h2>" + md(a.options) + "</section>" +
      '<section><h2>Decision</h2><div class="decision">' + md(a.decision) + "</div></section>" +
      "<section><h2>Consequences</h2>" + md(a.consequences) + "</section>" +
      (related.length ? '<p class="related">On the radar: ' + related.map(function (e) {
        return esc(e.name) + " (" + esc(radar.rings[e.r].name) + ")";
      }).join(", ") + "</p>" : "") +
      "</article>";
  }

  // ---------- about ----------
  function renderAbout() {
    document.title = "About · " + site.owner;
    main.innerHTML =
      '<div class="about"><div class="page-head"><h1>About this site</h1></div>' +
      "<p>" + esc(site.intro) + "</p>" +
      "<p>The <a href=\"#/radar\">technology radar</a> places each technology, technique or tool in one of four rings:</p><ul>" +
      radar.rings.map(function (r) { return "<li><strong>" + esc(r.name) + "</strong>: " + esc(r.text) + "</li>"; }).join("") +
      "</ul><p>The radar is opinionated and personal. It reflects the systems I build: Java and Spring services, data and caching, messaging, and the architecture practices that hold them together.</p>" +
      "<p>The <a href=\"#/decisions\">decision log</a> explains the bigger choices behind the radar, in the Architecture Decision Record format: context, options, decision and consequences.</p></div>";
  }

  function renderNotFound() {
    document.title = "Not found · " + site.owner;
    main.innerHTML = '<div class="page-head"><h1>Page not found</h1><p><a href="#/radar">Back to the radar</a></p></div>';
  }

  // ---------- router ----------
  function route() {
    var parts = (location.hash.replace(/^#\/?/, "") || "radar").split("/");
    var page = parts[0];
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (page === "radar") renderRadar();
    else if (page === "decisions" && parts[1]) renderAdr(parts[1]);
    else if (page === "decisions") renderDecisions();
    else if (page === "about") renderAbout();
    else renderNotFound();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", function () { route(); main.focus({ preventScroll: true }); });
  route();
})();
