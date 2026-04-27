const fs = require("fs/promises");
const path = require("path");

// text splitter
const graphemeSegmenter =
  typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function splitGraphemes(input) {
  if (!input) return [];
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(input), (part) => part.segment);
  }
  return Array.from(input);
}

function firstGrapheme(input) {
  const parts = splitGraphemes(input);
  return parts.length > 0 ? parts[0] : "";
}

// emoji
const EMOJI_SEGMENT_REGEX = /(?:[#*0-9]\uFE0F?\u20E3|[\p{Extended_Pictographic}\u00A9\u00AE\u203C\u2049\u2122\u2139]|\u2764\uFE0F?(?:\u200D[\p{Extended_Pictographic}])?|[\u{1F1E6}-\u{1F1FF}]{2})/u;

function findFirstEmoji(input) {
  for (const segment of splitGraphemes(input)) {
    if (EMOJI_SEGMENT_REGEX.test(segment)) {
      return segment;
    }
  }
  return null;
}

// FIX: Removes `fe0f` from the code point if failes to get emoji because that
// causes errors with getting the `🏘️` emoji. Potentially this emoji library is
// incorrect because https://emojipedia.org/houses#technical shows it has fe0f
// code point.
async function readTwemojiSvg(emojiCodePoint) {
  const svgDirectory = path.join(__dirname, "node_modules", "@discordapp", "twemoji", "dist", "svg");
  const candiatePaths = [
    path.join(svgDirectory, `${emojiCodePoint}.svg`),
    path.join(svgDirectory, `${emojiCodePoint.replace(/-fe0f/g, "")}.svg`),
  ];

  for (const candiatePath of candiatePaths) {
    try {
      return await fs.readFile(candiatePath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  const error = new Error(`Unable to find Twemoji SVG for codepoint ${emojiCodePoint}`);
  error.code = "ENOENT";
  throw error;
}

// hash function
function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// background color
function colorFromName(name) {
  const hue = fnv1a32(name) % 360;
  return `hsl(${hue} 60% 50%)`;
}

// label text
function labelFromName(name) {
  if (name.length === 0) {
    return null;
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const emoji = findFirstEmoji(name);
  if (emoji) {
    return emoji;
  }

  const parts = trimmed.split(" ");
  if (parts.length > 1) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first.length !== 0 && last.length !== 0) {
      return firstGrapheme(first) + firstGrapheme(last);
    }
  }

  return firstGrapheme(name);
}

module.exports = {
  labelFromName,
  colorFromName,
  readTwemojiSvg,
};
