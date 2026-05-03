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

We are a growing community of people working together to create an off-grid, decentralized, and resilient communications network using inexpensive LoRa devices. Operating within the unlicensed 915 MHz ISM band, these devices are typically loaded with either MeshCore or Meshtastic firmware, enabling users to communicate without using traditional networks.

The FCC allows people to operate on ISM frequencies without having any form of FCC-affiliated license (such as that required for Ham/Amateur Radio). However, the 902-928 MHz range in particular is special, because transmissions under 1 watt over those frequencies can be encrypted, meaning your private messages will remain secure from prying eyes.

The purpose of Chicagoland Mesh is to expand coverage in our area and build out mesh networks to make them more usable. We currently have a number of nodes located in downtown Chicago and on top of other buildings out in the suburbs. We are always looking to expand our coverage and rely on ourselves and others who can get nodes in elevated places to join us in building our off-grid communications network.

<figure markdown="span">
  ![Community Upload](assets/images/node.jpg){ width=500 }
  <figcaption></figcaption>
</figure>

## What is MeshCore?
[MeshCore](https://meshcore.io) is a similar project to Meshtastic that aimed to address some of the shortcomings Meshtastic had in larger networks. As networks grew, some areas began to notice issues with message delivery reliability. This is because Meshtastic was designed to be more peer-to-peer, which meant that by default all client nodes would repeat messages (thereby flooding the mesh network). However, this, coupled with the automatic sending of telemetry data, meant that the mesh network was oftentimes flooded with traffic, causing a lot of packets/messages to get dropped.
MeshCore addresses this by relying on more defined repeater infrastructure. Messages are sent from 'companion' nodes, which typically come in the form of standalone or BLE-connected devices that you use through your phone. Once they are sent, they go through a network of dedicated 'repeater' nodes, until they finally reach the recipient node. An initial message is sent in 'flood' mode, meaning all repeaters will repeat the message until the message reaches its destination. Once it is received, the repeater path it took will be retained on the device that sent the message, which enables future messages to be repeated only by repeaters defined on the path.
Notably, the Pacific Northwest and various other US mesh groups switched over to MeshCore, For example the PNW group has seen messages sent from Vancouver with a received destination as far south as Eugene, Oregon! You can see real time nationwide network activity [here](https://analyzer.letsmesh.net/map).
- Dedicated repeater infrastructure for improved reliability
- Encrypted communication
- Path-based routing after initial flood discovery
- Send and receive text messages between members of the mesh
- BLE-connected or standalone companion node support

## What is Meshtastic?
[Meshtastic®](https://meshtastic.org) is a community project that allows anybody to communicate over LoRa radios, serving as a decentralized communications platform. Learn more about the inner workings through the [documentation](https://meshtastic.org/docs/overview).
- Decentralized communication - no dedicated router required
- Encrypted communication
- Excellent battery life
- Send and receive text messages between members of the mesh
- Optional GPS based location features

## Meshtastic or MeshCore: What Should I Use?

Meshtastic began development in 2019, whereas MeshCore launched in 2025, giving Meshtastic a significant head start in network development and community adoption. That said, if you are in a large city like Chicago, MeshCore is probably the better pick. High traffic urban meshes benefit a lot from MeshCore's improved message delivery reliability, and the infrastructure density of a city like Chicago means you can actually take full advantage of what it has to offer. MeshCore also uses smaller packet sizes than Meshtastic, which improves overall performance and reduces collisions on busy networks, making it especially well suited for dense urban environments.
Meshtastic is still the go-to for camping trips, rural areas, or small group meshes where you can't count on any pre-existing infrastructure. Its more established ecosystem and self-contained nature make it great for off-grid use. One other thing worth knowing is that MeshCore requires users to explicitly request telemetry data like temperature and node position. So if your use case involves passively tracking locations or pulling sensor readings on a regular basis, Meshtastic is probably still the better fit for that.

Hopefully this provides some insight on what mesh network fits better for your use cases. If you are still on the fence, feel free to host both firmware on separate devices, or look into using a firmware like [LunarCore](https://github.com/STCisGOOD/lunarcore), which enables you to use both protocols on certain supported boards.

## Getting Started

1. Join [our Discord](https://chicagolandmesh.org/discord)
2. Purchase [supported hardware](https://www.rfindex.com/mesh/devices) and [antenna](https://www.rfindex.com/mesh/antennas)
3. Flash your hardware with the [MeshCore](https://flasher.meshcore.dev) or [Meshtastic](https://flasher.meshtastic.org) firmware
4. Download the corresponding app for your firmware, then connect to your node (MeshCore: [iOS](https://apps.apple.com/us/app/meshcore/id6742354151) or [Android](https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android); Meshtastic: [iOS](https://apps.apple.com/us/app/meshtastic/id1586432531) or [Android](https://play.google.com/store/apps/details?id=com.geeksville.mesh)).
5. Read the [getting started](guides/index.md) page for your respective protocol for more information
