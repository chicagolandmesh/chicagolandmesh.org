---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Configuring MeshCore

## Initial Configuration

1. Power on your device after flashing
2. Visit the [Meshcore Configuration Tool](https://config.meshcore.io) in your web browser
3. Connect to your device using one of the available methods:
    - USB serial connection (recommended for initial setup)
    - Bluetooth pairing (if using BLE companion firmware)
4. Configure basic settings through the web interface:
    - Set your node name (consider adding "ChiMesh.org" to help identify our community)
    - Location (optional)
    - Change the admin password
    - Go to "Radio Settings" and set "Preset" to "USA/Canada (Recommended)"

## Network Settings

Configure your device for the using the **"USA/Canada (Recommended)"** preset, which includes the following settings:

- **Frequency**: `910.525 MHz`
- **Bandwidth**: `62.5 kHz`
- **Spreading Factor**: `7`
- **Coding Rate**: `5`
- **TX Power**: `22 dBm`
- **Airtime Factor**: `1`

!!! info "Preset Selection"

    When configuring your Meshcore device, look for the `USA/Canada` preset in your configuration interface. This preset automatically applies all the correct radio parameters for optimal performance in North America.

!!! tip "Community Identification"

    Consider adding `ChiMesh.org` or `ChicagolandMesh.org` to your node name to help identify fellow community members.
