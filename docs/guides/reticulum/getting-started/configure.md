---
title: Configuring Reticulum
tags:
  - Info
  - Getting Started
  - Reticulum
---

# Configuring Reticulum

This page walks through how to configure Reticulum interfaces, tune radio parameters, and set up your node for different use cases. Whether you are running a simple TCP-only setup or a dual-interface LoRa gateway, the process follows the same pattern.

Reticulum's configuration lives in a single TOML file:

- **Linux/macOS**: `~/.reticulum/config`
- **Windows**: `%APPDATA%\Reticulum\config`

If the file does not exist yet, run the daemon once to generate it:

```bash
rnsd
```

Then open it in any text editor. All interface blocks go in the `[interfaces]` section at the bottom.

---

## Configuration File Structure

A minimal config file looks like this:

```toml
[reticulum]
  enable_transport = False
  share_instance = True
  shared_instance_port = 37428
  instance_control_port = 37429
  panic_on_interface_error = No

[logging]
  loglevel = 4

[interfaces]

  # Add your interface blocks here

```

The `[reticulum]` section controls global daemon behavior. The `[interfaces]` section is where you define every connection, whether that is a radio, a TCP peer, a local UDP link, or anything else. You can add as many interface blocks as you need and Reticulum will route across all of them at the same time.

---

## TCP Interfaces

TCP interfaces connect your node to other Reticulum nodes over any IP network. That could be the internet, a LAN, a VPN tunnel, or a private WAN. No radio hardware is needed.

### TCPClientInterface

A `TCPClientInterface` dials out to a remote node. Use this to join a community mesh, connect to a friend's node, or link two sites over the internet.

