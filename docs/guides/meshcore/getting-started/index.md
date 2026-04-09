---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Getting Started with MeshCore

## Hardware Requirements

- **MeshCore-compatible device**: Check the [MeshCore documentation](https://docs.meshcore.io/faq/#121-hardware) and [MeshCore.io](https://meshcore.io/#hardware) for supported hardware
- **Antenna**: A suitable antenna for your frequency band (915MHz for US operations)
- **USB cable**: For device programming and power
- **Power solution**: Battery pack, solar panel, or wall adapter depending on your deployment

!!! warning "Antenna Safety"

    Never power on your device without an antenna connected. This can permanently damage the radio hardware.

## Hardware Setup

1. Connect your antenna to the device **BEFORE** powering on
2. Connect your device via USB to your computer
3. Ensure you have a stable power source for your intended deployment

## Software Installation and Device Role Selection

1. Visit the [Meshcore Web Flasher](https://flasher.meshcore.io) in your web browser
2. Connect your device via USB to your computer
3. Choose your device role by selecting the appropriate firmware type:
    - **Companion Firmware** (BLE or USB): Recommended for your first node. Provides full messaging capabilities and connects to mobile apps
    - **Room Server Firmware**: Good choice if you have multiple nodes in the same location. Handles local message routing
    - **Repeater Firmware**: Only use if your node has excellent line-of-sight to many other nodes. Helps extend network coverage
    
4. Follow the flasher instructions to:
    - Select your specific device model
    - Choose the firmware type that matches your intended role
    - Flash the firmware directly through your browser

!!! tip "Role Selection"

    Start with **Companion** firmware for your first node. You can always reflash with different firmware later as you learn more about your local mesh network.

!!! tip "Next Steps"

    View the [Configuring Meshtastic](configure.md) page to configure your node.

## Using MeshCore Client Apps

After setting up your Meshcore device with Companion firmware, you'll need a client app to send and receive messages. Meshcore offers several client options depending on your device and preferences.

### Mobile Apps

#### Android

- Download from [Google Play Store](https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android)
- Or download the [APK file directly](https://files.liamcottle.net/MeshCore/)

#### iOS

- Download from the [Apple App Store](https://apps.apple.com/us/app/meshcore/id6742354151)

### Web Clients

- Visit [https://app.meshcore.nz/](https://app.meshcore.nz/) for the official web client
- Visit [https://meshcore.liamcottle.net/](https://meshcore.liamcottle.net/) for the community ran web client

### Connecting Your Client

1. **For BLE Companion firmware**: Use Bluetooth pairing with mobile apps
2. **For USB Companion firmware**: Use web clients with USB serial connection
3. **Default Bluetooth pairing code**: `123456` (if prompted)

### Basic Usage

Once connected to your client app:

- **Send messages**: Type and send text messages to other Meshcore users
- **View contacts**: See discovered nodes and their last seen times  
- **Join channels**: Connect to public channels for group communications
- **Manage settings**: Configure your node remotely through the app
- **View diagnostics**: Monitor signal strength, battery, and network status

!!! tip "First Time Setup"

    When you first connect your client app to your Companion device, take some time to explore the interface and send test messages to verify everything is working correctly.

## Getting Help

If you need assistance with the Meshcore:

1. **Community Resources**: Check our [community resources](../../../resources/index.md) and [Discord](https://chicagolandmesh.org/discord) channels
2. **Documentation**: Review the [MeshCore project documentation](https://docs.meshcore.io/)

## Legal and Safety Considerations

- **FCC Compliance**: Ensure your operations comply with FCC Part 15 regulations
- **Power Limits**: Stay within legal power limits for unlicensed operation
- **Antenna Safety**: Use appropriate antenna installations and maintain safe RF exposure levels

## Next Steps

Once you have your Meshcore device connected:

- Check out [Configure](configure.md) page
- Check out [Mistakes to Avoid](avoid-mistakes.md) page
