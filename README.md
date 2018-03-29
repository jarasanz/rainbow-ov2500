# Daneel bot

This Node.js app shows how to integrate two ALE ([Alcatel-Lucent Enterprise](https://www.al-enterprise.com/)) tools:
(Alcatel-Lucent Enterprise) Rainbow with OmniVista2500.

The basic idea is people in a Bubble (Rainbow term), can interact with Daneel Bot, asking Daneel to create users in OmniVista 2500 (OV2500), so users can use SSID with 802.1X authentication.

The human interacting with Daneel, can be seen as a "sponsor" asking for credentials for a visitor/guest.

The Bot is connected to the Corporate Rainbow space, and IT manager creates a Bublble to include Daneel Bot.

Daneel will listen to request coming from sponsors:

Username: u:username starts the process... Daneel waits for the password... or will timeout.

Password: p:password, manually introduced password p:w , Daneel will generate a weak password, suited for humans p:s , Daneel will generate a strong password, for positronic androids, or paranoid humans...

Cancel Operation: c:

Help: h:

Delete a user: d:username

The program use Rainbow Node.js SDK and OV2500 RESTful API.

This program is distributed as is. Use it, modify or distribute, but please mention the author.
