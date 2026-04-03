---
title: Guides
hide: 
  - navigation
  - toc
tags:
  - Info
  - Getting Started
---

<style>
  /* force 2x2 grid */
  .grid.cards {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  }
  /* force builds icon size to be slightly larger and aligned properly */
  .handheld {
    --md-icon-size: 1.8em !important;
    vertical-align: bottom !important;
  }
</style>

<div class="grid cards" markdown>

-   :material-checkbox-multiple-marked-outline:{ .lg .middle } __Getting Started__

    ---

    Configure your node for the best possible optimizations.

    [:fontawesome-solid-angle-right: Customize](getting-started/index.md)

-   :material-radar:{ .lg .middle } __Local MQTT Setup__

    ---

    Properly setup MQTT on your node. Make sure to disable
    downlink!

    [:fontawesome-solid-angle-right: Learn how](mqtt.md)

-   :material-lock:{ .lg .middle } __Local Encrypted Channel Setup__

    ---

    Learn how to join our local and secure mesh network!

    [:fontawesome-solid-angle-right: Setup now](local-channel.md)

-   :material-radio-handheld:{ .lg .handheld } __Builds__

    ---

    Check out our community maintained build guides!

    [:fontawesome-solid-angle-right: Check out](builds/index.md)

</div>
