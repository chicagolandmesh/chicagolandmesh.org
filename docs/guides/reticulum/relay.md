---
title: Reticulum Relay Setup
tags:
  - Info
  - Relay
  - Reticulum
---

# Reticulum Relay Setup

## What is a Relay?

A Reticulum relay (configured via the `TCPServerInterface` and `TCPClientInterface`) is a TCP node in the Reticulum Network Stack that bridges isolated mesh networks by tunneling traffic over standard TCP/IP networks, such as the internet.

Because Reticulum is completely medium-agnostic, it can pass its cryptographically secure data packets through radios, serial cables, or standard internet lines seamlessly. A TCP relay acts as an internet-facing gateway to link local radio or LAN setups to a global network.

---

## Connecting to the ChiMesh Relay

ChiMesh runs a public Reticulum relay at `rns.chimesh.org` on port `4242`. Connecting to it is a single block in your `[interfaces]` section:

```toml
[[ChiMesh]]
  type = TCPClientInterface
  interface_enabled = True
  target_host = rns.chimesh.org
  target_port = 4242
```

Once the daemon restarts, your node will dial out to ChiMesh and stay connected. You do not need to do anything else to start exchanging traffic with other nodes on the mesh.

To verify it connected, run:

```bash
rnstatus
```

The `ChiMesh` interface should show as `UP` and the packet counters should start climbing within a few seconds.

---

## Verifying the Relay

Start or restart the daemon after editing your config:

```bash
pkill rnsd     # if already running as a daemon
rnsd           # restart in the foreground to watch for errors
```

In a second terminal:

```bash
rnstatus
```

All interfaces should show as `UP`. The `TCPServerInterface` will show connected clients once someone dials in. Check that transport is active by looking in the `rnsd` output.
