let bannerTimeoutId;
let bannerLock = false;

export function addBanner(header, text, options) {
  const {
    duration,     // duration in ms to show banner (default: infinite)
    color,        // color of background in hex
    close,        // show close button
    closeHandler, // callback to run on close
    lock,         // prevent another non-stacking banner from overriding until removed
    html,         // render html instead of text
    stack,        // stack banners below main banner
  } = options || {};

  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw Error("Invalid hex color");
  }
  if (bannerLock && !stack) {
    return;
  }
  if (lock && !stack) {
    bannerLock = true;
  }
  if (bannerTimeoutId) {
    clearTimeout(bannerTimeoutId);
    bannerTimeoutId = null;
  }

  const oldBanner = document.querySelector("#helper-banner:not(.stack)");
  if (oldBanner && !stack) oldBanner.remove();

  const parent = document.querySelector(".maplibregl-control-container");
  const banner = document.createElement("div");
  banner.id = "helper-banner";
  banner.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
  banner.style.backgroundColor = color ? color + "e6" : "";
  banner.style.boxShadow = color && `0 0 0 2px ${color}59`;
  if (stack) {
    banner.classList.add("stack");
    parent.appendChild(banner);
  } else {
    parent.prepend(banner);
  }

  const headerEl = document.createElement("p");
  headerEl.classList.add("helper-header");
  const headerBoldEl = document.createElement("b");
  headerBoldEl.textContent = header;
  headerEl.appendChild(headerBoldEl);

  const textEl = document.createElement("p");
  textEl.classList.add("helper-message");
  if (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    textEl.replaceChildren(...doc.body.childNodes);
  } else {
    textEl.textContent = text;
  }

  banner.appendChild(headerEl);
  banner.appendChild(textEl);

  if (close) {
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.ariaLabel = "Close banner";
    closeButton.innerText = "×";
    closeButton.addEventListener("click", () => {
      removeBanner(banner);
      if (closeHandler) closeHandler();
    });
    banner.prepend(closeButton);
  }

  if (duration) {
    let start = Date.now();
    let remaining = duration;

    const fillBar = document.createElement("div");
    fillBar.classList.add("fill");
    fillBar.style.backgroundColor = color;
    fillBar.style.animation = `fill ${remaining / 1000}s linear forwards`;
    banner.prepend(fillBar);

    let timeoutId = setTimeout(() => removeBanner(banner), remaining);
    if (!stack) bannerTimeoutId = timeoutId;

    function onMouseEnter() {
      clearTimeout(timeoutId);
      if (!stack) bannerTimeoutId = null;

      remaining -= Date.now() - start;
      const minRemaining = duration < 3000 ? duration : 3000;
      if (remaining < minRemaining) remaining = minRemaining;

      fillBar.style.animation = "";
    }

    function onMouseLeave() {
      start = Date.now();

      timeoutId = setTimeout(() => removeBanner(banner), remaining);
      if (!stack) bannerTimeoutId = timeoutId;

      fillBar.style.animation = `fill ${remaining / 1000}s linear forwards`;
    }

    function onClick() {
      clearTimeout(timeoutId);
      if (!stack) bannerTimeoutId = null;

      banner.removeEventListener("mouseenter", onMouseEnter);
      banner.removeEventListener("mouseleave", onMouseLeave);
      banner.removeEventListener("click", onClick);
    }

    banner.addEventListener("mouseenter", onMouseEnter);
    banner.addEventListener("mouseleave", onMouseLeave);
    banner.addEventListener("click", onClick);
  }

  requestAnimationFrame(() => {
    banner.style.opacity = 0.9;
  });

  document.dispatchEvent(new CustomEvent("banneropen", {
    detail: { control: banner },
    bubbles: true,
    composed: true,
  }));

  return banner;
}

export async function removeBanner(banner) {
  return new Promise((resolve) => {
    bannerLock = false;

    if (bannerTimeoutId) {
      clearTimeout(bannerTimeoutId);
      bannerTimeoutId = null;
    }

    if (!banner) {
      banner = document.querySelector("#helper-banner:not(.stack)");
    }
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
