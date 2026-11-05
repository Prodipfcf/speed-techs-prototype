/* =========================================================
   SPEED TECHS — Landing page scripts
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Config (edit these later) ---------- */
  var CONFIG = {
    whatsappNumber: "441234567890", // international format, no "+" or spaces
    whatsappMessage: "Hello SPEED TECHS, I would like to enquire about your services.",
    // Set to a real endpoint (e.g. Formspree, your own API) to send forms. Leave "" for demo mode.
    formEndpoint: ""
  };

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Header: shadow on scroll ---------- */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Toggle menu (burger) ---------- */
  var burger = $(".burger");
  var panel = $("#menu-panel");
  var nav = $("#primary-nav");

  function setMenu(open) {
    panel.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  burger.addEventListener("click", function (e) {
    e.stopPropagation();
    setMenu(panel.hidden);
  });
  $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target)) setMenu(false);
  });

  /* ---------- Services dropdown ---------- */
  var dropdown = $(".nav__dropdown");
  var toggle = $(".nav__toggle", dropdown);

  function setDropdown(open) {
    dropdown.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setDropdown(!dropdown.classList.contains("is-open"));
  });
  // hover support on desktop
  if (window.matchMedia("(hover: hover)").matches) {
    dropdown.addEventListener("mouseenter", function () { setDropdown(true); });
    dropdown.addEventListener("mouseleave", function () { setDropdown(false); });
  }
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) setDropdown(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setDropdown(false); setMenu(false); }
  });

  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () { setDropdown(false); });
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = $$(".nav__link[href^='#']");
  var sectionMap = navLinks.map(function (l) { return { link: l, el: $(l.getAttribute("href")) }; })
    .filter(function (m) { return m.el; });
  if ("IntersectionObserver" in window && sectionMap.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove("is-active"); });
        var hit = sectionMap.filter(function (m) { return m.el === en.target; })[0];
        if (hit) hit.link.classList.add("is-active");
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sectionMap.forEach(function (m) { io.observe(m.el); });
    io.observe($("#top"));
  }

  /* ---------- Vehicle data (make → models) ---------- */
  var VEHICLES = {
    "Audi": ["A1", "A3", "A4", "A5", "A6", "Q3", "Q5", "Q7", "TT"],
    "BMW": ["1 Series", "2 Series", "3 Series", "5 Series", "X1", "X3", "X5", "M3"],
    "Ford": ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Transit", "Ranger"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "Sprinter"],
    "Toyota": ["Yaris", "Corolla", "Auris", "RAV4", "Hilux", "Land Cruiser"],
    "Volkswagen": ["Polo", "Golf", "Passat", "Tiguan", "Transporter", "Caddy"],
    "Other": ["Other"]
  };

  var makeSel = $("#vq-make");
  var modelSel = $("#vq-model");
  var yearSel = $("#vq-year");

  function addOption(sel, value) {
    var o = document.createElement("option");
    o.value = value; o.textContent = value;
    sel.appendChild(o);
  }
  Object.keys(VEHICLES).forEach(function (m) { addOption(makeSel, m); });

  var thisYear = new Date().getFullYear();
  for (var y = thisYear; y >= 1995; y--) addOption(yearSel, String(y));

  makeSel.addEventListener("change", function () {
    modelSel.innerHTML = '<option value="">Model</option>';
    var models = VEHICLES[makeSel.value] || [];
    models.forEach(function (m) { addOption(modelSel, m); });
    modelSel.disabled = !models.length;
  });

  /* ---------- WhatsApp links ---------- */
  var waUrl = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage);
  $$("[data-whatsapp]").forEach(function (a) {
    a.href = waUrl;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Forms ---------- */
  function fieldOf(el) { return el.closest(".field"); }

  function validate(form) {
    var ok = true;
    $$("[required]", form).forEach(function (el) {
      var valid = el.value.trim() !== "";
      if (valid && el.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
      if (valid && el.type === "tel") valid = /^[+()\d\s-]{7,}$/.test(el.value);
      if (valid && el.name === "postcode") valid = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/.test(el.value.trim());
      var f = fieldOf(el);
      if (f) f.classList.toggle("has-error", !valid);
      el.setAttribute("aria-invalid", String(!valid));
      if (!valid) ok = false;
    });
    return ok;
  }

  function handleForm(form, successMsg) {
    var status = $(".form-status", form);

    // clear error state as the user fixes fields
    form.addEventListener("input", function (e) {
      var f = fieldOf(e.target);
      if (f) f.classList.remove("has-error");
    });
    form.addEventListener("change", function (e) {
      var f = fieldOf(e.target);
      if (f) f.classList.remove("has-error");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";

      if (!validate(form)) {
        status.textContent = "Please complete the highlighted fields.";
        status.classList.add("is-error");
        var first = $(".has-error input, .has-error select, .has-error textarea", form);
        if (first) first.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      function done() {
        status.textContent = successMsg;
        status.classList.add("is-success");
        form.reset();
        if (form.id === "vehicle-form") { modelSel.disabled = true; modelSel.innerHTML = '<option value="">Model</option>'; }
      }

      if (CONFIG.formEndpoint) {
        status.textContent = "Sending…";
        fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          done();
        }).catch(function () {
          status.textContent = "Something went wrong. Please try again or use WhatsApp.";
          status.classList.add("is-error");
        });
      } else {
        // Demo mode – no backend connected yet
        console.info("Form submitted (demo mode):", data);
        done();
      }
    });
  }

  handleForm($("#vehicle-form"), "Thanks! We'll send your tailored quote shortly.");
  handleForm($("#enquiry-form"), "Thanks! We've received your enquiry and will be in touch soon.");

  /* ---------- Footer year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
