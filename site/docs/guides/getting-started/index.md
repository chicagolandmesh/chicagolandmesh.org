---
title: Getting Started with Meshtastic
tags:
  - Info
  - Getting Started
---

# Getting Started with Meshtastic (915MHz, US)

Meshtastic is a mesh networking project that utilizes affordable, long-range, and low-power radio hardware to create ad-hoc mesh networks. This guide will help you set up Meshtastic on the 915MHz frequency band in the United States.

## Hardware Requirements

To get started, you'll need the following:

- **[Meshtastic-compatible device](https://meshtastic.org/docs/hardware/devices/)**: This could include devices like TTGO T-Beam, Heltec LoRa series, and other compatible ESP32 boards with LoRa radios.

<figure markdown="span">
  ![Example Nodes](../../assets/images/hamspiced-nodes.png)
  <figcaption><a href="https://github.com/Hamspiced">Image credit</a></figcaption>
</figure>

- **Antenna**: A suitable antenna tuned for 915MHz. They come in many shapes and sizes. For more specific information on antennas visit the [antenna reports](https://github.com/meshtastic/antenna-reports) page.
- **USB cable**: For powering and programming your device.

!!! warning "Important Note"

    Never power on your Meshtastic device without an antenna connected. This could permanently damage the radio.
    Make sure to look into the [mistakes to avoid](../getting-started/avoid-mistakes) page to avoid common pitfalls.

## Software Setup and Flashing the Firmware

1. Visit the [Meshtastic Web Flasher](https://flasher.meshtastic.org) in your web browser.
2. Follow the instructions on the page to select and flash the latest firmware for your specific device.

!!! tip "Next Steps"

    View the [Configuring Meshtastic](/guides/getting-started/configure) page to configure your node.

## Legal Considerations

- Meshtastic operates in the 915MHz ISM band under FCC regulations in the United States.
- Meshtastic does not require a HAM radio license to operate, but obtaining one is optional and may provide additional privileges and knowledge of radio regulations.
- All communications on Meshtastic are encrypted, ensuring privacy and security of messages within the mesh network.