```toml
[[Amsterdam Testnet]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = amsterdam.connect.reticulum.network
  target_port = 4965
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `type` | Must be `TCPClientInterface` |
| `interface_enabled` | Set to `True` to activate this interface |
| `target_host` | Hostname or IP of the remote node |
| `target_port` | TCP port on the remote node |

### Community Testnet Nodes

These public nodes are maintained by the Reticulum community. They are a good starting point if you want to join the wider network without running your own server:

| Host | Port | Location |
|---|---|---|
| `amsterdam.connect.reticulum.network` | `4965` | Amsterdam |
| `betavpn.connect.reticulum.network` | `4965` | BetaVPN |
| `reticulum.betavpn.ca` | `4242` | Canada |

You can add multiple testnet entries at once. Reticulum will use all of them and automatically route around any that go offline:

```toml
[[Testnet Amsterdam]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = amsterdam.connect.reticulum.network
  target_port = 4965

[[Testnet Canada]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = reticulum.betavpn.ca
  target_port = 4242
```

### Connecting to a Local Node

If someone on your LAN is already running Reticulum, just point at their local IP instead:

```toml
[[Local Node]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = 192.168.1.100
  target_port = 4242
```

### TCPServerInterface

A `TCPServerInterface` listens for incoming connections. Use this when you want other nodes to connect to yours, for example to run a community relay, link a remote site, or share your RNode with other devices on the network.

```toml
[[My Relay]]
  type = TCPServerInterface
  interface_enabled = True
  listen_ip = 0.0.0.0
  listen_port = 4242
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `type` | Must be `TCPServerInterface` |
| `interface_enabled` | Set to `True` to activate this interface |
| `listen_ip` | IP to bind. `0.0.0.0` accepts connections on all interfaces |
| `listen_port` | TCP port to listen on |

!!! tip "Running a Public Relay"

    If you want your node reachable from the internet, open the `listen_port` in your firewall and router NAT, then share your public IP or hostname and port with others. They can add a `TCPClientInterface` pointing to you and connect right in.

!!! info "Binding to a Specific Interface"

    To accept connections only from your LAN and not from the internet, bind to your LAN IP instead of `0.0.0.0`:

    ```toml
    listen_ip = 192.168.1.50
    ```

---

## UDP Interfaces

UDP interfaces handle automatic discovery and linking between Reticulum nodes on the same network segment. Once you add the block, nodes find each other through broadcast with no extra configuration needed.

```toml
[[Local UDP]]
  type = UDPInterface
  interface_enabled = True
  listen_ip = 0.0.0.0
  listen_port = 4242
  forward_ip = 255.255.255.255
  forward_port = 4242
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `type` | Must be `UDPInterface` |
| `listen_ip` | IP to bind for incoming packets |
| `listen_port` | UDP port to listen on |
| `forward_ip` | Broadcast destination. `255.255.255.255` reaches all devices on the segment |
| `forward_port` | UDP port to send to |

!!! warning "LAN-Only Scope"

    UDP broadcast does not cross routers. It only works within a single network segment. If you also want connectivity beyond your LAN, add a `TCPClientInterface` alongside it.

!!! tip "Multiple Instances on One Machine"

    If you are running more than one Reticulum instance on the same host, for example while testing, give each a different `listen_port` to avoid conflicts.

---

## RNode (LoRa Radio) Interfaces

RNode is the firmware that turns supported LoRa hardware into a Reticulum radio interface. Once your device is flashed (see [Getting Started](getting-started.md)), you add an interface block pointing to its serial port and set the radio parameters for your region and use case.

### Basic RNode Interface

```toml
[[RNode LoRa]]
  type = RNodeInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  frequency = 915000000
  bandwidth = 125000
  txpower = 17
  spreadingfactor = 8
  codingrate = 5
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `type` | Must be `RNodeInterface` |
| `interface_enabled` | Set to `True` to activate this interface |
| `port` | Serial port the device is connected to |
| `frequency` | Center frequency in Hz |
| `bandwidth` | Channel bandwidth in Hz |
| `txpower` | Transmit power in dBm |
| `spreadingfactor` | LoRa spreading factor (6 to 12) |
| `codingrate` | LoRa coding rate denominator (5 to 8, representing 4/5 through 4/8) |

### Finding Your Serial Port

=== "Linux"

    Plug in your device, then check which port appeared:

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

    Open **Device Manager** and look under **Ports (COM & LPT)**. Note the COM number (for example, `COM5`) and use that as your port value:

    ```toml
    port = COM5
    ```

!!! tip "Permission Errors on Linux"

    If `rnsd` cannot open the serial port, add your user to the `dialout` group and log out and back in:

    ```bash
    sudo usermod -a -G dialout $USER
    ```

### Frequency and Regional Compliance

Pick the center frequency that matches your regulatory region. Using the wrong band can violate local regulations, so double-check before transmitting.

| Region | Band | Typical Center Frequency |
|---|---|---|
| United States | 915 MHz (ISM) | `915000000` |
| Europe | 868 MHz (SRD) | `868000000` |
| Asia / Oceania | 433 MHz or 923 MHz | `433000000` or `923000000` |

Always verify which frequencies are permitted for unlicensed operation in your specific country.

### Radio Parameter Tuning

LoRa gives you a few interdependent parameters to work with. The tradeoff is always between range, data rate, and airtime per packet.

**Spreading Factor (SF)**

The spreading factor controls how much the signal is spread across time. A higher SF gives you longer range and better building penetration, but each packet takes longer to transmit and the data rate drops.

| SF | Relative Range | Relative Speed | Use Case |
|---|---|---|---|
| 7 | Shortest | Fastest | Dense urban, short hops |
| 8 | Medium | Medium | General purpose (good default) |
| 9 | Long | Slower | Suburban, mixed terrain |
| 10 | Longer | Slower | Rural, open terrain |
| 11 | Very Long | Very Slow | Remote links, low traffic |
| 12 | Maximum | Slowest | Extreme range, minimal traffic |

**Bandwidth**

Wider bandwidth means higher data rate but lower sensitivity, so shorter range for the same transmit power.

| Bandwidth | Value (Hz) | Notes |
|---|---|---|
| 125 kHz | `125000` | Most common; best sensitivity |
| 250 kHz | `250000` | Higher throughput, less range |
| 500 kHz | `500000` | Maximum throughput, shortest range |

**Transmit Power**

Set `txpower` to the highest value your hardware supports within your local regulations. Most RNode hardware caps somewhere between 17 and 22 dBm. Check the docs for your specific device to find the ceiling.

!!! warning "Antenna Safety"

    Never power on your RNode without a properly connected antenna. Transmitting into an open connector can permanently damage the RF front-end of your device.

### Preset Configurations

**General-purpose node (US 915 MHz)**

A solid starting point for a fixed node with good range and reasonable throughput:

```toml
[[RNode US]]
  type = RNodeInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  frequency = 915000000
  bandwidth = 125000
  txpower = 17
  spreadingfactor = 8
  codingrate = 5
```

**Long-range remote link**

Pushes range as far as possible at the cost of throughput. Good for sparse rural nodes or emergency backup links:

```toml
[[RNode Long Range]]
  type = RNodeInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  frequency = 915000000
  bandwidth = 125000
  txpower = 20
  spreadingfactor = 11
  codingrate = 5
```

**European node (868 MHz)**

```toml
[[RNode EU]]
  type = RNodeInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  frequency = 868000000
  bandwidth = 125000
  txpower = 14
  spreadingfactor = 8
  codingrate = 5
```

!!! info "Europe Duty Cycle Limits"

    The 868 MHz band in Europe has a 1% duty cycle restriction in most sub-bands. For fixed infrastructure nodes, keep traffic light to stay within regulatory limits.

### Combining RNode with TCP

One of the most useful setups is running an RNode for local off-grid radio coverage alongside a TCP uplink to the wider internet-connected mesh. Reticulum handles routing across both automatically. A packet can arrive over LoRa and go out over TCP, or the other way around, with no extra configuration needed beyond listing both interfaces:

```toml
[[RNode LoRa]]
  type = RNodeInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  frequency = 915000000
  bandwidth = 125000
  txpower = 17
  spreadingfactor = 8
  codingrate = 5

[[Amsterdam Testnet]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = amsterdam.connect.reticulum.network
  target_port = 4965
```

This turns your node into a bridge. Radio nodes in your area can reach the internet-connected mesh through you, and nodes on the TCP mesh can reach your local radio coverage area.

---

## Serial and I2C Interfaces

For direct device-to-device connections over a physical cable, Reticulum supports raw serial and I2C links. These are handy for embedded setups, connecting a microcontroller to a Raspberry Pi, or wiring two machines together without a network.

### SerialInterface

```toml
[[Direct Serial Link]]
  type = SerialInterface
  interface_enabled = True
  port = /dev/ttyUSB0
  speed = 115200
  databits = 8
  parity = none
  stopbits = 1
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `port` | Serial device path |
| `speed` | Baud rate. Both ends must match |
| `databits` | Data bits per frame (usually `8`) |
| `parity` | `none`, `even`, or `odd` |
| `stopbits` | Stop bits (`1` or `2`) |

Both devices need to use the same serial settings. A common setup is two Raspberry Pi boards connected through their GPIO UART pins with a null-modem wiring (TX to RX, RX to TX, GND to GND).

### I2CInterface

```toml
[[I2C Link]]
  type = I2CInterface
  interface_enabled = True
  port = /dev/i2c-1
  address = 0x51
  i2c_bus = 1
```

I2C is most useful on single-board computers where two devices share the same bus. Make sure the address you choose does not conflict with anything else already on the bus.

---

## Transport and Routing

By default, Reticulum runs in end-node mode. It handles traffic destined for its own identity but does not forward packets between other nodes. To turn your node into a full transport node that relays traffic across the mesh, enable transport mode:

```toml
[reticulum]
  enable_transport = True
```

!!! warning "Consider Your Resources"

    Transport nodes keep routing tables and forwarding state for every destination they have heard about. On a busy mesh this can get memory-intensive. It works fine on a Raspberry Pi or a desktop, but think carefully before enabling it on a device with very limited RAM.

When transport is enabled, your node will forward announces on behalf of other nodes, maintain path tables for multi-hop routing, and relay data packets between interfaces.

A node running both an RNode and a TCP uplink with transport enabled will act as a full gateway between the radio mesh and the internet-connected network.

---

## Verifying Your Configuration

After editing the config file, restart the daemon and check interface status:

```bash
rnsd --stop    # if already running as a daemon
rnsd           # restart in the foreground to watch for errors
```

In a second terminal:

```bash
rnstatus
```

Each configured interface should show as `UP`. For TCP interfaces, packet and byte counters will start climbing within a few seconds of connecting to an active testnet node. For RNode interfaces, counters climb when another node running the same frequency and parameters comes within radio range.

If an interface shows as `DOWN`, check the following:

- Correct port path (RNode) or hostname/IP (TCP)
- Frequency and bandwidth match between your node and the one you are trying to reach (RNode)
- Firewall rules and port forwarding (TCPServerInterface)
- Serial port permissions (see the `dialout` group tip above)

To get your node's identity hash, which other users need to reach you directly:

```bash
rnid
```

---

## Full Example Configuration

Here is a complete config for a node running an RNode for local radio coverage, a TCP uplink to the testnet, and a UDP interface for local LAN discovery. Transport is enabled so it bridges traffic between all three:

```toml
[reticulum]
  enable_transport = True
  share_instance = True
  shared_instance_port = 37428
  instance_control_port = 37429
  panic_on_interface_error = No

[logging]
  loglevel = 4

[interfaces]

  [[RNode LoRa US]]
    type = RNodeInterface
    interface_enabled = True
    port = /dev/ttyUSB0
    frequency = 915000000
    bandwidth = 125000
    txpower = 17
    spreadingfactor = 8
    codingrate = 5

  [[Testnet Amsterdam]]
    type = TCPClientInterface
    interface_enabled = True
    target_host = amsterdam.connect.reticulum.network
    target_port = 4965

  [[Local UDP]]
    type = UDPInterface
    interface_enabled = True
    listen_ip = 0.0.0.0
    listen_port = 4242
    forward_ip = 255.255.255.255
    forward_port = 4242
```

---

## Next Steps

- See [Mistakes to Avoid](avoid-mistakes.md) for common configuration pitfalls
- See the [Reticulum Manual](https://reticulum.network/manual/) for the full interface and parameter reference
- Join the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) for community help and configuration tips
