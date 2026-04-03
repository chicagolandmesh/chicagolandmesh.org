export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

export function setWebGLWarning() {
  const warning = document.createElement("div");
  warning.id = "webgl-warning";
  warning.innerHTML = `<p>Enable <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API#browser_compatibility">WebGL</a> to use map</p>`
  warning.style.color = "red";
  warning.style.fontWeight = "bold";
  warning.style.margin = "20px";
  warning.style.textAlign = "center";
  document.getElementById("map").appendChild(warning);
}

export const ConvertLatToDMS = (d) => ConvertDDToDMS(d, false)
export const ConvertLngToDMS = (d) => ConvertDDToDMS(d, true)

function ConvertDDToDMS(D, l) {
  const direction = D < 0 ? (l ? "W" : "S") : l ? "E" : "N";
  const degree = 0 | (D < 0 ? (D = -D) : D);
  const minutes = 0 | (((D += 1e-9) % 1) * 60);
  const seconds = 0 | (((D * 60) % 1) * 60);
  return `${degree}°${minutes}′${seconds}″${direction}`;
}

export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
}

export function getFlyToOptions() {
  return {
    zoom: 13,
    padding: isMobile() ? { bottom: 200 } : {}
  };
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getHTTPStatusText(code) {
  const statusMessages = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Moved Temporarily",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    419: "Insufficient Space on Resource",
    420: "Method Failure",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    507: "Insufficient Storage",
    511: "Network Authentication Required",
  };
  return statusMessages[code] || "Unknown";
}
