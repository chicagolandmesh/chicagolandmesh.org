---
title: Configuring Meshtastic
tags:
  - Info
  - Getting Started
  - Meshtastic
---

## Initial Setup

1. **Power on your device.**
   Each custom Meshtastic device has its own button combinations. Check your device's documentation for the correct procedure.

2. **Connect to your device** using one of the following methods:
   - **Bluetooth**: Enable Bluetooth on your phone or computer if it is not already enabled.
   - **Wi-Fi**: Available if your node includes a Wi-Fi capable chip.
   - **USB Serial**: Connect your device with USB and use [https://client.meshtastic.org/](https://client.meshtastic.org/).

!!! warning
    WebSerial is supported in Chromium-based browsers and Firefox. Safari does not currently support WebSerial.

---

## Settings Configuration

Once connected, you can configure your node through either the Meshtastic mobile app or the web client.

To access the web interface over Wi-Fi, navigate to the IP address displayed in the Meshtastic app or use `http://meshtastic.local`.

Set up the following basic information:

- **Device name**: Choose a name for your node.
- **Region**: Select the correct region. Use **United States** for 915 MHz operation.
- **Other preferences**: Configure GPS, screen brightness, power settings, and other options based on your device and how you plan to use it.

See also: [Recommended Settings](#other-recommended-settings)

### Device Role

- **`Client`**: Recommended for most nodes. This provides access to all normal Meshtastic features and is the best choice for most users.
- **`Client_Mute`**: A good choice for additional nodes, especially when you have several nodes close together in the same home, apartment, vehicle, or other area with strong mesh coverage. These nodes can still send and receive messages but do not rebroadcast traffic for other nodes. This helps reduce unnecessary duplicate transmissions in dense parts of the mesh.
- **`Router_Late`**: A reasonable option for well-positioned fixed nodes that you want to help relay traffic. It waits before rebroadcasting, giving normal client nodes an opportunity to handle the packet first and helping reduce collisions on busy networks.
- **`Router` / `Repeater`**: Avoid these roles for normal installations. They can create unnecessary traffic and make troubleshooting much more difficult on a dense mesh like Chicagoland. If you believe your location would benefit from a dedicated relay, use `Router_Late` instead.
- **Other roles** are available for nodes designed for specialized purposes beyond normal messaging.

For more information about device roles and when to use them, see the [Meshtastic blog post on device roles](https://meshtastic.org/blog/choosing-the-right-device-role/) and [Meshtastic's role reference table](https://meshtastic.org/docs/configuration/radio/device/#roles).

---

## Modem Settings

Chicagoland Mesh uses both **Long Fast** and **Long Turbo** modem presets. It is important to know that these presets do not work with each other. You must be using the same preset as someone else to be able to communicate with them.

!!! note
    **Long Fast was the default Meshtastic modem preset until version 2.8.0 made LongTurbo the new preset.** Chicagoland Mesh recommends using **Long Fast** for new and existing nodes. Long Turbo continues to be supported for users who prefer to use it.

### Long Fast

Long Fast is the recommended preset for new and existing nodes.

Use the following settings:

- **Modem Preset**: `Long Fast`
- **Frequency Slot**: `20`
- **Frequency**: `906.875 MHz`
- **LoRa Region**: `US`
- **Max Transmit Power**: `30 dBm`
- **Radio Transmit**: `Enabled`

### Long Turbo

Long Turbo can still be used by node owners who prefer to use it.

Use the following settings:

- **Modem Preset**: `Long Turbo`
- **Frequency Slot**: `14`
- **Frequency**: `908.75 MHz`
- **LoRa Region**: `US`
- **Max Transmit Power**: `30 dBm`
- **Radio Transmit**: `Enabled`

!!! tip "Choosing a Modem Preset"
    Use **Long Fast** for new setups and consider switching existing Long Turbo nodes to Long Fast if you want to. Long Fast operates at **906.875 MHz**, while Long Turbo operates at **908.75 MHz** with the settings used by Chicagoland Mesh.

---

## Other Recommended Settings

| Setting | Value |
|---|---|
| Broadcast Node Info Interval | `10800` seconds (3 hours) |
| GPS: Mobile Nodes | `Enabled` |
| GPS: Fixed Nodes | `Fixed Location` |
| Power Saving: Non-Solar Nodes | `Disabled` |
| Power Saving: Solar Nodes | `Enabled` |
| LoRa Region | `US` |
| Hop Count | `7` |
| Frequency Slot | `20` |
| Waveform Settings | `Long Fast` or `Long Turbo` |
| Radio Transmit | `Enabled` |
| Max Transmit Power | `30 dBm` |
| Override Duty Cycle | `Enabled` |
| Boosted RX Gain | `Enabled` |
| Store and Forward: Mobile Nodes | `Disabled` |
| Store and Forward: Router/Fixed Nodes | `Enabled` |
| Heartbeat | `Enabled` |
| Number of Records | `100` |
| History Return Max | `100` |
| History Return Window | `7200` seconds (2 hours) |
| Update Interval | `900` seconds (15 minutes) |

!!! tip "Node Naming"
    Consider adding `ChicagolandMesh.org` or `ChiMesh.org` to your node name to help grow our community. For example: `NODENAME ChiMesh.org`.

---

## Next Steps

- See [Local Encrypted Channel](../local-channel.md) to join the Chicago encrypted channel.
- See [Setup MQTT](../mqtt.md) to connect your node to our analyzers.
- See [Mistakes to Avoid](avoid-mistakes.md) for common configuration pitfalls.
