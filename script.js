(function () {
  "use strict";

  /* -------------------------------------------------- *
   *  Smooth-scroll for anchor links
   * -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // close mobile nav
        navLinks.classList.remove("nav__links--open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* -------------------------------------------------- *
   *  Mobile nav toggle
   * -------------------------------------------------- */
  var navToggle = document.querySelector(".nav__toggle");
  var navLinks = document.querySelector(".nav__links");

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("nav__links--open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  /* -------------------------------------------------- *
   *  Interactive SVG demo
   * -------------------------------------------------- */
  var DIRECTIONS = [
    { name: "Front",       cx: 170, cy: 25  },
    { name: "Front right", cx: 272, cy: 68  },
    { name: "Right",       cx: 315, cy: 170 },
    { name: "Back right",  cx: 272, cy: 272 },
    { name: "Back",        cx: 170, cy: 315 },
    { name: "Back left",   cx: 68,  cy: 272 },
    { name: "Left",        cx: 25,  cy: 170 },
    { name: "Front left",  cx: 68,  cy: 68  }
  ];

  var SOUNDS = [
    { label: "Vehicle horn",    pattern: "2 short pulses" },
    { label: "Machine alarm",   pattern: "Continuous buzz" },
    { label: "Emergency siren", pattern: "3 rapid pulses" },
    { label: "Spoken call",     pattern: "Long single pulse" }
  ];

  var currentDir = 0;
  var currentSound = 0;
  var autoCycleTimer = null;
  var userInteracted = false;

  var soundDot = document.getElementById("sound-dot");
  var soundIcon = document.getElementById("sound-icon");
  var readoutSound = document.getElementById("readout-sound");
  var readoutDir = document.getElementById("readout-dir");
  var readoutPattern = document.getElementById("readout-pattern");
  var motors = document.querySelectorAll(".motor");
  var zones = document.querySelectorAll(".zone");
  var chips = document.querySelectorAll(".chip");

  function updateDemo(dirIdx, soundIdx) {
    currentDir = dirIdx;
    currentSound = soundIdx;
    var d = DIRECTIONS[dirIdx];
    var s = SOUNDS[soundIdx];

    // Move sound source
    soundDot.setAttribute("cx", d.cx);
    soundDot.setAttribute("cy", d.cy);
    soundIcon.setAttribute("x", d.cx);
    soundIcon.setAttribute("y", d.cy + 5);

    // Pulse the matching motor
    motors.forEach(function (m) {
      m.classList.remove("motor--active");
    });
    motors[dirIdx].classList.add("motor--active");

    // Readout
    readoutSound.textContent = s.label;
    readoutDir.textContent = d.name;
    readoutPattern.textContent = s.pattern;

    // Chip state
    chips.forEach(function (c, i) {
      var active = i === soundIdx;
      c.classList.toggle("chip--active", active);
      c.setAttribute("aria-pressed", String(active));
    });
  }

  // Clickable zones
  zones.forEach(function (z) {
    function activate() {
      stopAutoCycle();
      updateDemo(parseInt(z.dataset.zone, 10), currentSound);
    }
    z.addEventListener("click", activate);
    z.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  // Sound chips
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      stopAutoCycle();
      updateDemo(currentDir, parseInt(c.dataset.sound, 10));
    });
  });

  // Auto-cycle
  function autoCycle() {
    var nextDir = (currentDir + 1) % 8;
    var nextSound = Math.floor(Math.random() * SOUNDS.length);
    updateDemo(nextDir, nextSound);
  }

  function startAutoCycle() {
    if (!userInteracted) {
      autoCycleTimer = setInterval(autoCycle, 2200);
    }
  }

  function stopAutoCycle() {
    userInteracted = true;
    if (autoCycleTimer) {
      clearInterval(autoCycleTimer);
      autoCycleTimer = null;
    }
  }

  // Init
  updateDemo(0, 0);
  startAutoCycle();

  /* -------------------------------------------------- *
   *  Contact form validation
   * -------------------------------------------------- */
  var form = document.getElementById("contact-form");
  var successMsg = document.getElementById("form-success");

  function showError(id, msg) {
    var el = document.getElementById(id);
    el.textContent = msg;
    el.previousElementSibling.classList.add("input--error");
  }

  function clearErrors() {
    form.querySelectorAll(".form-error").forEach(function (e) {
      e.textContent = "";
    });
    form.querySelectorAll(".input--error").forEach(function (e) {
      e.classList.remove("input--error");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var valid = true;
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();

    if (!name) {
      showError("cf-name-err", "Please enter your name.");
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("cf-email-err", "Please enter a valid email address.");
      valid = false;
    }
    if (!message) {
      showError("cf-msg-err", "Please enter a message.");
      valid = false;
    }

    if (valid) {
      form.style.display = "none";
      successMsg.hidden = false;
    }
  });

  /* -------------------------------------------------- *
   *  Scroll-triggered section fade-in
   * -------------------------------------------------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced && "IntersectionObserver" in window) {
    var sections = document.querySelectorAll(".section, .hero");
    sections.forEach(function (s) { s.classList.add("reveal"); });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach(function (s) { observer.observe(s); });
  }
})();
