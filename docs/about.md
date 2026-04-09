---
tags:
  - Info
  - Getting Started
  - Meshtastic
  - MeshCore
hide:
  - navigation
---

# About

## What is Chicagoland Mesh?

We are a growing community of people working together to create an off-grid, 
decentralized, and resilient communications network using inexpensive LoRa 
devices. Operating within the unlicensed 915 MHz ISM band, these devices are 
typically loaded with either Meshtastic or MeshCore firmware, enabling users 
to communicate without using traditional networks.

The FCC allows people to operate on ISM frequencies without having any form of 
FCC-affiliated license (such as that required for Ham/Amateur Radio). However, 
the 902-928 MHz range in particular is special, because transmissions under 1 watt
over those frequencies can be encrypted, meaning your private messages will remain 
secure from prying eyes.

The purpose of Chicagoland Mesh is to expand coverage in our area and build out 
mesh networks to make them more usable. We currently have a number of nodes 
located in downtown Chicago and on top of other buildings out in the suburbs. We 
are always looking to expand our coverage and rely on ourselves and others who 
can get nodes in elevated places to join us in building our off-grid communications 
network.

<figure markdown="span">
  ![Community Upload](assets/images/node.jpg){ width=500 }
  <figcaption></figcaption>
</figure>

## What is Meshtastic?

[Meshtastic®](https://meshtastic.org) is a community project that allows 
anybody to communicate over LoRa radios, serving as a decentralized 
communications platform. Learn more about the inner workings through the
[documentation](https://meshtastic.org/docs/overview).

- Long range ([254km record by kboxlabs](https://meshtastic.org/docs/overview/range-tests/#current-ground-record-254km))
- Decentralized communication - no dedicated router required
- Encrypted communication
- Excellent battery life
- Send and receive text messages between members of the mesh
- Optional GPS based location features

## What is MeshCore?

[MeshCore](https://meshcore.io) is a similar project that aimed to address some
of the shortcomings Meshtastic had in larger networks. As networks grew, some
areas began to notice issues with message delivery reliability. This is because
Meshtastic was designed to be more peer-to-peer, which meant that by default all client
nodes would repeat messages (thereby flooding the mesh network). However, this,
coupled with the automatic sending of telemetry data, meant that the mesh network
was oftentimes flooded with traffic, causing a lot of packets/messages to get dropped.

MeshCore addresses this by relying on more defined repeater infrastructure. Messages
are sent from 'companion' nodes, which typically come in the form of standalone 
or BLE-connected devices that you use through your phone. Once they are sent, they go 
through a network of dedicated 'repeater' nodes, until they finally reach the recipient 
node. An initial message is sent in 'flood' mode, meaning all repeaters will repeat the 
message until the message reaches its destination. Once it is received, the repeater 
path it took will be retained on the device that sent the message, which enables future 
messages to be repeated only by repeaters defined on the path. 

Notably, the Pacific Northwest switched over to MeshCore, which has seen messages sent
from Vancouver with a received destination as far south as Eugene, Oregon! You can see
real-time nationwide network activity [here](https://analyzer.letsmesh.net/map).

## Meshtastic or MeshCore: What Should I Use?

Meshtastic began development in 2019, whereas MeshCore launched in 2025. As such, the 
former has a far more developed network. However, many high-traffic meshes are moving 
over to MeshCore to take advantage of the increased reliability for message delivery.
This does not make MeshCore better than Meshtastic, however! Meshtastic still has a very 
real use case for more rural areas, where you cannot expect to already have the established 
infrastructure that MeshCore requires. MeshCore also requires users to explicitly request 
telemetry data (like temperature, node position, etc.), so it may not be as well-suited for 
nodes that are meant to consistently track positions or sensor data.

Hopefully this provides some insight on what mesh network fits better for your use cases.
If you are still on the fence, feel free to host both firmware on separate devices, or
look into using a firmware like [LunarCore](https://github.com/STCisGOOD/lunarcore), which
enables you to use both protocols on certain supported boards.

## Getting Started

1. Join [our Discord](https://chicagolandmesh.org/discord)
2. Purchase [supported hardware](https://meshtastic.org/docs/hardware/devices) and [antenna](https://meshtastic.org/docs/hardware/antennas)
3. Flash your hardware with the [Meshtastic](https://flasher.meshtastic.org) or [MeshCore](https://flasher.meshcore.dev) firmware
4. Download the corresponding app for your firmware, then connect to your node.
(Meshtastic: [iOS](https://apps.apple.com/us/app/meshtastic/id1586432531) or [Android](https://play.google.com/store/apps/details?id=com.geeksville.mesh); MeshCore: [iOS](https://apps.apple.com/us/app/meshcore/id6742354151) or [Android](https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android))
5. Read the [getting started](guides/index.md) page for your respective protocol for more information
