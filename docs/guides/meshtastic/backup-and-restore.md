---
tags:
  - Info
  - Meshtastic
  - Backup
---

# Backing Up and Restoring a Meshtastic Configuration

It is a good idea to create a fresh backup before updating firmware, factory resetting a node, or making major configuration changes. Meshtastic configurations can be backed up to a YAML file using the Meshtastic Python CLI. This makes it much easier to restore your settings after flashing, resetting, or replacing a node.

## Requirements

You will need:

* A computer with Python installed
* A USB data cable
* Your Meshtastic node connected to the computer by USB
* The Meshtastic Python CLI

## Install the Meshtastic CLI

Open **Command Prompt**, **PowerShell**, or a terminal and run:

```bash
pip install "meshtastic[cli]"
```

If Meshtastic is already installed, you can update it with:

```bash
pip install --upgrade "meshtastic[cli]"
```

Verify that the CLI is working:

```bash
meshtastic --help
```

## Back Up Your Configuration

Connect your Meshtastic node to your computer using USB.

Open a terminal in the folder where you want to save the backup and run:

```bash
meshtastic --export-config > meshtastic-backup.yaml
```

Normally, the Meshtastic CLI will automatically find a connected node. If you have multiple serial devices connected, you can specify the port manually.

For example, on Windows:

```bash
meshtastic --port COM5 --export-config > meshtastic-backup.yaml
```

!!! note
    Replace `COM5` with the COM port assigned to your Meshtastic device. You can find the port in **Windows Device Manager** under **Ports (COM & LPT)**.

The CLI will connect to the Meshtastic node and save its configuration to:

```text
meshtastic-backup.yaml
```

Keep this file somewhere safe.

!!! warning
    Meshtastic configuration backups contain sensitive information such as channel names and encryption keys. Treat the backup file as private and avoid sharing it publicly.

## Restore Your Configuration

Connect the Meshtastic node you want to restore to your computer.

Navigate to the folder containing your backup file and run:

```bash
meshtastic --configure meshtastic-backup.yaml
```

The CLI will read the YAML file and apply the configuration to the connected node.

Allow the process to finish before disconnecting or restarting the device.

!!! tip
    After restoring the configuration, reconnect to the node with the Meshtastic app and verify important settings such as your channels, LoRa configuration, device role, and node name.
