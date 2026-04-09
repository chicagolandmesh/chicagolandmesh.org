---
date:
  created: 2026-02-14
categories:
  - Fixed
authors:
  - obliqueyak
---

# Setting up a Meshtastic node on a Raspberry Pi Pico using Linux

From the Meshtastic Interest Group at [South Side Hackerspace:
Chicago](https://sshchicago.org/).

This build guide provides step-by-step instructions for flashing and setting up
a Raspberry Pi Pico Meshtastic node over a serial connection on a computer
running GNU/Linux.

<!-- more -->

For more information on specifications for the Raspberry Pi Pico and Meshstatic
see: <https://meshtastic.org/docs/hardware/devices/raspberrypi/pico/>.

## Prerequisites

### User Permissions

Make sure the user account you are using for setup is in the `dialout` group.
This will grant the user the necessary permissions to access serial ports.

To check if the user is already in the `dialout` group, run the following
command in the terminal:

```
groups <username>
```

To add a user to the dialout group, run the following command in the terminal:

```
sudo usermod -a -G dialout <username>
```

!!! info "Important"
    You will need to logout and log back in for the change to group permissions
    to take effect.

!!! tip
    Some Linux distributions may used the `uucp` group instead of `dialout`.
    [Arch Linux](https://wiki.archlinux.org/title/Users_and_groups#User_groups),
    for example, uses `uucp` rather than `dialout` for managing serial devices
    permissions.

### Hardware

- Raspberry Pi [Pico 1](https://www.raspberrypi.com/products/raspberry-pi-pico/)
  or [Pico 2](https://www.raspberrypi.com/products/raspberry-pi-pico-2/)
- [LoRa Node Module for Raspberry Pi Pico (SX126X) with
  Antenna](https://www.waveshare.com/pico-lora-sx1262-868m.htm)
- Micro-USB Cable
    - Note: the cable should be one that allows for data transfer

### Software

Download the Meshtastic firmware for the Pi Pico from <https://flasher.meshtastic.org/>:

1. Under "Select Target Device" select "Raspberry Pi Pico" or "Raspberry Pi Pico
   W" (located under "Community Supported Devices")

2. The "Firmware" option should populate with the most recent version of the
   Meshstatic firmware. If you want to select a different version, select it
   from the "Firmware" dropdown menu.

3. Click "Flash". There should be a changelog as well as some additional
   warnings and messages about the state of the firmware.q

4. Click "Continue".

5. There will be a list of steps. Click the "Raspberry Pi Pico - Download UF2"
   or "Raspberry Pi Pico W - Download UF2" depending on which Pico model you
   have.

The firmware file should now be downloaded onto your computer.

### Optional

Download the `flash_nuke.uf2` file:
<https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html#resetting-flash-memory>.

This file can be used to reset the Pico's flash memory which may be helpful for
troubleshooting issues with setup.

## Steps for Setting Up the Pico Node

!!! warning "WARNING"
    DO NOT CONNECT THE MESHTASTIC NODE TO POWER WITHOUT THE ANTENNA CONNECTED.
    DOING SO WILL DAMAGE THE ANTENNA.

### Flashing the Pico (Desktop Environment)

1. Connect the USB cable to the laptop or desktop.

2. Press and hold the BOOTSEL button on the Pico and plug the USB cable into the
   Pico.

3. The Pico should appear as a new drive mounted to the computer - something
   like "RPI-RP2".

4. Copy and paste the firmware file into this mounted drive.

The Pico should automatically reboot after adding the UF2 file.

### Flashing the Pico (Command Line Interface)

After connecting the Pico, run the following commands in the terminal to make
sure the Pico is connected and to locate the Pico in the file system:

`lsusb` ([list usb devices](https://man7.org/linux/man-pages/man8/lsusb.8.html))
to display information about USB devices.

The Pico should appear within a list of USB devices; for example:

```
Bus 001 Device 004: ID 2e8a:000a Raspberry Pi Pico
```

`lsblk` ([list block
devices](https://man7.org/linux/man-pages/man8/lsblk.8.html)) to display
information about "block devices" - i.e., storage hardware - on the computer.
The Pico should appear within the list of storage devices. In this example, the
Pico is listed as `sda1` under `sda`.

```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    1   128M  0 disk
└─sda1        8:1    1   128M  0 part /media/<username>/RPI-RP2
nvme0n1     259:0    0 119.2G  0 disk
├─nvme0n1p1 259:1    0   976M  0 part /boot/efi
├─nvme0n1p2 259:2    0 114.5G  0 part /
└─nvme0n1p3 259:3    0   3.8G  0 part [SWAP]

```

Note that for the purposes of copying files to devices, the Pico is technically
in the [/dev
directory](https://tldp.org/LDP/Linux-Filesystem-Hierarchy/html/dev.html) under
`/dev/sda1`.

Use the [`cp` command ](https://man7.org/linux/man-pages/man1/cp.1.html) to copy
the Meshtastic firmware file over to the pi:

```
cp <meshtastic-firmware-file>.uf2 /dev/sda1
```

The device should automatically reboot after the file is copied over.

Note: you made need to run the `cp` command as `sudo` if you receive a
"Permission denied" error. For example:

```
sudo cp <meshtastic-firmware-file>.uf2 /dev/sda1
```

### Setting up the Node

The Meshtastic Web Client requires a browser that allows the [Web Serial
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API). This API
allows a browser to communicate with serial devices.

A list of compatible browsers is available
[here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility).

Mozilla lists Google Chrome, Microsoft Edge, and Opera as compatible with the
Web Serial API. Other Chromium-based browsers - like Vivaldi or Chromium -
should also work.

After confirming your browser is compatible with the Web Serial API do the
following to connect your Pico node:

1. Open the Meshtastic Web Client: <https://client.meshtastic.org/>

2. Click the "+ New Connection" button.

3. Select the "Serial" option.

4. Select "New device".

    A dialog box should appear with a message stating something like:

    >"client.meshtastic.org wants to connect to a serial port"

    There should be a list of devices under something like "Pico (tty0 ACM0).

    !!! note
        If the device does not appear there may be an issue with your user
        permissions or the browser. Double-check the steps in [User
        Permissions](#user-permissions) and ensure you are using a broswer that is
        compatible with the Web Serial API.

5. Select the Pico from the options available and the Meshstatic Client should
   show your device is connected.


### Configuring the Node

Once the node is setup on the web client you should be able to follow the
initial configuration instructions provided by Meshtastic for setting up a node
using the web client:
<https://meshtastic.org/docs/getting-started/initial-config/>.
