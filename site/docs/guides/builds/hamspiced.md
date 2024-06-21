# Meshtastic Build Variants
## _Node Building by Style_

[![Hamspiced - Github](https://img.shields.io/badge/Hamspiced-Github-2ea44f)](https://github.com/hamspiced)


With the array of different meshtastic devices available we are going to rein in the focus on the most reliable power saving options currently available and create a list of build options based off of them.  Basic hardware that will be needed for each device will be:

- [Rakwireless Wisblock Starter Kit] - $36.97
- [Project Box] - $9.99
- [Waterproof SMA to IPEX Connector] - 8.99 x2
- [Dual 18650 Battery Holder] - $9.99 x 6
- [RakWireless Carrier Board] - Free (3d printed)

This brings your base node cost to $65.90 starting.   Builds will be listed below based on use-case and functionality.  Also note that in all the pricing models, many of the items are sold in sets, so you get multiple items per build.  For transparency we will list the cost to get the items to you.  So future builds will likely cost less per build because you already have extras of certain items.

>Note:  This guide assumes you have already flashed your RakWireless Wisblock with the most current Beta software available and have setup the Admin Channel for remote administration.  If you have not done that please click here to setup your node.  

>WARNING: NEVER POWER ON A MESHTASTIC DEVICE WITHOUT AN ANTENNA ATTACHED. YOU WILL KILL THE NODE

# Solar Nodes

- Set and Forget
- Remote Administration
- Year-Round Functionality
- Placed high or in inconspicuous locations


Solar nodes are arguably the best option for maximum coverage within the mesh.  With the ability to be mounted anywhere with a variety of mounting options you can maximize your mesh with the addition of these units.  We will cover the setup of 2 common style nodes and price breakdowns.

For each Solar Node you need to determine if you want a Jpole Mounted Build or a regular mounted build.  The size and type of Antenna.  Lastly you will need a solar charge controller.
- Mount Style 
  - [J-Pole] - $17.50
  - [Mounting Bracket] - $15.59 x2
- Antenna
  - [5.8db Antenna] - $33.00
  - [3db Antenna] - $54.97
  - [Yagi Antenna] - $ 64.97
- [Solar Charge Controller] - $11.99


## J-pole Builds
   
A J-Pole is an angled pole that is mounted to a structure.  The node is then mounted to a J-Pole.  This is usually for houses or structures that allow the node to clear overhand obstructions.
   
## Flat Mounted Builds
   
These can be mounted flat to a structure like a wall, or mounted with Ubolts around a tree.  The main difference with this build style is you do not have the ability to tilt your solar panel like you would with a Jpole build.
   
# Building your Node
  
## J-Pole
   
For this build we will utilize the following:
- [Rakwireless Wisblock Starter Kit] - $36.97
- [Project Box] - $9.99
- [Waterproof SMA to IPEX Connector] - 8.99
- [Dual 18650 Battery Holder] - $9.99 
- [USB Solar Panel] - $12.99
- [RakWireless Carrier Board] - Free (3d printed)
- [J-Pole] - $17.50
- [5.8db Antenna] - $33.00
- [Type N to SMA Cable] - $9.99 
- [Solar Charge Controller] - $11.99
- [Ubolt Bracket] - Free (3d Printed)

If you want this device to have telemetry data to report Air Quality, Temperature, and Barometric Pressure we reccomend the [Environment Sensor] Module from RakWireless $21.97.  You will also need a Vent.  You can use the Cable gland that comes with the project boxes reccomended in this guide alongside this [3d printed Vent]

Total Build Cost: $151.41 $173.37 with Environment Sensor

Tools Needed:

- Drill
- 3/4" Drill bit
- 4mm drill bit
- Silicone Sealant
- Phillips Screw Driver
- 10mm Hex Driver
- 4mm Wrench

1. First secure your Wisblock and Charge controller to the Rak Carrier Board
2. Locate the area you want to install your antenna on the project box.  All project box holes should be drilled on the bottom of the project box.  Mark hole and drill with a 1/4" drill bit
3. If you are using the environment sensor locate the hole position for the sensor.  Mark hole and drill with a 3/4" Drill bit
4. On the Lid of the project box, find center and mark an area for the solar panel controller to fit through so the pancel can sit flush.  this is a 2"x 1.5" rectangle.  Cut out rectangle with an ocilating tool.
5. Locate Mounting Bracket Holes on Project Box.  
6. Drill Bracket Holes in Project Box using 1/4" Drill bit
7. Apply Silicone to Bolts and secure to Mounting Bracket
6. Apply Silicone sealant around the Solar Panel hole and in a circular pattern around the lid of the project box
6. Secure the solar panel to the lid of the project box threading the solar panel cables through the hole.  
7. Let dry 12hrs to cure silicone
8. Secure wisblock and charge controller to the carrier board
9. Bend Tabs of the 18650 battery holder and solder jumpers to either end of the pads.  
10. Run cables from positive and negative of battery to positive and negative B- and B+ of charge controller
11. Run USB From Solar panel to charge controller
12. Run Positive and Negative cables from Rak Wireless JST Cable to L+ and L- of charge controller
13. Attach and Secure IPEX to SMA cable from Rak Wireless board to Project Box.  
14. Attach BT Antenna to Rak Wireless Nodes BT IPEX Connector
15. Attach Type N Cable to Antenna and secure to SMA connector on Project Box
16. Use Ubolt to attack Antenna and Project Box to Jpole
17. Attach Jpole Bracket to side of structure.
18. Position Jpole upright. 
19. Position Project box and Solar array to point up facing South (North if you are in the South)


   [5.8db Antenna]:<https://store.rokland.com/collections/802-11ah-wi-fi-halow/products/5-8-dbi-n-male-omni-outdoor-915-mhz-antenna-large-profile-32-height-for-helium-rak-miner-2-nebra-indoor-bobcat>
   [3db Antenna]:<https://store.rokland.com/collections/802-11ah-wi-fi-halow/products/3-dbi-rak-brand-fiberglass-outdoor-antenna-bracket-mount-for-rak-bobcat-sensecap>
   [Yagi Antenna]:<https://store.rokland.com/products/12-dbi-aya-9012-alfa-network-n-female-directional-yagi-outdoor-iot-915-mhz-antenna>
   [Solar Charge Controller]:<https://www.waveshare.com/solar-power-manager-d.htm>
   [USB Solar Panel]:<https://www.amazon.com/dp/B099RSLNZ4?ref=ppx_yo2ov_dt_b_product_details&th=1>
   [Mounting Bracket]:<https://www.amazon.com/dp/B0CN3DMVRR?ref=ppx_yo2ov_dt_b_product_details&th=1>
   [J-Pole]:<https://www.amazon.com/dp/B08HVV46KR?ref=ppx_yo2ov_dt_b_product_details&th=1>
   [RakWireless Carrier Board]:<https://www.thingiverse.com/thing:6504138>
   [Ubolt Bracket]:<https://www.thingiverse.com/thing:6595042>
   [Waterproof SMA to IPEX Connector]: <https://www.amazon.com/dp/B09N3JXCLF?ref=ppx_yo2ov_dt_b_product_details&th=1>
   [project box]: <https://www.amazon.com/dp/B08KY7VK8W?psc=1&ref=ppx_yo2ov_dt_b_product_details>
   [Environment Sensor]:<https://store.rokland.com/collections/sensors/products/rak-wireless-rak1906-wisblock-environment-sensor-bosch-bme680>
   [3d printed vent]:<https://www.thingiverse.com/thing:6550827>
   [Rakwireless Wisblock Starter Kit]: <https://store.rokland.com/products/rak-wireless-wisblock-meshtastic-starter-kit>
   [Dual 18650 Battery Holder]: <https://www.amazon.com/dp/B0B9XFG3P7?ref=ppx_yo2ov_dt_b_product_details&th=1>
   [Type N to SMA Cable]: <https://www.amazon.com/dp/B097GFY8LG?psc=1&ref=ppx_yo2ov_dt_b_product_details>
  