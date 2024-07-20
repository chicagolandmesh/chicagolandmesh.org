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

#### Device Role is an important step for configuring Meshtastic.  Please refer to [Meshtastic.org](https://meshtastic.org/docs/configuration/radio/device/) for help choosing the correct role for your node.  
- For fixed or solar nodes in strategic places, we recommend Router mode which will be visible to other nodes.  Repeater mode can also be used which will utilize minimal overhead but not be visible to other nodes.
- For mobile nodes or fixed nodes mounted in non strategic places like an attic, we recommend Client mode.  This will allow all the general features to be used.
- Other roles from the linked Meshtastic document can be used at your discretion.

### Other Recommended Settings
- If you want, add ChicagolandMesh.org or ChiMesh.org to your node name, For example: (NODENAME) ChiMesh.org, to help grow our community.
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
    - Mobile Nodes: Disabled
    - Router and Fixed Nodes: Enabled
- Heartbeat: Enabled
- Number of Records: 100
- History Return Max: 100
- History Return Window: 7200 seconds (2 hours)
- Update Interval: 900 seconds (15 minutes)
