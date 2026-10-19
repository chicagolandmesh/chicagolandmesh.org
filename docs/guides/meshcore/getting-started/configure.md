---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Configuring MeshCore

## What to Deploy

If you're new to ChiMesh and not sure what to set up, the **ideal starting deployment** is:

- A **repeater on your roof** (or as high as you can get it) to maximize line of sight coverage
- A **companion node** for day to day messaging indoors and outdoors

Line of sight is king in LoRa mesh networking. Walls, floors, and buildings dramatically reduce range. A rooftop repeater gets you above the obstructions and provides a strong signal path to your companion indoors, as well as connecting you to the broader mesh. This matters especially in dense urban environments where buildings block signals that would otherwise reach you more easily in the suburbs.

## Companion vs. Repeater/Room Server

How you configure your node depends heavily on its **role**:

- **Companion nodes** are configured entirely through the MeshCore companion app over Bluetooth. There is no USB configuration step, and there is no CLI available during normal use. Most of the settings below apply only to repeaters and room servers.
- **Repeater and Room Server nodes** are typically configured via USB serial connection using the [MeshCore Configuration Tool](https://config.meshcore.io), especially for initial setup. CLI commands are available through the Remote Management interface.

If you're setting up a companion, skip the USB and CLI sections below.

## Initial Configuration

This section covers configuration via the [MeshCore Configuration Tool](https://config.meshcore.io) web interface, which applies to repeaters and room servers. Companion nodes are configured through the MeshCore app instead and do not need these steps.

1. Power on your device after flashing
2. Visit the [MeshCore Configuration Tool](https://config.meshcore.io) in your web browser
3. Connect to your device via USB serial connection
4. Configure basic settings through the web interface:
    - Set your node name (consider adding "ChiMesh.org" to help identify our community)
    - Location (optional)
    - Set an admin password so you can manage your node remotely over the mesh
    - Go to "Radio Settings" and set "Preset" to "USA/Canada (Recommended)"

## Radio Settings

Configure your device using the **USA/Canada (Recommended)** preset, which includes the following settings:

| Setting | Value |
|---|---|
| Frequency | `910.525 MHz` |
| Bandwidth | `62.5 kHz` |
| Spreading Factor | `7` |
| Coding Rate | `5` |
| TX Power | `22 dBm` |
| Path Hash Size | `3-byte` |

**Coding Rate (CR)** controls how many forward error correction bits are packed into each transmission. It is the only radio parameter that can differ between nodes and still allow them to communicate with the rest of the mesh. A higher CR improves reliability but uses more airtime.

If you are running a repeater and your nearest repeater neighbors are at the edge of your range, consider temporarily raising the CR to `8` to improve link reliability. As repeater density in your area grows, bring it back down to `5` to reduce airtime and keep the channel clear for other traffic.

## Required Commands

### Companion Node

A companion node travels with you and does **not** repeat traffic. Companions are configured through the companion app UI, the CLI commands used for repeaters are **not available** on companion nodes during normal use.

### Repeater Node

An infrastructure or well placed node repeats traffic to extend network coverage.

```
set path.hash.mode 2
```
```
set repeat on
```
```
set advert.interval 240
```
```
set flood.advert.interval 72
```
```
reboot
```

## Channels

MeshCore supports named channels that allow you to communicate with specific groups of users. Channels use a shared secret key for encryption. Anyone with the same key can send and receive messages in that channel.

### How Channel Keys Work

There are two types of channels:

**Hash channels** (names beginning with `#`): When you create or join a channel by name, MeshCore automatically derives a secret key from that name using a cryptographic hash function. This means:

- The channel name is run through a one-way algorithm that always produces the same fixed-length key for a given name
- Anyone who enters the same channel name on their device gets the **identical secret key**, no manual key sharing required
- `#chicago` will always generate `c1c289b131e5222370cbc2048445844b`, on every device, every time
- You cannot reverse the key back to the channel name

This is why sharing a hash channel name is equivalent to sharing access, the name **is** the key, just in human-readable form.

**Private channels**: You can also create a truly private channel, which generates a **random secret key** that is not derived from the name. This key must be shared manually between users (e.g., via QR code or direct copy). Private channels cannot be joined by name alone.

!!! warning "Security Consideration"
    Because hash channel keys are derived from their names, anyone who guesses or knows your channel name can join it. For sensitive communications, use a **private channel** and share the secret key directly out-of-band.

### Adding a Channel

1. Open the MeshCore app menu
2. Navigate to **Add Channel → Scan QR Code** (or enter the secret key manually)
3. Enter the channel name or paste the secret key
4. Tap **Add**, your device will derive or store the key and join the channel


### Popular Community Channels

The following channels are commonly used in the MeshCore community. Hash channels can be added by entering the channel name (MeshCore will derive the key automatically) or by entering the secret key directly.

#### General
| Channel Name | Secret Key |
|---|---|
| `Public` | `8b3387e9c5cdea6ac9e5edbaa115cd72` |
| `#public` | `8b4b705b080c0d943b1c80f6b3ef6b6d` |
| `#chat` | `d0bdd6d71538138ed979eec00d98ad97` |
| `#emergency` | `e1ad578d25108e344808f30dfdaaf926` |

!!! warning "`#public` is not the same as `Public`"
    `#public` is a separate hash channel, not the default public channel. If you're looking for the general public channel, use **`Public`** instead.

#### Chicagoland Mesh
| Channel Name | Secret Key |
|---|---|
| `#chimesh` | `869d8ae6f43e99f7ef463027f916f1fc` |
| `#chicago` | `c1c289b131e5222370cbc2048445844b` |
| `#chiburbs` | `ffddd5192d876065d28a42b497b4e791` |

#### Suburban Regional Channels
| Channel Name | Secret Key |
|---|---|
| `#suburbs` | `428a0416c430927e63d01a5da35839f0` |
| `#northburbs` | `8335ac4590c5e47efc45d0f95a433416` |
| `#nshore` | `5e4dc642ec1c7567f58e8356201de580` |
| `#neburbs` | `17f8d36fd0c91a6008288b4326b08926` |
| `#nwburbs` | `988239d85dac1c5f3805976b4fae1e17` |
| `#westburbs` | `61cf1c9e7fccc2df4704864ccf8fe306` |
| `#swburbs` | `b9aa614333e2383a86ed37ad6526e709` |
| `#sburbs` | `082d9d3715d0e3653d80b084ee38679a` |
| `#seburbs` | `2a9cace768a60a58c08ee6f759d9c114` |
| `#farwestburbs` | `80cd1dba03cd70ac219407d31350c6c2` |
| `#farnorthburbs` | `0d2351fe272dff112e1c0980f813424d` |
| `#farsouthburbs` | `ace50fc831bccd92f26c1529e3adc4d5` |

#### County Channels
| Channel Name | Secret Key |
|---|---|
| `#cookcounty` | `0325125fe35567cc44bacf6bed8747fb` |
| `#dupage` | `29893bd700fc28e878e3faf033aa0d1a` |
| `#lakecounty` | `aa0d82401f5248f1402efab7cfa8743e` |
| `#mchenry` | `8cabc659654f9b371b9f10dd536a92d2` |
| `#willcounty` | `5ac5b043654b75ef16862c62bb583ac7` |
| `#kanecounty` | `35c830c021c8267cbcaf78328a71ca13` |

#### Major Suburb Channels
| Channel Name | Secret Key |
|---|---|
| `#ohare` | `75171a1192199de69a1cb68538489713` |
| `#schaumburg` | `03506f1f6255407bfd51739824f990fa` |
| `#palatine` | `2c2ef48c1034ceb82d4e7456dc5d692e` |
| `#arlingtonheights` | `51a3252d4a107edfcfb7daf71dbc7302` |
| `#desplaines` | `6cc55a6ffadb9102dee1fb20cf3a8501` |
| `#parkridge` | `63b43e6ae3a60bd7695a1e19de92428e` |
| `#evanston` | `da0851fb40af46f0971b706deec90265` |
| `#skokie` | `b3cdbec50e68a2c6245dcf513082ee4d` |
| `#oakpark` | `cf7f4fce87765243fe99b69a16ae959e` |
| `#naperville` | `3405955be42130e6338bde9dda18cc3b` |
| `#aurora` | `93a0a08ff5e86e68b230c2e132207a99` |
| `#joliet` | `f1fc221b83ba81e4114618ab863ece8a` |
| `#orlandpark` | `16944fdecdc038ff77981a3b66f2eeb9` |
| `#tinleypark` | `b0a2b9789509e6d29cfa97007c15f58c` |
| `#calumet` | `6341c757a8ce2bd3e2fad5d37d8f3dbe` |

#### Chicago Citywide Regions
| Channel Name | Secret Key |
|---|---|
| `#downtown` | `31aaffc36782c7761c8d93dd06686510` |
| `#loop` | `d41673eb4bae7c3955eb55928783a515` |
| `#southloop` | `6acb46b1e07ea6056ab5b4615212872b` |
| `#westloop` | `72a79d0a6e492381ce453f075df3a629` |
| `#rivernorth` | `92fd3daf899e3c62c366c564c4cb6e11` |
| `#streeterville` | `7a0dc413b942fa7b47c06c15311bb154` |
| `#northside` | `b9053b9857296c9d1dfd5f965f377a5f` |
| `#southside` | `d340bf424024085c02a4f7bc685894d2` |
| `#westside` | `5127c8d00849a07ccefc637d2b8240f3` |
| `#farnorthside` | `713ac0d13c5d4a3b23e81c2e67c8d061` |
| `#northwestside` | `9ac489ff2888fbc97c33d6306f051fed` |
| `#southwestside` | `58eef26ba16e46fc2e6145d380db595d` |

#### Chicago Neighborhood Channels
| Channel Name | Secret Key |
|---|---|
| `#rogerspark` | `c9e39971ac4f87a14fbc87da700333ec` |
| `#edgewater` | `b86cfccf50667c18a4b48c594b63e818` |
| `#uptown` | `7aaddabc2da74d9ed96bc7e8afca2865` |
| `#lakeview` | `5f4d004f197b5f9c405b215a46f85351` |
| `#lincolnsquare` | `c04b65a0b106e4c8a04d0353ac1418d8` |
| `#lincolnpark` | `1ad0f01425fde9010a0adf6c2e86aa6e` |
| `#logansquare` | `f86bb01d438b9aa41e5b10f78d790f6a` |
| `#wickerpark` | `2ae7ad0c9e7128635dbf4549befaf8dd` |
| `#pilsen` | `d415c8dcd0375b543edeb8251143bc5c` |
| `#bridgeport` | `f4b709be70846add2fcccc714df68bc1` |
| `#hydepark` | `33ac60900b41276707b74b37a240c222` |
| `#bronzeville` | `4774acf59e75d2323316a0d657351819` |
| `#chatham` | `990bd6e3162c7e1947a0d25fd58afaa9` |
| `#englewood` | `57cefd0b689344f2bf3d21f8c8fc577f` |

#### Interests
| Channel Name | Secret Key |
|---|---|
| `#hamradio` | `83c8b01997654265938da8765cbc7db9` |
| `#jokes` | `abe610d61dee508c0ac18793c36c41c3` |
| `#weather` | `88f502554fee92a1625cfb311546e7cb` |

#### Chicago Sports
| Channel Name | Secret Key |
|---|---|
| `#sports` | `e8ee81f3aabf105d9ba2d2d4bd94fe4a` |
| `#cubs` | `567f84d8cd91406e7d84f962dc810522` |
| `#whitesox` | `adeb8f2ea5cca1624bbeb684821dc846` |
| `#bears` | `e328bd6007f137d540491e0b98c0ef49` |
| `#bulls` | `1e223bd0935a1983832435b8b876f97d` |
| `#blackhawks` | `8f84f0a243ad2854c923d154d9c7fbe5` |
| `#sky` | `caa8572648096df8de3f4aafb0677f04` |

#### Chicago Topical Channels
| Channel Name | Secret Key |
|---|---|
| `#chicagoweather` | `c06411af759fc5d9d2d20629a31687ca` |
| `#chicagotraffic` | `93c7e543cf5a2c658dc81e9a1655400c` |
| `#chicagoevents` | `12535a3f2b86d9164f1d849feb26ea5d` |
| `#chicagotransit` | `3c1ebfb8d64affbcb375e6f31c5fcc48` |
| `#chicagomesh` | `67d450fe27ca22c062d33d1f7311a8e4` |
| `#chicagotech` | `9d7b23a57de521d424b41c130cc45bce` |

#### Utility & Testing
| Channel Name | Secret Key |
|---|---|
| `#bot` | `eb50a1bcb3e4e5d7bf69a57c9dada211` |
| `#test` | `9cd8fcf22a47333b591d96a2b848b73f` |
| `#healthcheck` | `3ae59c2cda86744c75e68b3975a902ae` |
| `#wardriving` | `e3c26491e9cd321e3a6be50d57d54acf` |
| `#chimesh-observer-alert` | `5223d5371c7c13c349341d5f9537a555` |

!!! tip "Chicago / ChiMesh Community"
    If you're part of the Chicagoland mesh network, start with **`#chicago`** and **`#chimesh`** to connect with local operators. **`#emergency`** is also recommended so you're reachable during urgent situations.

!!! tip "Testing your connection"
    When you first come online and want to check if you're being heard, **use the `#test` channel** rather than `Public`. Sending "can you hear me?" or "Test" to `Public` will spam people's nodes with unnecessary messages and reduce network performance.

!!! info "Channel vs. Default Channel"
    Your companion device will always have the default Public channel active. Named channels are additional layers on top of this. The number of channels you can monitor at once depends on your hardware's storage capabilities. The MeshCore app will show the maximum number of channels your device supports (40 for most devices).

!!! info "Preset Selection"
    When configuring your MeshCore device, look for the `USA/Canada` preset in your configuration interface. This preset automatically applies all the correct radio parameters for optimal performance in North America.
