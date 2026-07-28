---
title: Getting Started with Reticulum
tags:
  - Info
  - Getting Started
  - Reticulum
---

# Getting Started with Reticulum

## What is Reticulum?

[Reticulum](https://reticulum.network) is a cryptography-based networking stack built for reliable communication over high-latency, low-bandwidth, and unreliable links. That includes LoRa radio, packet radio, serial connections, TCP/IP, and more. It needs no central infrastructure, assigns no fixed addresses, and automatically figures out mesh-routed paths between nodes. Every identity and link is cryptographically verified end-to-end.

Reticulum is not tied to any single hardware or transport. You can run it over a LoRa radio, your home network, the internet, a serial cable, or all of the above at the same time. The stack handles routing across all of them automatically.

---

## Choosing Your Interface

Before getting started, it helps to know how you plan to connect to the Reticulum network. The most common options are:

- **RNode (LoRa radio)**: Best for off-grid, long-range, and infrastructure use. Requires a supported LoRa device and antenna.
- **TCP over the internet**: Great for testing or connecting to a wider network without any radio hardware. You connect to a remote Reticulum node over a standard internet connection.
- **Local UDP**: Useful for automatically linking devices on the same LAN without needing to know anyone's IP address.
- **Serial or I2C**: For embedded setups or connecting directly to another device over a physical link.

You can use more than one at a time. A common setup is an RNode for local off-grid communication plus a TCP link to the ChiMesh relay for wider reach.

!!! info "No Radio Hardware? No Problem"

    If you do not have an RNode yet, you can still get Reticulum running and join the wider network over TCP. Skip the RNode sections below and follow the TCP path instead.

---

## Step 1: Install Reticulum

Reticulum is Python-based and runs on Linux, macOS, and Windows. You need Python 3.7 or later.

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

### Install the Reticulum Package

```bash
pip install rns
```

This installs everything: the daemon (`rnsd`), the RNode flasher (`rnodeconf`), and all the command-line tools.

Verify the install:

```bash
rnsd --version
```

!!! tip "Virtual Environments"

    It is worth installing inside a virtual environment to avoid conflicts with system packages:

    ```bash
    python3 -m venv reticulum-env
    source reticulum-env/bin/activate   # Linux/macOS
    reticulum-env\Scripts\activate      # Windows
    pip install rns
    ```

---

## Step 2: Flash your device with Reticulum Firmware

### Hardware Requirements

- **RNode-compatible device**: Any of the following work:
    - Heltec LoRa32 v3 or v4
    - LilyGO T-Beam or T-LoRa
    - RAK4631 (WisBlock)
    - Any SX1262 or SX1276 board with [RNode firmware](https://github.com/markqvist/rnode_firmware)
- **Antenna**: 915 MHz for North America
- **USB cable**: Data-capable, not charge-only

!!! warning "Antenna Safety"

    **Always connect your antenna BEFORE powering on your device.** Running without an antenna will permanently damage the RF hardware.

!!! warning "Frequency Compliance"

    The Chicagoland Reticulum network operates at **914.875 MHz**. Using the wrong frequency means you will not be able to hear other nodes.

### Find Your Serial Port

Plug your device in via USB, then find the port it is on:

=== "Linux"

    ```bash
    ls /dev/ttyUSB* /dev/ttyACM*
    ```

    Common results: `/dev/ttyUSB0`, `/dev/ttyACM0`

=== "macOS"

    ```bash
    ls /dev/cu.*
    ```

    Common results: `/dev/cu.usbserial-*`, `/dev/cu.SLAB_USBtoUART`

=== "Windows"

    Open **Device Manager** and look under **Ports (COM & LPT)**. Note the COM number (e.g., `COM5`).

!!! tip "Permission Errors on Linux"

    If you get a `Permission denied` error, add your user to the `dialout` group:

    ```bash
    sudo usermod -a -G dialout $USER
    ```

    Log out and back in for it to take effect.

### Flash the Firmware

```bash
rnodeconf /dev/ttyACM0 --autoinstall
```

Replace `/dev/ttyACM0` with your actual port. The tool detects your device, downloads the right firmware, flashes it, and verifies the result.

!!! info "Manual Firmware Selection"

    If auto-detection fails, run `rnodeconf --list` to see supported targets, then:

    ```bash
    rnodeconf /dev/ttyACM0 --install-firmware --target <target-name>
    ```

### Verify the Flash

```bash
rnodeconf /dev/ttyACM0 --info
```

You should see the firmware version, device model, and radio parameters. Your RNode is ready. Continue to Step 3.


## Step 3: Start the Daemon

```bash
rnsd
```

The first time it runs, Reticulum generates your cryptographic identity and writes a default config file. Your identity is your address on the network, so back up the config directory if you want to keep the same address long-term.

- **Linux/macOS**: `~/.reticulum/config`
- **Windows**: `%APPDATA%\Reticulum\config`

To run it in the background:

```bash
rnsd &
```

!!! tip "Running as a System Service"

    Check out the [offical documentation](https://reticulum.network/manual/using.html#reticulum-as-a-system-service) for an example on how to start `rnsd` automatically at boot time.

### Verify Your Interfaces

```bash
rnstatus
```

Your interfaces should show as `UP`. If you are on TCP and the ChiMesh relay is reachable you will see packet counts climbing within a few seconds. With an RNode, counts will climb if other nodes are within radio range on the same frequency and parameters.

!!! tip "Next Steps"

    View the [Configuring](configure.md) page to learn how to configure TCP and RNode interfaces.

---

## Step 4: Install a Messaging App

Reticulum is a transport layer, so you need an application on top of it to actually communicate. Several options are available depending on your platform and preferences.

### Nomad Network (Terminal, Linux/macOS/Windows)

[Nomad Network](https://github.com/markqvist/NomadNet) is the main terminal-based platform for Reticulum. It provides direct messaging, a node board, and a distributed page and file system. This is a great starting point on a desktop or server.

```bash
pip install nomadnet
nomadnet
```

It connects to your running `rnsd` daemon automatically. Once inside, press ++ctrl+n++ to open the Network pane and browse nodes that have announced themselves. Press ++ctrl+m++ to open messaging and start a conversation.

!!! tip "Running Nomad Network headlessly"

    You can run Nomad Network in daemon mode on a server or Raspberry Pi to keep your node active and reachable even when you are not at a terminal:

    ```bash
    nomadnet --daemon
    ```

### Sideband (GUI, Linux/macOS/Windows/Android/iOS)

[Sideband](https://github.com/markqvist/Sideband) is a graphical messaging app available across all major platforms. It is the best choice if you want a proper GUI or want to use your phone.

=== "Android"

    Install Sideband from [Google Play](https://play.google.com/store/apps/details?id=io.unsigned.sideband) or download the APK directly from the [Sideband releases page](https://github.com/markqvist/Sideband/releases).

    Once installed, open the app and go to **Settings → Connectivity**. Add the ChiMesh relay:

    - **Type**: TCP
    - **Host**: `rns.chimesh.org`
    - **Port**: `4242`

    !!! tip "Sideband + RNode on Android"

        Sideband can connect directly to an RNode over USB or Bluetooth without needing a separate computer running `rnsd`. Combined with an Android phone this gives you a fully self-contained off-grid communicator.

=== "iOS (Retichat)"

    **Retichat** is the recommended Reticulum messaging app for iOS. Download it from the [Apple App Store](https://apps.apple.com/us/app/retichat/id6762225314).

    Once installed, open the app and navigate to **Settings → Transport**. Add the ChiMesh relay as a TCP interface:

    - **Host**: `rns.chimesh.org`
    - **Port**: `4242`

    Retichat supports direct messaging, group channels, and announces. It can also connect to a local `rnsd` instance on the same network if you prefer to run your own transport node.

=== "Linux / macOS / Windows"

    ```bash
    pip install sbapp
    sbapp
    ```

    In the app, go to **Settings → Connectivity** and add a TCP interface pointing to ChiMesh:

    - **Host**: `rns.chimesh.org`
    - **Port**: `4242`

### Reticulum MeshChat (Web UI)

[Reticulum MeshChat](https://github.com/liamcottle/reticulum-meshchat) by Liam Cottle is a web-based chat interface for Reticulum that runs in your browser. It is a great option if you prefer a clean, modern UI without installing a native app and already have `rnsd` running on a machine on your network.

#### Install

```bash
pip install reticulum-meshchat
```

Or run it via Docker:

```bash
docker run -d \
  -p 8000:8000 \
  -v ~/.reticulum:/root/.reticulum \
  liamcottle/reticulum-meshchat
```

#### Run

```bash
reticulum-meshchat
```

Then open your browser to `http://localhost:8000`. MeshChat connects to your running `rnsd` daemon automatically and provides a real-time chat interface with channel and direct messaging support.

!!! tip "Accessing MeshChat from other devices"

    If you run MeshChat on a server or Raspberry Pi on your LAN, you can access it from any browser on the same network by navigating to `http://<server-ip>:8000`.

### Other Clients

| App | Platform | Notes |
|---|---|---|
| [Nomad Network](https://github.com/markqvist/NomadNet) | Linux, macOS, Windows (terminal) | Full-featured terminal client with messaging, boards, and distributed pages |
| [Sideband](https://github.com/markqvist/Sideband) | Android, iOS, Linux, macOS, Windows | Best graphical client; supports RNode over USB/Bluetooth on Android |
| [Retichat](https://apps.apple.com/us/app/retichat/id6762225314) | iOS | Recommended iOS client |
| [Reticulum MeshChat](https://github.com/liamcottle/reticulum-meshchat) | Web (any browser) | Modern web UI by Liam Cottle; runs alongside `rnsd` |
| [LXMF Tools](https://github.com/markqvist/lxmf) | Linux, macOS, Windows (CLI) | Command-line tools for sending and receiving LXMF messages |

---

## Getting Help

1. **Discord**: Join the [Chicagoland Mesh Discord](https://discord.com/channels/1218078395565608990/1349623850148823084) for local community support
2. **Reticulum Community**: Join the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) for broader community support
3. **Documentation**: [reticulum.network/manual](https://reticulum.network/manual/)
4. **Source Code**: [github.com/markqvist/Reticulum](https://github.com/markqvist/Reticulum)
5. **RNode Firmware Source**: [github.com/markqvist/RNode_Firmware](https://github.com/markqvist/RNode_Firmware)

---

## Legal and Compliance Considerations

- **FCC Part 15**: Unlicensed LoRa operation in the US is permitted under Part 15 within power and duty cycle limits
- **Amateur Radio (Part 97)**: Licensed amateur operators can run higher power on additional frequencies, but must transmit identification and cannot use encryption for control signals
- **Encryption**: Reticulum encrypts all traffic by default. This is fine under Part 15. Under Part 97, check your regional rules on encrypted communications before operating

---

## Next Steps

- Check out [Configure](configure.md) to set up radio parameters, tune interfaces, and explore advanced options
- Check out [Mistakes to Avoid](avoid-mistakes.md) for common pitfalls and how to sidestep them
- Join the [Reticulum channel on the ChiMesh Discord](https://discord.com/channels/1218078395565608990/1349623850148823084) if you have questions or get stuck
- Join the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) for broader community help
