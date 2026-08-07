---
tags:
  - MQTT
  - Info
  - MeshCore
---

# Setting up a MeshCore Observer

## What is a MeshCore Observer?

A MeshCore Observer is a MeshCore node (repeater, room server, or companion device) that listens to nearby mesh traffic and reports what it hears to an MQTT broker over the internet. ChiMesh uses observer data to power network analysis, coverage mapping, and reliability reporting across the Chicagoland area via [CoreScope](../../corescope/index.md), [Chicagoland MeshCore Live Map](https://live.chimesh.org), and the [ChiMesh Discord MeshCore MQTT Feed](https://discord.com/channels/1218078395565608990/1510490462283370758). Observers can be configured to share only advertisement packets, enough to appear on the node map, without exposing the contents of other traffic. You can stop sharing data at any time.

!!! info "Hardware Requirements"
    Observer firmware is only available for **supported devices**. Check that your hardware is compatible before proceeding. Not all MeshCore devices support the packet logging firmware required for this setup.

!!! warning "Use Repeater mode whenever possible"
    Do **not** use Room Server unless you have a specific reason. It limits mesh participation and provides no benefit over Repeater in most scenarios. If you are unsure which role is right for your setup, ask in the [ChiMesh Discord](https://chimesh.org/discord) before proceeding.

## Choose Your Setup Method

There are four ways to run an Observer:

| Method | Best for |
|---|---|
| [Native Observer Firmware](#method-1-native-observer-firmware) | Devices that support the MQTT observer firmware natively |
| [Computer Bridge (mctomqtt)](#method-2-computer-bridge-usb-raspberry-pi) | Repeater or Room Server connected to a Raspberry Pi or Linux device via USB |
| [Companion Bridge](#method-3-companion-bridge) | Companion nodes, uses different bridge software configured via the Observer Flasher |
| [openHop Repeater](#method-4-openhop-repeater-advanced) | **Advanced users** — Raspberry Pi or Linux SBC running the openHop Repeater daemon |

---

## Method 1: Native Observer Firmware

### Step 1: Download and Flash the Firmware

#### Fresh Install

Use the [MeshCore MQTT Observer Flasher](https://observer.gessaman.com/) to find, download, and flash the correct firmware for your device. This is an online flasher, select your device variant and follow the prompts to flash directly from your browser.

!!! danger "Merged files will erase everything on your device"
    Files labeled **-merged** perform a **full flash erase** and are for **fresh installs only**. Flashing a merged file onto a device that already has MeshCore will wipe all settings, keys, and configuration. If you are updating an existing install, always select the **non-merged** variant.

#### Updating via OTA

!!! tip "You can also update using the OTA update command"
    From the Command Line under Remote Management, run `ota update` to trigger an over-the-air update directly without needing the steps below.

If you already have MeshCore running, you can update wirelessly using the companion app and a web browser instead of the web flasher and USB:

1. **Download the App Firmware**
    - Before starting the OTA process, visit the [MeshCore Observer Flasher](https://observer.gessaman.com/)
    - Select your device, and use the **Download** button to download the **app firmware** option
    !!! warning "Do not use a merged file"
        This variant does **not** erase your flash and is safe for updating an existing install. Do not use a merged file, it will wipe all your settings.
2. **Open Remote Management**
    - Open the MeshCore companion app
    - Select your node from the contacts list or map
    - Scroll down and tap **Remote Management**
    - Enter the **admin** password when prompted
3. **Launch the Command Line**
    - Tap **Command Line** in the middle of the bottom footer
    - Enter `start ota`
    - Click Enter on your keyboard
4. **Navigate to the OTA Upload Page**
    - If your node is **not** connected to Wi-Fi, it will broadcast a `MeshCore-OTA` hotspot instead, connect to that and go to `http://192.168.4.1/update`
    - If your node is already connected to Wi-Fi, it will stay on your existing network:
        - Check your node's display for the IP address or if your node does not have a screen, check your router's DHCP table to find the IP address assigned to your node
        - Open a browser and go to `http://<node-ip>/update` (e.g. `http://192.168.1.42/update`)
5. **Upload the Firmware**
    - Select and upload your downloaded `.bin` file
    - Wait for the update to complete
6. **Verify the Update**
    - Reopen the companion app
    - Confirm the firmware version under Remote Management

### Step 2: Apply ChiMesh Observer Settings

Once your firmware is installed, open the **Command Line** under Remote Management and enter the following commands:

```
set timezone America/Chicago
```
```
set path.hash.mode 2
```
```
set advert.interval 240
```
```
set mqtt.iata ORD
```
```
set mqtt1.preset analyzer-us
```
```
set mqtt2.preset chimesh
```

!!! tip "If the chimesh preset isn't working, set the connection details manually:"
    If your firmware version does not have presets or you wish to manually configure the connection details, use the following commands. Run `get mqtt2.diag` to verify the connection after setup.
    ```
    set mqtt2.server wss://mqtt.chimesh.org
    ```
    ```
    set mqtt2.port 443
    ```
    ```
    set mqtt2.audience mqtt.chimesh.org
    ```
    ```
    set mqtt2.preset custom
    ```

```
set mqtt.rx on
```
```
set mqtt.tx advert
```
```
set wifi.ssid your-wifi-network
```
```
set wifi.pwd your-wifi-password
```

!!! note
    Replace `your-wifi-network` and `your-wifi-password` with your real Wi-Fi credentials. **Do not wrap them in quotes**.

```
set bridge.enabled on
```
```
set flood.advert.interval 72
```
```
set radio.watchdog 60
```
```
set mqtt.neighbors on
```

!!! tip "If this node is a dedicated observer only (does NOT repeat):"
    Turning repeat off is for dedicated observers only. If this node is also serving as a mesh repeater, make sure you run the `set repeat on` command and consider using a lower flood.advert.interval value (72 or 48).
    ```
    set repeat off
    ```
    ```
    set flood.advert.interval 168
    ```

!!! example "Optional (but encouraged), set to your companion device's public key:"
    Replace `your-primary-companion-device-pub-key` with your companion device's actual public key. This helps to correlate repeaters with their owner for better analytics in the [analyzers](../../corescope/index.md).
    ```
    set mqtt.owner your-primary-companion-device-pub-key
    ```

```
reboot
```

### Step 3: Configure Observer Alerts (Optional)

!!! note
    Observer alerts require **firmware version 1.16 or later**, available from [observer.gessaman.com](https://observer.gessaman.com/). Full alert documentation is at [observer.gessaman.com/docs](https://observer.gessaman.com/docs?doc=ALERTS.md).

The ESP32-native MQTT observer firmware can alert you over the LoRa network if it encounters Wi-Fi or broker connectivity issues. Alerts are sent as flooded channel messages to either a hashtag channel or a private channel of your choosing.

#### Choose an Alert Channel

If you choose to use the shared hashtag channel `#chimesh-observer-alert`, no setup required on the channel itself. Set your companion to receive messages on `#chimesh-observer-alert`.

If you prefer to use your own private channel, create a private channel via the mobile app, then use the share option on the channel to copy the secret hex key to your clipboard. Save the secret somewhere safe (e.g. a password manager) in case you need to restore it later or add it to a new companion device.

#### Configure Alerts

From the Command Line, run the commands for whichever channel option you chose:

**If using the ChiMesh hashtag channel (recommended):**
```
set alert.hashtag #chimesh-observer-alert
```

**If using your own private channel:**
```
set alert.psk <secretkey>
```

Then, regardless of which option you chose:
```
set alert.wifi 10
```
```
set alert.mqtt 30
```
```
set alert on
```

Once configured, use the `alert test` command to immediately send a test message and confirm your companion can receive alerts from the firmware:
```
alert test
```

---

## Method 2: Computer Bridge (USB + Raspberry Pi)

### Requirements

- Any supported MeshCore repeater or room server node with **existing firmware**
- A Linux device (Raspberry Pi or similar) with internet access
- USB connection between the node and the Linux device

### Step 1: Get Compatible Firmware

Your node needs firmware that includes **packet logging** support. Use the [MeshCore Observer Flasher](https://observer.gessaman.com/) to find and flash the appropriate firmware for your device variant.

### Step 2: Connect and Run the Install Script

With your node connected to your Linux device via USB, run the following from your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/Cisien/meshcoretomqtt/main/install.sh | bash
```

When prompted by the install script, **select the LetsMesh and ChiMesh presets**.

!!! note
    During setup, you will be asked to enter an **IATA airport code** for your region. For the Chicago area, use `ORD`. Make sure to use the correct IATA code, it is not the same as an ICAO code.

!!! note
    It may take up to **5 minutes** after your observer first connects before it appears in the Observers list. Your node must have an advertisement heard before it will show up in the map or dropdown, but packet data will still be recorded in the meantime.

---

## Method 3: Companion Bridge

Unlike repeater or room server nodes, companion observers don't require special firmware. Your standard MeshCore companion build supports packet logging. This method uses **different bridge software** than mctomqtt and runs on a macOS or Linux device connected to your companion via USB, BLE, or Wi-Fi.

### Requirements

- A macOS or Linux device (e.g., Raspberry Pi) with internet connectivity
- A MeshCore companion device accessible via USB, BLE, or Wi-Fi

### Step 1: Install Node.js LTS

First, install NVM (Node Version Manager):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Close and reopen your terminal, or run the following to activate it immediately:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Then install Node.js LTS:

```bash
nvm install --lts
```

### Step 2: Run the Install Script

From your macOS or Linux machine, run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/agessaman/meshcore-packet-capture/main/install.sh)
```

!!! note
    `meshcore-packet-capture` is for **companion nodes only**. If you have a repeater or room server, use [Method 2](#method-2-computer-bridge-usb-raspberry-pi) instead.

The installer will set up packet capture support for BLE, TCP, and Wi-Fi connections to your companion device.

### Step 3: Configure ChiMesh MQTT

When prompted during setup, select `chimesh` from the available presets. The installer will configure the connection details automatically.

For more details, see the [meshcore-packet-capture README](https://github.com/agessaman/meshcore-packet-capture). For help, reach out on the [ChiMesh Discord](https://chimesh.org/discord) or the [MeshCore Discord](https://meshcore.gg/).

!!! tip "If the chimesh preset isn't working, set the connection details manually:"
    - Server:  `wss://mqtt.chimesh.org`
    - Port: `443`
    - Audience: `mqtt.chimesh.org`

!!! note
    It may take up to **5 minutes** after your observer first connects before it appears in the Observers list. Your node must have an advertisement heard before it will show up in the map or dropdown, but packet data will still be recorded in the meantime.

---

## Method 4: openHop Repeater (Advanced)

!!! warning "This method is for advanced users"
    openHop Repeater requires Linux command-line familiarity, manual YAML configuration, and hardware setup. If you are not comfortable with these, use one of the methods above instead. For help, ask in the [ChiMesh Discord](https://chimesh.org/discord) before proceeding.

[openHop Repeater](https://docs.openhop.dev/projects/openhop-repeater/what-is-openhop-repeater/) is a Python-based MeshCore repeater daemon that runs on Linux and publishes to MQTT natively through its `config.yaml`. It supports direct SPI LoRa HATs, USB modem boards (ESP32/nRF52 running openHop Modem firmware), and TCP-connected modems, and can operate as a dedicated observer that uploads packet activity and mesh health to MQTT without needing the standard MeshCore firmware or any bridge script.

### Requirements

- A Raspberry Pi or other Linux SBC with internet access
- A supported LoRa radio
    - SPI HAT (e.g., Waveshare SX1262 HAT, meshadv, meshadv-mini) connected directly to the Pi
    - ESP32 or nRF52 board flashed with [openHop Modem firmware](https://flasher.openhop.dev/) connected over USB-CDC or TCP
    - CH341 USB-to-SPI adapter wired to an SX1262 module (e.g., for Proxmox LXC deployments)

### Step 1: Install openHop Repeater

```bash
git clone https://github.com/openhop-dev/openhop_repeater.git
cd openhop_repeater
sudo bash ./manage.sh install
```

The installer will create the config directory at `/etc/openhop_repeater/`, install the application to `/opt/openhop_repeater/`, launch an interactive setup wizard for radio hardware selection, and install and enable the `openhop-repeater` systemd service.

Follow the wizard prompts to select your hardware type and radio preset. For USB modem boards, select the `pymc_usb modem (USB-CDC)` option. For Wi-Fi or Ethernet modems, select `pymc_tcp modem`. For a direct SPI HAT, select `sx1262`.

### Step 2: Configure ChiMesh MQTT

Open `/etc/openhop_repeater/config.yaml` and update the `mqtt_brokers` section:

```yaml
mqtt_brokers:
  iata_code: "ORD"
  status_interval: 300
  owner: ""
  brokers:
    - preset: letsmesh

    - name: chimesh
      enabled: true
      host: mqtt.chimesh.org
      port: 443
      transport: websockets
      audience: mqtt.chimesh.org
      use_jwt_auth: true
      tls:
        enabled: true
```

!!! note
    Replace `iata_code` with the appropriate IATA airport code for your area. For the Chicago area, use `ORD`.

!!! example "Optional (but encouraged), set your owner public key:"
    The `owner` field links your observer to your primary companion device for better analytics in the [analyzers](../..//analyzers/index.md). Replace the empty string with your companion device's public key.
    ```yaml
    mqtt_brokers:
      owner: "your-primary-companion-device-pub-key"
    ```

### Step 3: Apply ChiMesh Mesh Settings

In the same `config.yaml`, set the following under the `mesh` section:

```yaml
mesh:
  unscoped_flood_allow: true
  path_hash_mode: 2
  loop_detect: minimal
```

And under `repeater`, set a reasonable advert interval:

```yaml
repeater:
  send_advert_interval_hours: 4
```

### Step 4: Restart and Verify

```bash
sudo systemctl restart openhop-repeater
sudo journalctl -u openhop-repeater -f
```

The web dashboard is available at `http://<repeater-ip>:8000` and shows connection status, packet history, and MQTT broker state.

!!! note
    It may take up to **5 minutes** after your observer first connects before it appears in the Observers list. Your node must have an advertisement heard before it will show up in the map or dropdown, but packet data will still be recorded in the meantime.

For full configuration options, see the [openHop Repeater Configuration Reference](https://docs.openhop.dev/projects/openhop-repeater/config-file/). For help, reach out on the [Discord](https://chicagolandmesh.org/discord).

---

## Additional Notes

- These settings are required to appear on ChiMesh(Core) services
- `set mqtt2.preset chimesh` is what connects your observer to the ChiMesh network specifically while `set mqtt1.preset analyzer-us` is what connects your observer to the global [LetsMesh analyzer](https://analyzer.letsmesh.net) and the [official MeshCore map](https://map.meshcore.io)
- The `mqtt.owner` field is optional but highly encouraged, it links your observer to your primary companion device

Thank you for supporting [ChiMesh.org](https://chimesh.org), we hope to see you on MeshCore MQTT!
