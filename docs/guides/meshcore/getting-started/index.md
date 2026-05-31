---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Getting Started with MeshCore

## Hardware Requirements

- **MeshCore compatible device**: Check the [RF Index website](https://www.rfindex.com/mesh/devices?firmware=MeshCore), [MeshCore.io](https://meshcore.io/#hardware), and [MeshCore Flasher](https://flasher.meshcore.io/) for up-to-date lists of supported hardware
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

1. Visit the [MeshCore Web Flasher](https://flasher.meshcore.io) in your web browser
2. Connect your device via USB to your computer
3. Choose your device role by selecting the appropriate firmware type:
    - **Companion** (BLE or USB): Recommended for your first node. Provides full messaging capabilities and connects to mobile apps
    - **Repeater**: Dedicated infrastructure node used only if your node has excellent line of sight to many other nodes. Helps extend network coverage
    - **Room Server**: Special type of node that storages messages to be later forwarded to nodes that missed them

    !!! warning
        The room server role is not recommended for most deployments. Only use it if your node is placed in a difficult indoor location inside a large building where repeater mode is not suitable. If you are unsure which role is right for your setup, ask in the [Discord](https://chimesh.org/discord) before proceeding.

4. Follow the flasher instructions to:
    - Select your specific device model
    - Choose the firmware type that matches your intended role
    - Flash the firmware directly through your browser

!!! info "Setting Up an MQTT Observer Node?"
    MQTT helps forward node traffic to the internet. This helps us visualize the network through our [analyzers](../../../corescope/index.md). If you plan to configure your node as an MQTT observer, read the [Setup MQTT](../mqtt.md) guide.

!!! tip "Next Steps"
    View the [Configuring MeshCore](configure.md) page to configure your node.

## Using MeshCore Client Apps

After setting up your MeshCore device with Companion firmware, you'll need a client app to send and receive messages. MeshCore offers several client options depending on your device and preferences.

#### Android

- Download from [Google Play Store](https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android)
- Or download the [APK file directly](https://files.liamcottle.net/MeshCore/)

#### iOS

- Download from the [Apple App Store](https://apps.apple.com/us/app/meshcore/id6742354151)

#### Web

- Visit [https://app.meshcore.nz/](https://app.meshcore.nz/) for the official web client
- Visit [https://meshcore.liamcottle.net/](https://meshcore.liamcottle.net/) for the community ran web client

### Connecting Your Client

1. **For BLE Companion firmware**: Use Bluetooth pairing with mobile apps
2. **For USB Companion firmware**: Use web clients with USB serial connection
3. **Default Bluetooth pairing code**: For devices **without a display**, the default pairing code is `123456`. For devices **with a display**, a random PIN is shown on the screen at pairing time. See [Mistakes to Avoid](avoid-mistakes.md) for a note on why flashing the correct display/no-display firmware build matters here.

### Basic Usage

Once connected to your client app:

- **Send messages**: Type and send text messages to other MeshCore users
- **View contacts**: See discovered nodes and their last seen times  
- **Join channels**: Connect to public channels for group communications
- **Manage settings**: Configure your node remotely through the app
- **View diagnostics**: Monitor signal strength, battery, and network status

!!! tip "First Time Setup"
    When you first connect your client app to your Companion device, take some time to explore the interface and send test messages to verify everything is working correctly.

## Getting Help

If you need assistance with the MeshCore:

1. **Community Resources**: Check our [community resources](../../../resources/index.md) and [Discord](https://chicagolandmesh.org/discord) channels
2. **Documentation**: Review the [MeshCore project documentation](https://docs.meshcore.io/)

## Legal and Safety Considerations

- **FCC Compliance**: Ensure your operations comply with FCC Part 15 regulations
- **Power Limits**: Stay within legal power limits for unlicensed operation
- **Antenna Safety**: Use appropriate antenna installations and maintain safe RF exposure levels

## Next Steps

Once you have your MeshCore device connected:

- Check out [Configure](configure.md) page
- Check out [Configure MQTT](../mqtt.md) page
- Check out [Mistakes to Avoid](avoid-mistakes.md) page
