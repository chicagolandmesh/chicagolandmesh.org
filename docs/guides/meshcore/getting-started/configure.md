---
tags:
  - Info
  - Getting Started
  - MeshCore
---

# Configuring MeshCore

## Initial Configuration

1. Power on your device after flashing
2. Visit the [MeshCore Configuration Tool](https://config.meshcore.io) in your web browser
3. Connect to your device using one of the available methods:
    - USB serial connection (recommended for initial setup)
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

```bash
set timezone America/Chicago
```

```bash
set path.hash.mode 2
```

```bash
set advert.interval 240
```

## Node Role

Choose the configuration that matches your node's role.

### Companion Node

A companion node travels with you and does **not** repeat traffic.

```bash
set repeat off
```

```bash
set flood.advert.interval 168
```

```bash
reboot
```

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

## Channels

MeshCore supports named channels that allow you to communicate with specific groups
of users. Channels use a shared secret key for encryption. Anyone with the same
key can send and receive messages in that channel.

### How Channel Names Become Secret Keys

When you create or join a channel by name, MeshCore automatically derives a secret
key from that name using a cryptographic hash function. This means:

- The channel name is run through a one-way algorithm that always produces the
  same fixed length key for a given name
- Anyone who enters the same channel name on their device gets the **identical
  secret key**, no manual key sharing required
- `#chicago` will always generate `c1c289b131e5222370cbc2048445844b`, on every
  device, every time
- You cannot reverse the key back to the channel name

This is why sharing a channel name is equivalent to sharing access, the name
**is** the key, just in human readable form.

!!! warning "Security Consideration"
    Because channel keys are derived from names, anyone who guesses or knows your
    channel name can join it. For sensitive communications, share the **secret key
    directly** rather than using a guessable name.

### Adding a Channel

1. Open the MeshCore app menu
2. Navigate to **Add Channel → Scan QR Code** (or enter the secret key manually)
3. Enter the channel name or paste the secret key
4. Tap **Add**, your device will derive or store the key and join the channel

### Popular Community Channels

The following channels are commonly used in the MeshCore community. You can add
them by entering the channel name (MeshCore will derive the key automatically)
or by entering the secret key directly.

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

!!! tip "Chicago / ChiMesh Community"

    If you're part of the Chicagoland mesh network, start with **`#chicago`** and
    **`#chimesh`** to connect with local operators. **`#emergency`** is also
    recommended so you're reachable during urgent situations.

!!! info "Channel vs. Default Channel"

    Your device always has a default channel based on its radio preset. Named
    channels are **additional** layers, you can monitor multiple channels
    simultaneously depending on your firmware and hardware.

!!! info "Preset Selection"

    When configuring your Meshcore device, look for the `USA/Canada` preset in your configuration interface. This preset automatically applies all the correct radio parameters for optimal performance in North America.
