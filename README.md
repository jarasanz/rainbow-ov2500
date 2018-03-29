# Daneel bot

This Node.js app shows how to integrate two ALE ([Alcatel-Lucent Enterprise](https://www.al-enterprise.com/)) tools:
- **Rainbow**, the CPaaS platform
- **OmniVista2500**, the Network and Identity Management system for LAN (OmniSwitch) and WLAN (OmniAccess)

The basic idea is people in a Bubble (Rainbow term for a chat group), can interact with **Daneel Bot**, asking Daneel to create users in OmniVista 2500 (OV2500) UPAM (the Identity Management System), so provisioned users can use SSIDs with 802.1X authentication.

The human interacting with Daneel, can be seen as a **sponsor** asking for credentials for a visitor/guest.

IT Department can allow some Rainbow users in the corporation to have access to Daneel.

The Bot is connected to the Corporate Rainbow space, and IT manager creates a Bublble to include Daneel Bot.

## Interacting with Daneel bot:

Daneel will listen to request coming from sponsors:

- Username: u:username starts the process... Daneel waits for the password... or will timeout.
  - Example: `u:username1`

- Password: 
  - p:password, manually introduced password
Example: `p:password2018`
  - p:w , Daneel will generate a weak password, suited for humans
Example: `p:w`
  - p:s , Daneel will generate a strong password, for positronic androids, or paranoid humans...
Example: `p:s`

- Cancel Operation: c:
  - Example: `c:`

- Help: h:
  - Example: `h:`

- Delete a user: d:username
  - Example: `d:username1`

The program use Rainbow Node.js SDK and OV2500 RESTful API.

This program is distributed as is. Use it, modify or distribute, but please mention the author.
