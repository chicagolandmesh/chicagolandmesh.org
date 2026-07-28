---
tags:
  - Info
  - Advanced
  - MeshCore
---

# Advanced Firmware Options

## EasySkyMesh: Power Saving Firmware

[EasySkyMesh](https://github.com/IoTThinks/EasySkyMesh) is a community project that provides optimized MeshCore firmware builds with power saving features, sensor integration, and experimental bug fixes ahead of the upstream MeshCore releases.

### What It Offers

- **PowerSaving firmware**: Reduces idle current draw significantly (as low as 15 mA on ESP32 BLE companions) while maintaining full mesh functionality
- **Sensor support**: Attach environmental or infrastructure sensors to repeater nodes and transmit readings over the existing MeshCore network
- **Early features**: Changes developed here are submitted upstream to the main MeshCore project

### Flashing EasySkyMesh Firmware

1. Download the appropriate firmware binary from the [EasySkyMesh Releases page](https://github.com/IoTThinks/EasySkyMesh/releases)
2. Follow the [Flash custom firmware instructions](https://github.com/IoTThinks/EasySkyMesh/blob/main/firmware/Instruction-to-flash-firmware.md) for your specific board
3. If you want to add sensors to a repeater node, see the [Add sensors to repeaters guide](https://github.com/IoTThinks/EasySkyMesh/blob/main/firmware/Add-sensors-to-repeaters.md)

!!! info "Feature Suggestions"
    You can request specific features or ask for pre-built binaries for your board in the [EasySkyMesh Discussions](https://github.com/IoTThinks/EasySkyMesh/discussions/categories/ideas).

## OTAFIX Bootloader (nRF52 Devices)

[Adafruit_nRF52_Bootloader_OTAFIX](https://github.com/oltaco/Adafruit_nRF52_Bootloader_OTAFIX) is an enhanced bootloader for nRF52840-based MeshCore devices (RAK4631, Heltec T114, XIAO nRF52840, T1000-E, ProMicro NRF52840, and others). It fixes common OTA update issues and improves DFU reliability.

### Supported Boards

- Elecrow ThinkNode M1, M3, M6
- Heltec Automation Mesh Node T114
- LilyGO T-Echo
- Nologo ProMicro NRF52840 (SuperMini NRF52840)
- RAK 4631 / RAK WisMesh Tag
- Seeed Studio T1000-E, SenseCAP Solar Node P1, Wio Tracker L1
- Seeed Studio XIAO nRF52840 BLE / SENSE

### Key Improvements Over Stock Bootloader

- **Defaults to OTA DFU mode** when no valid application is present, preventing devices from getting stuck in UF2 mode after a failed OTA update
- **Maximum BLE TX power** (+8 dBm on nRF52840) for improved OTA range and reliability
- **High-MTU BLE support** for faster OTA transfers on Android and compatible hosts
- **Automatic reboot** into the application after a successful OTA update over USB (no manual reset needed)
- **Board-specific BLE advertising names** in DFU mode (e.g. `RAK4631` advertises as `4631_DFU`, ProMicro as `PROM_DFU`)

### Installing the Bootloader

!!! warning "Erase required for MeshCore/Ripple firmware"
    If your device is currently running MeshCore companion firmware or Ripple firmware, **you must run an erase after flashing the new bootloader**. Use the MeshCore web flasher for this — it will guide you to the correct erase firmware. Other erase tools will not erase the ExtraFS area and will leave your device in a broken state.

1. Download the `update-*.uf2` file for your board from the [OTAFIX Releases page](https://github.com/oltaco/Adafruit_nRF52_Bootloader_OTAFIX/releases)
2. Enter UF2 mode on your device by **double-pressing the reset button within 0.5 seconds** — your device should appear as a USB drive
3. Copy the UF2 file onto the mounted drive — the device will flash and reboot automatically

!!! tip "XIAO nRF52840 BLE variant check"
    Many XIAO boards ship with the **Sense** bootloader variant pre-installed. To check: enter UF2 mode, open `INFO_UF2.TXT` on the drive. If it shows `Board-ID: nRF52840-SeeedXiaoSense-v1`, install the **SENSE** variant of the OTAFIX bootloader, not the plain BLE variant.

### Performing an OTA Update

Use the **nRF Device Firmware Update** app ([Android](https://play.google.com/store/apps/details?id=no.nordicsemi.android.dfu) / [iOS](https://apps.apple.com/sa/app/device-firmware-update/id1624454660)) or **nRF Connect** ([Android](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp) / [iOS](https://apps.apple.com/gb/app/nrf-connect-for-mobile/id1054362403)).

Recommended settings for OTAFIX 2.0+:

| Setting | Value |
|---|---|
| Packet Receipt Notification (PRN) | ON |
| Number of packets | 30 |
| Reboot time | 0 ms |
| Scan timeout | 2000 ms |
| Request high MTU | ON for Android / not available on iOS |
| Disable resume | ON |
| Prepare object delay | 0 ms |
| Force scanning | ON |
| Keep bond | OFF |
| External MCU DFU | OFF |

!!! tip "OTA on a MeshCore repeater"
    Log into your repeater via the Remote Management CLI and run `start ota` first. Then open the nRF Device Firmware Update app, select the appropriate MeshCore firmware zip, and connect to your device (advertised as `RAK4631_OTA`, `ProMicro_OTA`, etc.).

!!! warning "OTA fails with 'Error: Operation Failed'"
    If the transfer fails early, try disabling **Request High MTU** and experiment with different PRN values (12, 8, 1, or off). Some Android BLE stacks don't handle high MTU well.

### Device Not Appearing as USB Drive or Serial Port

After flashing OTAFIX 2.0+, if your device doesn't show up as a drive or serial port, it is likely waiting in **OTA DFU mode** (the default when no application is present). No UF2 drive or serial port is exposed in this state.

To exit OTA DFU mode and enter UF2/serial mode: **double-press the reset button**.
