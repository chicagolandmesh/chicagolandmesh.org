---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Configuring MeshCore

## Companion vs. Repeater/Room Server

How you configure your node depends heavily on its **role**:

- **Companion nodes** are configured entirely through the MeshCore companion app over Bluetooth. There is no USB configuration step, and there is no CLI available during normal use. Most of the settings below apply only to repeaters and room servers.
- **Repeater and Room Server nodes** are typically configured via USB serial connection using the [MeshCore Configuration Tool](https://config.meshcore.io), especially for initial setup. CLI commands are available through the Remote Management interface.

If you're setting up a companion, skip the USB and CLI sections below — they don't apply to you.

---

## Initial Configuration

1. Power on your device after flashing
2. Visit the [MeshCore Configuration Tool](https://config.meshcore.io) in your web browser
3. Connect to your device using one of the available methods:
    - USB serial connection (recommended for initial setup of repeaters/room servers)
    - Bluetooth pairing (if using BLE companion firmware)
4. Configure basic settings through the web interface:
    - Set your node name (consider adding "ChiMesh.org" to help identify our community)
    - Location (optional)
    - Change the admin password
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
| Airtime Factor | `1` |

## Required Commands

!!! note "Repeater and Room Server nodes only"
    The commands below are entered via the CLI (Command Line Interface) under Remote Management. **These commands do not apply to companion nodes.** Companions have no periodic adverts, and path hash mode is configured through the **Experimental Settings** menu in the companion app.

```bash
set path.hash.mode 2
```

```bash
set advert.interval 240
```

```bash
set timezone America/Chicago
```

!!! note
    `set timezone` only applies to the **MQTT observer firmware**. It has no effect on mainline MeshCore firmware or the LetsMesh firmware used with mctomqtt. If you are not running MQTT observer firmware, you can skip this command.

## Node Role

Choose the configuration that matches your node's role.

### Companion Node

A companion node travels with you and does **not** repeat traffic. Companions are configured through the companion app UI, the CLI commands used for repeaters are **not available** on companion nodes during normal use.

For companions, **path hash mode** is found under the **Experimental Settings** menu in the app, and there are no periodic advertisement intervals to configure.

### Infrastructure / Well-Placed Node

An infrastructure or well-placed node repeats traffic to extend network coverage.

```bash
set repeat on
```

```bash
set flood.advert.interval 72
```

```bash
reboot
```

---

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
4. Tap **Add** — your device will derive or store the key and join the channel

### Popular Community Channels

The following channels are commonly used in the MeshCore community. Hash channels can be added by entering the channel name (MeshCore will derive the key automatically) or by entering the secret key directly.

| Channel Name | Secret Key |
|---|---|
| `Public` | `8b3387e9c5cdea6ac9e5edbaa115cd72` |
| `#public` | `8b4b705b080c0d943b1c80f6b3ef6b6d` |
| `#chat` | `d0bdd6d71538138ed979eec00d98ad97` |
| `#chicago` | `c1c289b131e5222370cbc2048445844b` |
| `#chimesh` | `869d8ae6f43e99f7ef463027f916f1fc` |
| `#emergency` | `e1ad578d25108e344808f30dfdaaf926` |
| `#hamradio` | `83c8b01997654265938da8765cbc7db9` |
| `#jokes` | `abe610d61dee508c0ac18793c36c41c3` |
| `#sports` | `e8ee81f3aabf105d9ba2d2d4bd94fe4a` |
| `#test` | `9cd8fcf22a47333b591d96a2b848b73f` |
| `#weather` | `88f502554fee92a1625cfb311546e7cb` |

!!! tip "Chicago / ChiMesh Community"
    If you're part of the Chicagoland mesh network, start with **`#chicago`** and **`#chimesh`** to connect with local operators. **`#emergency`** is also recommended so you're reachable during urgent situations.

!!! tip "Testing your connection"
    When you first come online and want to check if you're being heard, **use the `#test` channel** rather than `Public`. Sending "can you hear me?" or "Test" to `Public` will spam people's nodes with unnecessary messages and reduce network performance.

    For a more reliable connectivity check, use the **[ChiMesh Healthcheck app](#)** (link coming soon). It automatically detects your signal and reports back how many observers heard your message — giving you a real picture of your coverage without needing anyone else to respond.

!!! info "Channel vs. Default Channel"
    Your device always has a default channel based on its radio preset. Named channels are **additional** layers, you can monitor multiple channels simultaneously depending on your firmware and hardware.

!!! info "Preset Selection"
    When configuring your MeshCore device, look for the `USA/Canada` preset in your configuration interface. This preset automatically applies all the correct radio parameters for optimal performance in North America.
