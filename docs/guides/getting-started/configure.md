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
      - Or use Wi-Fi if your node has a Wi-Fi chip.
      - USB serial using `https://client.meshtastic.org/` is another option. Please note that WebSerial is not supported in Firefox or Safari.

### Settings Configuration
   - Once connected either you will have access to the settings either through the mobile app or the web client.
   - For accessing the web interface, navigate to the IP address displayed on the Meshtastic app or use `http://meshtastic.local` 
   - Setup basic information:
     - Set your device name.
     - Choose the correct region (in this case, choose United States for 915MHz).
     - Set other preferences such as GPS settings, screen brightness, etc.
     - View our [recommended settings](#other-recommended-settings).

#### Device Role is an important step for configuring Meshtastic.
- For most nodes, we recommend `Client` role.  This is the "default" role and provides access to all features.
- `Client_Mute` is a good choice for additional nodes, especially those in close proximity (e.g. a single home or apartment) or areas with high mesh coverage. These nodes can still send and receive messages but do not participate in routing other nodes' messages. They do not contribute to the mesh, but also do not contribute to the network burden that comes with multiple nodes in a very small area rebroadcasting a single message all at once.
- **`Router` or `Repeater` roles should only be used for devices that are exceptionally well located with excellent line of sight.** Too many routers/repeaters can actually degrade mesh network performance, especially in dense meshes like within Chicago.
- Other roles exist for nodes that serve a purpose other than messaging.
  -  Detailed information on all roles and their usage is available in [this Meshtastic blog post](https://meshtastic.org/blog/choosing-the-right-device-role/) and [Meshtastic's table on roles](https://meshtastic.org/docs/configuration/radio/device/#roles)


### Other Recommended Settings
- If you want, add ChicagolandMesh.org or ChiMesh.org to your node name, For example: (NODENAME) ChiMesh.org, to help grow our community.
- Broadcast Node Info Interval: `10800 seconds` (3 hours)
- GPS for Mobile Nodes: `Enabled`
- GPS for Fixed Nodes: `Fixed Location`
- Power Saving Mode:
    - Non-Solar Nodes: `Disabled`
    - Solar Nodes: `Enabled`
- Lora Region: `US`
- Hop Count: `4` (City of Chicago) `7` (Suburbs)
- Frequency Slot: `20`
- Waveform Settings: `LongFast`
- Radio Transmit: `Enabled`
- Max Transmit Power: `30dBm`
- Override Duty Cycle: `Enabled`
- Boosted RX Gain: `Enabled`
- Store and Forward:
    - Mobile Nodes: `Disabled`
    - Router and Fixed Nodes: `Enabled`
- Heartbeat: `Enabled`
- Number of Records: `100`
- History Return Max: `100`
- History Return Window: `7200 seconds` (2 hours)
- Update Interval: `900 seconds` (15 minutes)
