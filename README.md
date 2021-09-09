# Broadcast Files

"Broadcast Files" allows a user to have chosen folders accessible through a private server. The folders can either be
available to all, or require a login to be viewable. It supports multiple users, each with their own customizable level 
of access to the computer's files. The server is hosted on the clients machine and communication is done over http. All 
traffic is encrypted in transit.

## How to Run

* Clone to repo

* `npm i`

* Create config file that details accessible folders, users, and who has access to what

* To start, run command in base directory `./node_modules/.bin/ts-node index.ts`

#### Config Example

<pre><code>
{
  "routes": [
    {
      "canDownload": true,
      "canStream": true,
      "filePath": "D:\\Movies",
      "label": "Movies",
      "urlPath": "movies"
    },
    {
      "canDownload": ["stream"],
      "canStream": ["stream"],
      "filePath": "D:\\Shows",
      "label": "Shows",
      "urlPath": "shows"
    }
  ],
  "users": [
    {
      "username": "lschpmn",
      "permissions": ["stream"]
    }
  ]
}
</code></pre>

Example config that shows the "Movies" folder to all users that arrive at the site. The "Shows" folder isn't shown to all 
users, but instead is only available to the user lschpmn. 

## Encryption

The server creates a public/private keypair on initial startup. It embeds the public key into the html page for the client.
The front end also generates its own public/private keypair on load. The public key is sent to the server in the `x-crypto-key`
header. 

##### Encryption Disclaimer

I added encryption to this project because it was fun, not so much to actually secure it. My current implementation is done 
solely over http. This leaves my application completely wide open for MiTM attacks. As such, I don't recommend its use for 
anything deemed sensitive. This is still in the "fun personal project" stage and not ready for production security concerns. 
