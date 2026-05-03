---
title: Getting Started with Reticulum
tags:
  - Info
  - Getting Started
  - Reticulum
---

# Getting Started with Reticulum and RNode
 
## What is Reticulum?
 
[Reticulum](https://reticulum.network) is a cryptography-based networking stack built for reliable communication over high-latency, low-bandwidth, and unreliable links. That includes LoRa radio, packet radio, serial connections, TCP/IP, and more. It needs no central infrastructure, assigns no fixed addresses, and automatically figures out mesh-routed paths between nodes. Every identity and link is cryptographically verified end-to-end.
 
**RNode** is the most common hardware interface used with Reticulum. It is an open-source, LoRa-capable transceiver that you flash with firmware so it can act as a radio interface for the stack.
 
Together, Reticulum and RNode let you build fully off-grid, encrypted, long-range communication networks with no internet required.
 
---
 
## Hardware Requirements
 
- **RNode-compatible device**: Any of the following work:
    - LilyGO T-Beam (good starting point for beginners, includes GPS and battery management)
    - LilyGO T3S3 / TTGO LoRa32
    - Heltec LoRa32 v2 / v3
    - RAK4631 (WisBlock)
    - Homebrew RNode (ESP32 or ATmega1284p based)
    - See the full list at [unsigned.io/rnode](https://unsigned.io/rnode/)
- **Antenna**: A suitable antenna for your frequency band (915 MHz for the US, 868 MHz for EU)
- **USB cable**: For programming and power (make sure it is data-capable, not charge-only)
- **Power solution**: LiPo battery, USB power bank, or solar panel depending on your deployment
!!! warning "Antenna Safety"
 
    **Always connect your antenna BEFORE powering on your device.** Running a LoRa radio without an antenna will permanently damage the RF front-end. This is not covered under warranty.
 
!!! warning "Frequency Compliance"
 
    In the United States, use the **915 MHz** LoRa band. In Europe, use **868 MHz**. Using the wrong frequency may violate local radio regulations, so check your regional rules before you start transmitting.
 
---
 
## Step 1: Install Python and the RNode Bootstrap Tool
 
Reticulum and the RNode flasher are both Python-based. You need Python 3.7 or later.
 
### Install Python
 
=== "Linux / macOS"
 
    Python 3 is usually pre-installed. Check with:
 
    ```bash
    python3 --version
    ```
 
    If it is not installed, grab it through your package manager:
 
    ```bash
    # Debian / Ubuntu
    sudo apt install python3 python3-pip
 
    # macOS (via Homebrew)
    brew install python3
    ```
 
=== "Windows"
 
    Download the installer from [python.org](https://www.python.org/downloads/). During installation, **check "Add Python to PATH"** before clicking Install, otherwise commands will not work from the terminal.
 
### Install the RNode Configuration Utility
 
The `rnodeconf` tool is part of the `rns` package. It handles firmware flashing, configuration, and device management:
 
```bash
pip install rns
```
 
Verify it installed correctly:
 
```bash
rnodeconf --version
```
 
!!! tip "Virtual Environments"
 
    It is worth installing Python packages inside a virtual environment to keep things tidy and avoid conflicts with system packages:
 
    ```bash
    python3 -m venv reticulum-env
    source reticulum-env/bin/activate   # Linux/macOS
    reticulum-env\Scripts\activate      # Windows
    pip install rns
    ```
 
---
 
## Step 2: Flash RNode Firmware
 
### Connect Your Device
 
1. Connect your antenna to the device **BEFORE** powering on
2. Plug the device into your computer via USB
3. Find the serial port your device is on:
=== "Linux"
 
    ```bash
    ls /dev/ttyUSB* /dev/ttyACM*
    ```
 
    Common ports: `/dev/ttyUSB0`, `/dev/ttyACM0`
 
=== "macOS"
 
    ```bash
    ls /dev/cu.*
    ```
 
    Common ports: `/dev/cu.usbserial-*`, `/dev/cu.SLAB_USBtoUART`
 
=== "Windows"
 
    Open **Device Manager** and look under **Ports (COM & LPT)**. You want a port labeled `Silicon Labs CP210x` or `CH340`. Note the COM number (e.g., `COM5`).
 
!!! tip "Permission Errors on Linux"
 
    If you hit a `Permission denied` error on the serial port, add your user to the `dialout` group:
 
    ```bash
    sudo usermod -a -G dialout $USER
    ```
 
    Log out and back in for the change to take effect.
 
### Flash the Firmware
 
Run the auto-install command, swapping out `/dev/ttyUSB0` for your actual port:
 
```bash
rnodeconf /dev/ttyUSB0 --autoinstall
```
 
The tool will:
 
1. Detect your device model
2. Download the correct firmware
3. Flash it and verify the result
!!! info "Manual Firmware Selection"
 
    If auto-detection does not work, you can pick your device manually. Run `rnodeconf --list` to see supported targets, then:
 
    ```bash
    rnodeconf /dev/ttyUSB0 --install-firmware --target <target-name>
    ```
 
### Verify the Flash
 
Once flashing is done, confirm everything looks right:
 
```bash
rnodeconf /dev/ttyUSB0 --info
```
 
You should see the firmware version, device model, and radio parameters printed out.
 
---
 
## Getting Help
 
1. **Reticulum Community**: Join the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) for community support
2. **Documentation**: [reticulum.network/manual](https://reticulum.network/manual/)
3. **Source Code**: [github.com/markqvist/Reticulum](https://github.com/markqvist/Reticulum)
4. **RNode Firmware Source**: [github.com/markqvist/RNode_Firmware](https://github.com/markqvist/RNode_Firmware)
---
 
## Legal and Compliance Considerations
 
- **FCC Part 15**: Unlicensed LoRa operation in the US is permitted under Part 15 within power and duty cycle limits
- **Amateur Radio (Part 97)**: Licensed amateur operators can run higher power on additional frequencies, but must transmit identification and cannot use encryption for control signals
- **Encryption**: Reticulum encrypts all traffic by default. This is fine under Part 15. Under Part 97, check your regional rules on encrypted communications before operating
- **RF Exposure**: Keep a safe distance from high-gain directional antennas, especially at elevated power levels
---
 
## Next Steps
 
Once your RNode firmware is flashed and verified:
 
- Check out [Configure](configure.md) to set up your radio parameters, Reticulum daemon, and applications
- Check out [Mistakes to Avoid](avoid-mistakes.md) for common pitfalls and how to sidestep them
