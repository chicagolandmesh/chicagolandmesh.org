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

You can use more than one at a time. A common setup is an RNode for local off-grid communication plus a TCP link to a community node for wider reach.

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

## Step 2: Connect an Interface

Pick the path that matches your setup. You can always add more interfaces later.

=== "RNode (LoRa)"

    ### Hardware Requirements

    - **RNode-compatible device**: Any of the following work:
        - LilyGO T-Beam (good starting point, includes GPS and battery management)
        - LilyGO T3S3 / TTGO LoRa32
        - Heltec LoRa32 v2 / v3
        - RAK4631 (WisBlock)
        - Homebrew RNode (ESP32 or ATmega1284p based)
        - Full list at [unsigned.io/rnode](https://unsigned.io/rnode/)
    - **Antenna**: 915 MHz for the US, 868 MHz for EU
    - **USB cable**: Data-capable, not charge-only

    !!! warning "Antenna Safety"

        **Always connect your antenna BEFORE powering on your device.** Running without an antenna will permanently damage the RF hardware.

    !!! warning "Frequency Compliance"

        In the United States use **915 MHz**. In Europe use **868 MHz**. Using the wrong band may violate local regulations.

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

        Open **Device Manager** and look under **Ports (COM & LPT)**. Look for `Silicon Labs CP210x` or `CH340` and note the COM number (e.g., `COM5`).

    !!! tip "Permission Errors on Linux"

        If you get a `Permission denied` error, add your user to the `dialout` group:

        ```bash
        sudo usermod -a -G dialout $USER
        ```

        Log out and back in for it to take effect.

    ### Flash the Firmware

    ```bash
    rnodeconf /dev/ttyUSB0 --autoinstall
    ```

    Replace `/dev/ttyUSB0` with your actual port. The tool detects your device, downloads the right firmware, flashes it, and verifies the result.

    !!! info "Manual Firmware Selection"

        If auto-detection fails, run `rnodeconf --list` to see supported targets, then:

        ```bash
        rnodeconf /dev/ttyUSB0 --install-firmware --target <target-name>
        ```

    ### Verify the Flash

    ```bash
    rnodeconf /dev/ttyUSB0 --info
    ```

    You should see the firmware version, device model, and radio parameters. Your RNode is ready. Continue to Step 3.

=== "TCP (Internet or LAN)"

    TCP interfaces let you connect to other Reticulum nodes over any IP network, whether that is the internet, your home LAN, or a VPN. No radio hardware required.

    ### Connect to the Community Testnet

    The easiest way to get started is connecting to a public Reticulum node. Run `rnsd` once first to generate your config file, then open `~/.reticulum/config` and add an interface block:

    ```toml
    [[Reticulum Testnet Amsterdam]]
      type = TCPClientInterface
      interface_enabled = True
      target_host = amsterdam.connect.reticulum.network
      target_port = 4965
    ```

    Other available testnet nodes:

    | Host | Port |
    |---|---|
    | `amsterdam.connect.reticulum.network` | `4965` |
    | `betavpn.connect.reticulum.network` | `4965` |
    | `reticulum.betavpn.ca` | `4242` |

    Save the file and restart `rnsd`. You will be connected to the wider Reticulum network over TCP.

    !!! tip "Connecting to a Local Node"

        If someone on your local network is already running Reticulum, you can connect to them by using their local IP instead:

        ```toml
        [[Local Node]]
          type = TCPClientInterface
          interface_enabled = True
          target_host = 192.168.1.100
          target_port = 4242
        ```

=== "UDP (Local Network)"

    UDP interfaces are useful for automatic discovery of other Reticulum nodes on the same LAN without needing to know anyone's IP address in advance.

    Add the following to `~/.reticulum/config`:

    ```toml
    [[Local UDP]]
      type = UDPInterface
      interface_enabled = True
      listen_ip = 0.0.0.0
      listen_port = 4242
      forward_ip = 255.255.255.255
      forward_port = 4242
    ```

    Any Reticulum node on the same network segment with a matching UDP interface will automatically discover yours and start exchanging announces.

    !!! info "Broadcast Limitations"

        UDP broadcast only works within a single network segment. It will not cross routers or work over the internet. For wider connectivity, combine it with a TCP interface.

---

## Step 3: Start the Daemon

```bash
rnsd
```

The first time it runs, Reticulum generates your cryptographic identity and writes a default config file. Your identity is your address on the network, so back up the config directory if you want to keep the same address long-term.

- **Linux/macOS**: `~/.reticulum/config`
- **Windows**: `%APPDATA%\Reticulum\config`

To run it in the background:

```bash
rnsd --daemon
```

### Verify Your Interfaces

```bash
rnstatus
```

Your interfaces should show as `UP`. If you are on TCP and the testnet is reachable you will see packet counts climbing within a few seconds. With an RNode, counts will climb if other nodes are within radio range on the same frequency.

!!! tip "Finding Your Address"

    Your identity hash is what other users need to reach you. Get it with:

    ```bash
    rnid
    ```

---

## Step 4: Install a Messaging App

Reticulum is a transport layer, so you need an application on top of it to actually communicate.

### Nomad Network

[Nomad Network](https://github.com/markqvist/NomadNet) is the main terminal-based platform for Reticulum. It provides direct messaging, a node board, and a distributed page and file system.

```bash
pip install nomadnet
nomadnet
```

It connects to your running `rnsd` daemon automatically.

### Sideband

[Sideband](https://github.com/markqvist/Sideband) is a graphical messaging app for Android, Linux, macOS, and Windows. It is the better choice if you prefer a proper GUI or want to use your phone.

- **Android**: [Google Play](https://play.google.com/store/apps/details?id=io.unsigned.sideband) or direct APK
- **Linux/macOS/Windows**:

    ```bash
    pip install sbapp
    sbapp
    ```

!!! tip "Sideband + RNode on Android"

    Sideband can connect directly to an RNode over USB or Bluetooth without needing a separate computer running `rnsd`. Combined with an Android phone this gives you a fully self-contained off-grid communicator.

!!! tip "Sideband without Radio Hardware"

    No RNode? Sideband can connect through your running `rnsd` instance on the same machine, which handles the TCP connection on its behalf. You do not need radio hardware to use it.

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

Once Reticulum is running and you can see active interfaces in `rnstatus`:

- Check out [Configure](configure.md) to set up radio parameters, tune interfaces, and explore advanced options
- Check out [Mistakes to Avoid](avoid-mistakes.md) for common pitfalls and how to sidestep them
