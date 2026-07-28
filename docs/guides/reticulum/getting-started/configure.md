---
title: Configuring Reticulum
tags:
  - Info
  - Getting Started
  - Reticulum
---

# Configuring Reticulum

This page walks through how to configure Reticulum interfaces, tune radio parameters, and set up your node for different use cases. Whether you are running a simple TCP-only setup or a dual-interface LoRa gateway, the process follows the same pattern.

Reticulum's configuration lives in a single file:

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

```
[reticulum]
  enable_transport = False
  share_instance = True

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

A `TCPClientInterface` dials out to a remote node. Use this to connect to a relay, link to a friend's node, or link two sites over the internet.

```
[[Relay Node]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = rns.chimesh.org
  target_port = 4242
```

You can add as many client interfaces as you want. To also connect to a local node on your LAN, just add another block pointing at their IP:

```
[[Local Node]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = 192.168.1.100
  target_port = 4242
```

**Key parameters:**

| Parameter | Description |
|---|---|
| `type` | Must be `TCPClientInterface` |
| `interface_enabled` | Set to `True` to activate this interface |
| `target_host` | Hostname or IP of the remote node |
| `target_port` | TCP port on the remote node |

---

## RNode (LoRa Radio) Interfaces

RNode is the firmware that turns supported LoRa hardware into a Reticulum radio interface. Once your device is flashed (see [Getting Started](index.md)), you add an interface block pointing to its serial port and set the radio parameters to match the Chicagoland Reticulum network.

### Chicagoland LoRa Parameters

To join the Chicagoland Reticulum radio network, use these settings on your RNode:

| Parameter | Value |
|---|---|
| Frequency | 914.875 MHz |
| Bandwidth | 125.0 kHz |
| Spreading Factor | 8 |
| Coding Rate | 5 |
| TX Power | 22 dBm (check your hardware ceiling) |

### RNode Interface Config

```
[[RNode LoRa]]
  type = RNodeInterface
  enabled = yes
  port = /dev/ttyACM0
  frequency = 914875000
  bandwidth = 125000
  txpower = 22
  spreadingfactor = 8
  codingrate = 5
```

Replace `/dev/ttyACM0` with the actual serial port your device is on.

!!! warning "Check Your Hardware TX Power Ceiling"

    Not all RNode hardware supports 22 dBm. Check the documentation for your specific device and set `txpower` to the highest value it supports within that ceiling. Running at a power level the hardware cannot actually deliver is harmless, but you will get better results knowing your real maximum.

### Radio Parameter Reference

LoRa gives you a few interdependent parameters to work with. The tradeoff is always between range, data rate, and airtime per packet. The Chicagoland network settings are already tuned for a good balance across the area; do not change them if you want to interoperate with other local nodes.

**Spreading Factor (SF)**

| SF | Relative Range | Relative Speed | Use Case |
|---|---|---|---|
| 7 | Shortest | Fastest | Dense urban, short hops |
| **8** | **Medium** | **Medium** | **Chicagoland network default** |
| 9 | Long | Slower | Suburban, mixed terrain |
| 10 | Longer | Slower | Rural, open terrain |
| 11 | Very Long | Very Slow | Remote links, low traffic |
| 12 | Maximum | Slowest | Extreme range, minimal traffic |

**Bandwidth**

| Bandwidth | Value (Hz) | Notes |
|---|---|---|
| **125 kHz** | **`125000`** | **Chicagoland network default; best sensitivity** |
| 250 kHz | `250000` | Higher throughput, less range |
| 500 kHz | `500000` | Maximum throughput, shortest range |

!!! warning "Antenna Safety"

    Never power on your RNode without a properly connected antenna. Transmitting into an open connector can permanently damage the RF front-end of your device.

### Combining RNode with TCP

One of the most useful setups is running an RNode for local off-grid radio coverage alongside a TCP uplink to the ChiMesh relay node. Reticulum handles routing across both automatically. A packet can arrive over LoRa and go out over TCP, or the other way around, with no extra configuration needed beyond listing both interfaces:

```
[[RNode LoRa]]
  type = RNodeInterface
  enabled = yes
  port = /dev/ttyACM0
  frequency = 914875000
  bandwidth = 125000
  txpower = 22
  spreadingfactor = 8
  codingrate = 5

[[ChiMesh Relay]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = rns.chimesh.org
  target_port = 4242
```

This turns your node into a bridge. Radio nodes in your area can reach the TCP-connected mesh through you, and nodes on the ChiMesh relay can reach your local radio coverage area.

---

## Serial and I2C Interfaces

For direct device-to-device connections over a physical cable, Reticulum supports raw serial and I2C links. These are handy for embedded setups, connecting a microcontroller to a Raspberry Pi, or wiring two machines together without a network.

### SerialInterface

```
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

```
[[I2C Link]]
  type = I2CInterface
  interface_enabled = True
  port = /dev/i2c-1
  address = 0x51
  i2c_bus = 1
```

I2C is most useful on single-board computers where two devices share the same bus. Make sure the address you choose does not conflict with anything else already on the bus.

---

## Verifying Your Configuration

After editing the config file, restart the daemon and check interface status:

```bash
pkill rnsd     # if already running as a daemon
rnsd           # restart in the foreground to watch for errors
```

In a second terminal:

```bash
rnstatus
```

Each configured interface should show as `UP`. For TCP interfaces, packet and byte counters will start climbing within a few seconds of connecting to ChiMesh. For RNode interfaces, counters climb when another node running the same frequency and parameters comes within radio range.

If an interface shows as `DOWN`, check the following:

- Correct port path (RNode) or hostname/IP (TCP)
- Frequency and bandwidth match between your node and the one you are trying to reach (RNode)
- Serial port permissions (see the `dialout` group tip above)

---

## Full Example Configuration

Here is a complete config for a node running an RNode for local radio coverage on the Chicagoland network and a TCP uplink to the ChiMesh relay:

```
[reticulum]
  enable_transport = False
  share_instance = True

[logging]
  loglevel = 4

[interfaces]
  [[RNode LoRa]]
    type = RNodeInterface
    enabled = yes
    port = /dev/ttyACM0
    frequency = 914875000
    bandwidth = 125000
    txpower = 22
    spreadingfactor = 8
    codingrate = 5

  [[ChiMesh Relay]]
    type = TCPClientInterface
    interface_enabled = True
    target_host = rns.chimesh.org
    target_port = 4242
```

---

## Next Steps

- See [Relay Setup](../relay.md) to connect to the ChiMesh relay
- See [Mistakes to Avoid](avoid-mistakes.md) for common configuration pitfalls
- See the [Reticulum Manual](https://reticulum.network/manual/) for the full interface and parameter reference
- Join the [Reticulum channel on the ChiMesh Discord](https://discord.com/channels/1218078395565608990/1349623850148823084) if you have questions or get stuck
- Join the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) for broader community help and configuration tips
