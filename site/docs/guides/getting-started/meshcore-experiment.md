---
title: Getting Started with Meshcore Experiment
tags:
  - Info
  - Getting Started
  - Meshcore
  - Experiment
---

Welcome to Chicago's Meshcore Experiment! Our community has been primarily focused on Meshtastic, and we're excited to explore the capabilities of Meshcore while maintaining our existing Long Fast Meshtastic network.

## What is the Meshcore Experiment?

The Meshcore Experiment is an initiative by our community to explore Meshcore technology alongside our established Meshtastic mesh network. This experiment allows us to:

- Test new mesh networking capabilities
- Compare performance with our existing Meshtastic setup
- Explore advanced features while maintaining network stability
- Learn and grow as a community

!!! info "Existing Network Continues"

    **Our Chicago Long Fast Meshtastic network will continue to operate normally.** This experiment runs in parallel and does not interfere with existing operations. We're also experimenting with a Med-Fast test configuration within Meshtastic to complement our testing efforts.

## Hardware Requirements

To participate in the Meshcore Experiment, you'll need:

- **Meshcore-compatible device**: Check the [Meshcore documentation](https://github.com/meshcore-dev/MeshCore/blob/main/docs/faq.md) for supported hardware
- **Antenna**: A suitable antenna for your frequency band (915MHz for US operations)
- **USB cable**: For device programming and power
- **Power solution**: Battery pack, solar panel, or wall adapter depending on your deployment

!!! warning "Antenna Safety"

    Never power on your device without an antenna connected. This can permanently damage the radio hardware.

## Getting Started Steps

### 1. Hardware Setup

1. Connect your antenna to the device **before** powering on
2. Connect your device via USB to your computer
3. Ensure you have a stable power source for your intended deployment

### 2. Software Installation and Device Role Selection

1. Visit the [Meshcore Web Flasher](https://flasher.meshcore.co.uk/) in your web browser
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

### 3. Initial Configuration

1. Power on your device after flashing
2. Visit the [Meshcore Configuration Tool](https://config.meshcore.dev) in your web browser
3. Connect to your device using one of the available methods:
   - USB serial connection (recommended for initial setup)
   - Bluetooth pairing (if using BLE companion firmware)
4. Configure basic settings through the web interface:
   - Set your node name (consider adding "ChiMesh.org" to help identify our community)
   - Location (optional)
   - Change the admin password
   - Go to "Radio Settings" and set "Preset" to "USA/Canada (Recommended)"

### 4. Network Settings

Configure your device for the Chicago Meshcore Experiment using the **"USA/Canada (Recommended)"** preset, which includes the following settings:

- **Frequency**: 910.525 MHz
- **Bandwidth**: 62.5 kHz
- **Spreading Factor**: 7
- **Coding Rate**: 5
- **TX Power**: 22 dBm (typical)
- **Airtime Factor**: 1


!!! info "Preset Selection"

    When configuring your Meshcore device, look for the "USA/Canada (Recommended)" preset in your configuration interface. This preset automatically applies all the correct radio parameters for optimal performance in North America.

!!! tip "Community Identification"

    Consider adding "ChiMesh.org" or "ChicagolandMesh.org" to your node name to help identify fellow community members during the experiment.

## Using Meshcore Client Apps

After setting up your Meshcore device with Companion firmware, you'll need a client app to send and receive messages. Meshcore offers several client options depending on your device and preferences.

### Mobile Apps

#### Android

- Download from [Google Play Store](https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android)
- Or download the [APK file directly](https://files.liamcottle.net/MeshCore/)
- Developed by Liam Cottle

#### iOS

- Download from the [Apple App Store](https://apps.apple.com/gb/app/meshcore/id6742354151)
- Compatible with iPhone and iPad

### Web Clients

#### Official Web Client

- Visit [https://app.meshcore.nz/](https://app.meshcore.nz/)
- Requires Chrome browser
- Works with USB serial connections

#### Community Web Client

- Visit [https://meshcore.liamcottle.net/](https://meshcore.liamcottle.net/)
- Also by Liam Cottle
- Works with Chrome browser and iOS Bluefy app

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

## Experiment Guidelines

### Participation Expectations

- **Be patient**: This is an experiment, and we expect to encounter issues and learn together
- **Share feedback**: Report your experiences, both positive and negative, to help the community learn
- **Collaborate**: Work with other community members to troubleshoot and optimize the network
- **Document**: Keep notes on performance, range, and any issues you encounter

### Network Etiquette

- Use appropriate power levels for your location and deployment
- Avoid excessive message traffic during testing phases
- Respect others' experiments and testing activities
- Follow FCC regulations for unlicensed spectrum use

## Getting Help

If you need assistance with the Meshcore Experiment:

1. **Community Resources**: Check our community forums and chat channels
2. **Documentation**: Review the [Meshcore project documentation](https://github.com/meshcore/meshcore)
3. **Local Meetups**: Attend community meetings to discuss experiences and get hands-on help
4. **Mentorship**: Connect with experienced community members who can provide guidance

## Legal and Safety Considerations

- **FCC Compliance**: Ensure your operations comply with FCC Part 97 and Part 15 regulations
- **Power Limits**: Stay within legal power limits for unlicensed operation
- **Antenna Safety**: Use appropriate antenna installations and maintain safe RF exposure levels
- **Privacy**: Be mindful of message content and encryption settings

## Next Steps

Once you have your Meshcore device set up and connected:

1. **Test connectivity** with other experiment participants
2. **Monitor performance** and compare with Meshtastic operations
3. **Participate in community discussions** about your findings
4. **Help document** best practices and lessons learned
5. **Consider advanced configurations** as you become more comfortable with the platform

!!! note "Experimental Nature"

    Remember, this is an experiment! We're all learning together. Don't hesitate to ask questions, share discoveries, or report issues. Your participation helps the entire community learn and improve our mesh networking capabilities.

---

Ready to get started? Make sure you have your hardware ready and join our community channels to connect with other experiment participants!
