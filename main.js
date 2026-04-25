(function () {
  "use strict";

  var THEME_KEY = "pushi-ushi-theme";
  var PHONE_DISPLAY = "+48 123 456 789";
  var PHONE_TEL = "+48123456789";

  var html = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var yearEl = document.getElementById("year");
  var modalRoot = document.getElementById("orderModal");
  var modalBackdrop = modalRoot && modalRoot.querySelector(".modal-backdrop");
  var modalClose = document.getElementById("modalClose");
  var modalTitle = document.getElementById("modalTitle");
  var modalDesc = document.getElementById("modalDesc");
  var modalPhoneLink = document.getElementById("modalPhoneLink");
  var modalCallBtn = document.getElementById("modalCallBtn");
  var modalForm = document.getElementById("modalForm");
  var modalContact = document.getElementById("modalContact");

  var lastFocus = null;
  var closeTimer = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }

  function toggleTheme() {
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (getStoredTheme()) return;
      applyTheme(e.matches ? "dark" : "light");
    });
  }

  initTheme();

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (modalPhoneLink) {
    modalPhoneLink.textContent = PHONE_DISPLAY;
    modalPhoneLink.href = "tel:" + PHONE_TEL;
  }
  if (modalCallBtn) {
    modalCallBtn.href = "tel:" + PHONE_TEL;
  }

  function openModal(name, desc) {
    if (!modalRoot || !modalTitle || !modalDesc) return;
    lastFocus = document.activeElement;
    modalTitle.textContent = name;
    modalDesc.textContent =
      desc ||
      "Contact us to place your order — we will confirm fabrics, filling, and delivery.";
    modalRoot.hidden = false;
    modalRoot.setAttribute("aria-hidden", "false");
    modalRoot.classList.remove("is-closing");
    document.body.classList.add("modal-open");

    requestAnimationFrame(function () {
      modalRoot.classList.add("is-open");
    });

    if (modalContact) modalContact.value = "";
    if (modalClose) modalClose.focus();
  }

  function finishClose() {
    if (!modalRoot) return;
    modalRoot.classList.remove("is-open", "is-closing");
    modalRoot.hidden = true;
    modalRoot.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function closeModal() {
    if (!modalRoot || modalRoot.hidden || !modalRoot.classList.contains("is-open")) {
      finishClose();
      return;
    }
    modalRoot.classList.add("is-closing");
    modalRoot.classList.remove("is-open");

    var dialog = modalRoot.querySelector(".modal-dialog");
    var onEnd = function (e) {
      if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
      dialog.removeEventListener("transitionend", onEnd);
      finishClose();
    };
    if (dialog) {
      dialog.addEventListener("transitionend", onEnd);
    }
    closeTimer = window.setTimeout(finishClose, 400);
  }

  document.querySelectorAll("[data-order]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest("[data-product-name]");
      var name = card ? card.getAttribute("data-product-name") : "Your toy";
      var desc = card ? card.getAttribute("data-product-desc") : "";
      openModal(name, desc);
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalRoot && !modalRoot.hidden) {
      closeModal();
    }
  });

  if (modalForm) {
    modalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
