const Toast = (() => {
  let vp = document.getElementById("toast-viewport");

  function getViewport() {
    if (!vp || !document.body.contains(vp)) {
      vp = document.createElement("div");
      vp.id = "toast-viewport";
      document.body.appendChild(vp);
    }
    return vp;
  }

  const ICONS = {
    error: `<svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#FEE2E2"/><circle cx="11" cy="11" r="9" fill="#EF4444"/><path d="M8 8l6 6M14 8l-6 6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    info: `<svg viewBox="0 0 22 22" fill="none"><rect x="5" y="3" width="12" height="16" rx="2.5" stroke="#3B82F6" stroke-width="1.3" fill="#DBEAFE"/><rect x="3" y="4" width="12" height="16" rx="2.5" fill="#93B4F6" opacity=".35"/><line x1="8" y1="7" x2="14" y2="7" stroke="#3B82F6" stroke-width="1.1" stroke-linecap="round"/></svg>`,
    spinner: `<div class="toast-spinner"></div>`,
    success: `<svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#DCFCE7"/><circle cx="11" cy="11" r="9" fill="#22C55E"/><path d="M7.5 11.5l2.5 2.5 4.5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    successDark: `<svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill="#166534"/><path d="M7.5 11.5l2.5 2.5 4.5-5" stroke="#4ADE80" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  const COLORS = {
    light: {
      error: "#DC2626",
      info: "#2563EB",
      loading: "#666",
      success: "#16A34A",
    },
    dark: {
      error: "#F87171",
      info: "#60A5FA",
      loading: "#aaa",
      success: "#4ADE80",
    },
  };

  const SWIPE_THRESHOLD = 60;
  const SWIPE_DISMISS_VELOCITY = 0.5;

  function cloneAndMeasure(el, parentWidth) {
    const c = el.cloneNode(true);
    c.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${parentWidth}px;height:auto;visibility:hidden;pointer-events:none;`;
    document.body.appendChild(c);
    const h = c.scrollHeight;
    c.remove();
    return h;
  }

  function resizePill(api) {
    requestAnimationFrame(() => {
      const w = api.header.offsetWidth;
      api.bg.style.width = w + "px";
    });
  }

  function initSwipe(api) {
    const el = api.el;
    el.classList.add("swipe-enabled");
    el.style.touchAction = "none";

    let startY = 0;
    let startTime = 0;
    let currentY = 0;
    let dragging = false;

    function onPointerDown(e) {
      if (api._dead) return;
      if (e.target.closest(".toast-btn, button")) return;

      dragging = true;
      startY = e.clientY;
      startTime = Date.now();
      currentY = 0;

      el.classList.add("swiping");
      el.classList.remove("snap-back");
      el.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const deltaY = e.clientY - startY;

      if (deltaY < 0) {
        currentY = deltaY;
      } else {
        currentY = deltaY * 0.2;
      }

      const progress = Math.min(Math.abs(Math.min(currentY, 0)) / 150, 1);
      const opacity = 1 - progress * 0.6;
      const scale = 1 - progress * 0.08;

      el.style.transform = `translateY(${currentY}px) scale(${scale})`;
      el.style.opacity = opacity;
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("swiping");

      const deltaY = currentY;
      const elapsed = Date.now() - startTime;
      const velocity = Math.abs(deltaY) / elapsed;

      if (
        deltaY < -SWIPE_THRESHOLD ||
        (deltaY < -20 && velocity > SWIPE_DISMISS_VELOCITY)
      ) {
        el.style.transition =
          "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), " +
          "opacity 0.2s ease";
        el.style.transform = `translateY(${deltaY - 80}px) scale(0.85)`;
        el.style.opacity = "0";
        el.style.pointerEvents = "none";

        setTimeout(() => {
          if (api._dead) return;
          api._dead = true;
          const wrapper = api.wrapper;
          const wrapperHeight = wrapper.offsetHeight;
          wrapper.style.maxHeight = wrapperHeight + "px";
          wrapper.style.overflow = "clip";
          requestAnimationFrame(() => {
            wrapper.style.transition =
              "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
            wrapper.style.maxHeight = "0px";
          });
          setTimeout(() => wrapper.remove(), 450);
        }, 150);
      } else {
        el.classList.add("snap-back");
        el.style.transform = "translateY(0) scale(1)";
        el.style.opacity = "1";

        const cleanup = () => {
          el.classList.remove("snap-back");
          el.style.transform = "";
          el.style.opacity = "";
          el.removeEventListener("transitionend", cleanup);
        };
        el.addEventListener("transitionend", cleanup, { once: true });
        setTimeout(cleanup, 500);
      }
    }

    function onPointerCancel() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("swiping");
      el.classList.add("snap-back");
      el.style.transform = "translateY(0) scale(1)";
      el.style.opacity = "1";
      setTimeout(() => {
        el.classList.remove("snap-back");
        el.style.transform = "";
        el.style.opacity = "";
      }, 500);
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    api._cleanupSwipe = () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }

  function create(opts = {}) {
    const {
      type = "info",
      title = "",
      description = "",
      theme = "light",
      actionLabel = null,
      onAction = null,
      richHTML = null,
      expandDelay = 800,
      autoDismiss = 0,
      swipeDismiss = true,
    } = opts;

    const viewport = getViewport();
    const isDark = theme === "dark";

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "overflow:visible;";

    const el = document.createElement("div");
    el.className = "toast";
    el.dataset.theme = theme;

    el.innerHTML = `
      <div class="toast-bg"></div>
      <div class="toast-content">
        <div class="toast-header">
          <div class="toast-icon"></div>
          <span class="toast-title"></span>
        </div>
        <div class="toast-body-wrap" style="height:0;">
          <div class="toast-body-content"></div>
        </div>
      </div>
    `;

    const bg = el.querySelector(".toast-bg");
    const header = el.querySelector(".toast-header");
    const icon = el.querySelector(".toast-icon");
    const titleEl = el.querySelector(".toast-title");
    const bodyWrap = el.querySelector(".toast-body-wrap");
    const bodyContent = el.querySelector(".toast-body-content");

    icon.innerHTML =
      type === "loading" ? ICONS.spinner : ICONS[type] || ICONS.info;
    titleEl.textContent = title;
    titleEl.style.color =
      (isDark ? COLORS.dark : COLORS.light)[type] || "#666";

    const hasBody = description || actionLabel || richHTML;
    let btnEl = null;

    if (description) {
      const p = document.createElement("p");
      p.className = "toast-desc";
      p.textContent = description;
      bodyContent.appendChild(p);
    }
    if (richHTML) {
      const d = document.createElement("div");
      d.innerHTML = richHTML;
      bodyContent.appendChild(d);
    }
    if (actionLabel) {
      btnEl = document.createElement("button");
      btnEl.className = `toast-btn style-${isDark ? "dark" : type}`;
      btnEl.textContent = actionLabel;
      bodyContent.appendChild(btnEl);
    }

    wrapper.appendChild(el);
    viewport.appendChild(wrapper);

    const headerW = header.offsetWidth;
    bg.style.width = headerW + "px";

    const api = {
      el,
      wrapper,
      bg,
      header,
      icon,
      titleEl,
      bodyWrap,
      bodyContent,
      btnEl,
      _dead: false,
      _expanded: false,
      _collapseDelay: 250,
      _cleanupSwipe: null,
    };

    if (btnEl && onAction) {
      btnEl.addEventListener("click", () => onAction(api));
    }

    if (swipeDismiss) {
      initSwipe(api);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("show");
        if (hasBody) {
          setTimeout(() => expand(api), expandDelay);
          if (autoDismiss > 0) {
            setTimeout(
              () => dismiss(api),
              expandDelay + 600 + autoDismiss,
            );
          }
        } else if (autoDismiss > 0) {
          setTimeout(() => dismiss(api), autoDismiss);
        }
      });
    });

    api.expand = () => expand(api);
    api.collapse = () => collapse(api);
    api.dismiss = () => dismiss(api);

    api.setTitle = (t, color) => {
      titleEl.textContent = t;
      if (color) titleEl.style.color = color;
      if (!api._expanded) resizePill(api);
    };

    api.setIcon = (html, animate) => {
      icon.innerHTML = html;
      if (animate) {
        icon.classList.remove("pop");
        void icon.offsetWidth;
        icon.classList.add("pop");
      }
      if (!api._expanded) resizePill(api);
    };

    api.setBody = (html) => {
      bodyContent.innerHTML = html;
    };

    api.replaceBtn = (label, bgc, color) => {
      if (btnEl) {
        btnEl.textContent = label;
        if (bgc) btnEl.style.background = bgc;
        if (color) btnEl.style.color = color;
        btnEl.style.pointerEvents = "none";
      }
    };

    return api;
  }

  function expand(api) {
    if (api._dead) return;
    const { el, bg, bodyWrap } = api;
    const contentW = el.querySelector(".toast-content").offsetWidth;
    const bodyH = cloneAndMeasure(bodyWrap, contentW);
    const totalH = 48 + bodyH;

    bg.style.width = contentW + "px";
    bg.style.height = totalH + "px";
    bg.style.borderRadius = "24px";

    bodyWrap.style.height = bodyH + "px";
    el.classList.remove("collapsing");
    el.classList.add("expanded");
    api._expanded = true;

    setTimeout(() => {
      bodyWrap.style.height = "auto";
    }, 600);
  }

  function collapse(api) {
    if (api._dead) return;
    const { el, bg, bodyWrap, header } = api;
    const FADE_MS = api._collapseDelay;

    const curH = bodyWrap.offsetHeight;
    bodyWrap.style.height = curH + "px";
    el.classList.remove("expanded");
    el.classList.add("collapsing");
    api._expanded = false;

    setTimeout(() => {
      bodyWrap.style.height = "0";

      requestAnimationFrame(() => {
        const w = header.offsetWidth;
        bg.style.width = w + "px";
        bg.style.height = "48px";
        bg.style.borderRadius = "50px";
      });

      setTimeout(() => {
        el.classList.remove("collapsing");
      }, 550);
    }, FADE_MS);
  }

  function dismiss(api) {
    if (api._dead) return;
    api._dead = true;

    if (api._cleanupSwipe) api._cleanupSwipe();

    const wrapper = api.wrapper;
    const wrapperHeight = wrapper.offsetHeight;
    wrapper.style.maxHeight = wrapperHeight + "px";
    wrapper.style.overflow = "clip";

    api.el.classList.remove("show");
    api.el.classList.add("exit");

    requestAnimationFrame(() => {
      wrapper.style.transition =
        "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      wrapper.style.maxHeight = "0px";
    });

    setTimeout(() => wrapper.remove(), 500);
  }

  return { create, expand, collapse, dismiss, ICONS, COLORS };
})();