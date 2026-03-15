---
title: Avoid these mistakes
tags:
  - Info
---

#### Do NOT power on your node without an antenna!
   Very self-explanatory, just don't try it! It can damage your node's LoRa chip permanently.

#### Avoid MQTT Downlink
   When you turn on MQTT Downlink it will flood the local mesh with packets from MQTT, greatly reducing network preformance. In addition, you are defeating the purpose of having an off-grid mesh network. It will publish every message sent from uplink back onto all the nodes which makes them potentially unusable. Please only keep uplink enabled on the Primary channel!

#### Mount antennas upright and minimize cable length between the node and antenna.
   Having your antenna in a vertical position at the highest possible level is the best case. Also, small adjustments such as keeping the cable connecting the antenna to the node as short as possible will help. Keeping the cable vertical and not bent will ensure you get the best connection possible; antennas with a hinge typically perform worse while bent.

#### Avoid sketchy batteries
   [18650 Batteries](https://en.wikipedia.org/wiki/18650_battery) are very common in Meshtastic builds for their large capacity and rechargability. They are lithium-ion batteries first created for use in laptops. Many fake or misleading manufacturers will sell batteries that are way above their capacity. Stick to name brands like *Samsung* or *Panasonic*. A big hint that a battery is fake is if the weight is under 40 grams.
   ![Fake 18650 Batteries](/assets/images/batteries.png)

#### Pay attention to SMA cables
   When you are purchasing SMA cables and adapters make sure you check the gender of the antenna and cables you're going to use. Mismatched connectors may cause permanent damage to your node, possibly leaving it unusable.

#### Avoid using stock Lilygo or Heltec antenna
   Using the stock antennas from Lilygo and Heltec devices will result in a massive performance loss because of their very high [SWR](https://en.wikipedia.org/wiki/Standing_wave_ratio). The lower SWR the better. We recommend checking out this [GitHub repository](https://github.com/meshtastic/antenna-reports) for choosing the best antenna for your node.

#### Set up an admin channel for remote nodes
   If you are deploying a node that won't be easily accessible, we recommend setting up the admin channel so you can control your node through another node wirelessly. Instructions for this are available [here](https://meshtastic.org/docs/configuration/remote-admin/).

#### Do not use the Router or Repeater roles without good reason
   The `Router` and `Repeater` roles should be reserved for nodes with exceptional placement. Nodes with these roles that are placed poorly (or, in a place that doesn't need another) can actually reduce the performance and reliability of the mesh. If you aren't entirely certain that your node is optimally placed *and* that a `router` or `repeater` isn't already nearby, you should use `Client`, `Client_Mute`, or ask for a second opinion in the discord.
