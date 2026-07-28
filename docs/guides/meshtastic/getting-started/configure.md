---
title: Configuring Meshtastic
tags:
  - Info
  - Getting Started
  - Meshtastic
---

## Initial Setup

1. **Power on your device.**
   Each custom Meshtastic device has its own button combinations. Check your respective device's documentation.

2. **Set up communication with your device** using one of the following methods:
   - **Bluetooth**: Enable Bluetooth on your phone or computer if not already enabled.
   - **Wi-Fi**: Available if your node includes a Wi-Fi chip.
   - **USB Serial**: Use [https://client.meshtastic.org/](https://client.meshtastic.org/).

!!! warning
    WebSerial is not supported in Firefox or Safari.

---

## Settings Configuration

Once connected, you will have access to settings through either the mobile app or the web client.

To access the web interface, navigate to the IP address displayed in the Meshtastic app, or use `http://meshtastic.local`.

Set up the following basic information:

- **Device name**: Set a name for your node.
- **Region**: Choose the correct region (select **United States** for 915 MHz).
- **Other preferences**: GPS settings, screen brightness, etc.

See also: [Recommended Settings](#other-recommended-settings)

### Device Role

- **`Client`**: Recommended for most nodes. This is the default role and provides access to all features.
- **`Client_Mute`**: A good choice for additional nodes, especially those in close proximity (e.g., a single home or apartment) or areas with high mesh coverage. These nodes can still send and receive messages but do not participate in routing other nodes' messages. They do not contribute to the mesh, but they also do not add to the network burden caused by multiple nearby nodes rebroadcasting a single message simultaneously.
- **`Router_Late`**: A reasonable choice if you want your node to help relay messages without significantly impacting network performance. It holds back briefly before rebroadcasting, reducing collisions in dense areas.
- **`Router` / `Repeater`**: Avoid these roles. They cause the most troubleshooting headaches and can noticeably degrade performance in dense meshes like Chicago's. If you think you need one of these, use `Router_Late` instead.
- **Other roles** exist for nodes that serve a purpose other than messaging.

For detailed information on all roles and their usage, see the [Meshtastic blog post on device roles](https://meshtastic.org/blog/choosing-the-right-device-role/) and [Meshtastic's role reference table](https://meshtastic.org/docs/configuration/radio/device/#roles).

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
| Hop Count: City of Chicago | `4` |
| Hop Count: Suburbs | `7` |
| Frequency Slot | `20` |
| Waveform Settings | `LongFast` |
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

!!! tip "Waveform / Modem Preset"
    **LongFast is strongly encouraged** and is what the majority of the Chicagoland network runs on. We also have community tools that support **MediumFast** if you have a specific use case for it, but **LongFast** should be your default.

!!! tip "Node Naming"
    Consider adding `ChicagolandMesh.org` or `ChiMesh.org` to your node name to help grow our community: for example: `NODENAME ChiMesh.org`.

---

## Next Steps

- See [Local Encrypted Channel](../local-channel.md) to join the Chicago encrypted channel
- See [Setup MQTT](../mqtt.md) to connect your node to our analzyers
- See [Mistakes to Avoid](avoid-mistakes.md) for common configuration pitfalls
