---
title: Configuring Meshtastic
tags:
  - Info
  - Getting Started
---

### Initial Setup
   - Power on your device.
      - Each custom Meshtastic device has their own button combinations. Check out your respective device's documentation.
   - Setup communication with device.
      - Enable Bluetooth on your device (if not already enabled).
      - Or choose to use Wi-Fi if your node has a Wi-Fi chip.
      - USB serial is also another option using `https://client.meshtastic.org/`.

### Settings Configuration
   - Once connected either you will have access to the settings either through the mobile app or the web client.
   - Navigate to the IP address displayed on the Meshtastic app or use `http://meshtastic.local` for accessing the web interface.
   - Setup basic information:
     - Set your device name.
     - Choose the correct region (in this case, choose United States for 915MHz).
     - Set other preferences such as GPS settings, screen brightness, etc.
     - View our [recommended settings](#other-recommended-settings).

### Networking Configuration
More details can be found at [Meshtastic.org](https://meshtastic.org/docs/configuration/radio/device/).

#### Router Client Mode (Recommended for Fixed Nodes)
   - Router Client mode allows the node to act as both a router and a client, helping to extend the mesh network’s reach.
   - Set up Router Client mode on fixed nodes that are strategically placed to extend network coverage, such as those placed in attics or outdoors with larger antennas.

#### Client Mode (Recommended for Mobile Nodes)
   - Client mode is suitable for mobile nodes like handheld devices that move within the mesh network.
   - Mobile nodes typically only need to be set up as clients to connect to nearby nodes and relay messages.

### Other Recommended Settings
- If you want, add ChicagolandMesh.org to your node name, For example: (NODENAME) ChicagolandMesh.org, to help grow our community.
- Broadcast Node Info Interval: 10800 seconds (3 hours)
- GPS for Mobile Nodes: Enabled
- GPS for Fixed Nodes: Fixed Location
- Power Saving Mode:
    - Non-Solar Nodes: Disabled
    - Solar Nodes: Enabled
- Lora Region: US
- Hop Count: 7
- Frequency Slot: 20
- Waveform Settings: LongFast
- Radio Transmit: Enabled
- Max Transmit Power: 30dBm
- Override Duty Cycle: Enabled
- Boosted RX Gain: Enabled
- Store and Forward:
    - Mobile/Client Nodes: Disabled
    - Router and Fixed Nodes: Enabled
- Heartbeat: Enabled
- Number of Records: 100
- History Return Max: 100
- History Return Window: 7200 seconds (2 hours)
- Update Interval: 900 seconds (15 minutes)
