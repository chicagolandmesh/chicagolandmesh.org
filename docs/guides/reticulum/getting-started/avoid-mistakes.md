---
title: Reticulum Mistakes to Avoid
tags:
  - Info
  - Getting Started
  - Reticulum
---

# Reticulum Mistakes to Avoid

A collection of common pitfalls that trip people up when getting started with Reticulum and RNode hardware. Most of these are easy to avoid once you know about them.

---

#### Do NOT power on your RNode without an antenna connected

Seriously, do not do this. Transmitting into an open connector reflects RF energy back into the radio chip and can kill it permanently. Always attach your antenna before plugging in power, even for a quick test.

#### Make sure your antenna is for the right frequency band

A 915 MHz antenna will not work well on 868 MHz and vice versa. Running the wrong antenna raises your SWR, wastes transmit power, reduces range, and in bad cases can stress the RF hardware. Check the band printed on your antenna before connecting it and make sure it matches the frequency you have set in your config.

#### Avoid the stock antennas that come with Lilygo and Heltec devices

The small stub antennas bundled with boards like the T-Beam and LoRa32 are generally poor performers. Their SWR is high and they lose a surprising amount of signal compared to a proper antenna. If you want to compare SWR ratings across different antenna options, the [Meshtastic antenna reports repository](https://github.com/meshtastic/antenna-reports) has measured data on a wide range of antennas that can be useful as a reference. Just keep in mind it is a Meshtastic project so some of the context will not apply directly to Reticulum.

#### Mount your antenna vertically and as high as practical

LoRa is a line-of-sight and near-line-of-sight technology. Height genuinely matters. A node on a rooftop will reach much further than the same node sitting on a desk indoors. Point the antenna straight up, keep it away from metal surfaces, and get it as high as you reasonably can.

#### Keep coax cable runs short and avoid tight bends

Every meter of coax between your node and antenna costs you signal. Keep the run as short as possible and avoid sharp bends, especially right at the connector. Antennas with a hinged or flexible base typically perform worse when bent sideways compared to when they are pointing straight up.

#### Watch your SMA connector genders when buying cables and adapters

SMA connectors come in male and female variants, and the center pin orientation also matters. Forcing mismatched connectors together can damage the pin or the connector body and leave your node unusable. Before ordering any cable or adapter, check the gender on both ends of what you already have.

#### Make sure your frequency and bandwidth match the nodes you want to reach

This is one of the most common reasons people cannot see any traffic from nearby nodes. Both ends of a LoRa link must be set to exactly the same frequency, bandwidth, and spreading factor or they will not hear each other at all. There is no error message when this happens, packets just disappear. Double-check your config against whoever you are trying to connect with.

#### Do not enable transport mode unless your node is meant to be infrastructure

Transport mode turns your node into a relay that forwards traffic for the whole mesh. That is useful for a fixed node with good placement, but on a mobile device or a battery-powered sensor it burns extra CPU and memory keeping routing tables that you probably do not need. Leave `enable_transport = False` on personal end nodes.

#### Back up your identity before reinstalling or wiping your system

Your Reticulum identity, which is your address on the network, lives in `~/.reticulum/` on Linux and macOS or `%APPDATA%\Reticulum\` on Windows. If you wipe that directory you will get a new identity and anyone who had your old address saved will no longer be able to reach you. Copy the directory somewhere safe before doing any system work.

#### Do not run multiple daemons pointing at the same config directory

If you start `rnsd` twice against the same config, the second instance will fail or behave strangely. Check whether the daemon is already running before starting it again, especially if you are writing startup scripts or systemd units.

#### On Linux, sort out serial port permissions before you need them

If your RNode shows up in `dmesg` but `rnsd` cannot open the port, the fix is usually:

```bash
sudo usermod -a -G dialout $USER
```

Log out and back in after running this. It is worth doing this the first time you connect any serial hardware so it is not a surprise later.

#### Use quality USB cables for serial connections

A charge-only USB cable has no data lines and will not work for serial communication with your RNode. If `rnsd` cannot see the device at all, try a different cable before assuming the hardware is faulty. A bad or marginal cable can also cause intermittent disconnects that are hard to diagnose.

#### Do not rely on UDP broadcast for connectivity across routers

The local UDP interface only works within a single network segment. It will not reach nodes on a different subnet or across the internet. If you need wider connectivity, add a `TCPClientInterface` to a community node or a friend's relay alongside your UDP interface.

---

If you run into something not covered here, you can ask in the [Reticulum Matrix room](https://matrix.to/#/#reticulum:matrix.org) or in the [Reticulum channel on the ChiMesh Discord](https://discord.com/channels/1218078395565608990/1349623850148823084). Both are good places to get help.
