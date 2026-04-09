let bannerTimeoutId;
let bannerLock = false;

export function addBanner(header, text, options) {
  const { duration, color, close, customCloseHandler, lock } = options || {};

  if (bannerLock) {
    return;
  }
  if (lock) {
    bannerLock = true;
  }

  if (bannerTimeoutId) {
    clearTimeout(bannerTimeoutId);
    bannerTimeoutId = null;
  }

  const oldBanner = document.getElementById("helper-banner");
  if (oldBanner) oldBanner.remove();

  const parent = document.querySelector(".maplibregl-control-container");
  const banner = document.createElement("div");
  banner.id = "helper-banner";
  banner.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
  parent.appendChild(banner);

  banner.style.backgroundColor = color || "";
  banner.style.boxShadow = color && `0 0 0 2px ${color}59`;

  const headerEl = document.createElement('p');
  const headerBoldEl = document.createElement('b');
  headerBoldEl.textContent = header;
  headerEl.appendChild(headerBoldEl);

  const textEl = document.createElement('p');
  textEl.textContent = text;

  banner.appendChild(headerEl);
  banner.appendChild(textEl);

  if (close) {
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.ariaLabel = "Close banner";
    closeButton.innerText = "×";
    closeButton.addEventListener("click", () => {
      removeBanner();
      if (customCloseHandler) customCloseHandler();
    });
    banner.prepend(closeButton);
  }

  requestAnimationFrame(() => {
    banner.style.opacity = 0.9;
  });

  if (duration) {
    const fillBar = document.createElement("div");
    fillBar.classList.add("fill");
    banner.prepend(fillBar);

    let start = Date.now();
    let remaining = duration;
    let dontRun = false;

    bannerTimeoutId = setTimeout(() => {
      removeBanner();
    }, remaining);

    fillBar.style.animation = `fill ${remaining / 1000}s linear forwards`;
    // TEMP:
    if (banner.style.backgroundColor == "rgb(229, 78, 51)") {
      fillBar.style.backgroundColor = "#0000001f";
    }

    function onMouseEnter() {
      if (dontRun) return;
      clearTimeout(bannerTimeoutId);
      bannerTimeoutId = null;

      remaining -= Date.now() - start;

      fillBar.style.animation = "";
    }

    function onMouseLeave() {
      if (dontRun) return;
      start = Date.now();
      if (remaining < 3000) remaining = 3000;
      bannerTimeoutId = setTimeout(removeBanner, remaining);

      fillBar.style.animation = `fill ${remaining / 1000}s linear forwards`;
    }

    function onClick() {
      if (dontRun) return;
      clearTimeout(bannerTimeoutId);
      bannerTimeoutId = null;
      dontRun = true;
    }

    banner.addEventListener("mouseenter", onMouseEnter);
    banner.addEventListener("mouseleave", onMouseLeave);
    banner.addEventListener("click", onClick);
  }

  document.dispatchEvent(new CustomEvent("banneropen", {
    detail: { control: banner },
    bubbles: true,
    composed: true,
  }));
}

export async function removeBanner() {
  return new Promise((resolve) => {
    bannerLock = false;

    if (bannerTimeoutId) {
      clearTimeout(bannerTimeoutId);
      bannerTimeoutId = null;
    }

    const banner = document.getElementById("helper-banner");
    if (!banner) {
      resolve();
      return;
    }

    const cleanup = () => {
      banner.remove();
      bannerRemovalId = null;
      document.dispatchEvent(new CustomEvent("bannerclose", {
        detail: { control: banner },
        bubbles: true,
        composed: true,
      }));
      resolve();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cleanup();
      return;
    }

    banner.addEventListener("transitionend", cleanup, { once: true });
    banner.style.opacity = 0;
  });
}
