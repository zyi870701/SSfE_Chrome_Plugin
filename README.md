Full Page Screen Capture to SafeSync - a Google Chrome Extension
=======================
### Description:
It is a Google Chrome plugin which could capture web full page screenshots and upload to SafeSync personal folder.

### Open source used:
1. https://github.com/mrcoles/full-page-screen-capture-chrome-extension
2. License:MIT

### SafeSync REST API v2 used:
* POST /api/v2/usersession
* GET /api/v2/home
* PUT /api/v2/${obf_id}/snapshots/${file_name}



Full Page Screen Capture
========================

A simple Google Chrome extension that takes a screen capture of a full web page. Every extension I tried couldn’t do this on Chrome 22 on Mac OSX Lion. So, I built this one to reliably do it. (Not tested, yet, on any other configurations.)

### To Install

From the webstore:

Find the [Full Page Screen Capture App](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl) in the Chrome Webstore and click install.

Or, for development:

1. Clone this repo
2. Open up Chrome and go to the extensions page (Window → Extensions)
3. Enable developer mode (if it’s not already)
4. Click on “Load unpacked extension…”
5. Select the folder for this app


### Extra notes:

*   Please report any bugs that you find as issues on the project
*   More details on [this blog post](http://mrcoles.com/full-page-screen-capture-chrome-extension/)
*   Thank you to [terrycojones](https://github.com/terrycojones) & [gleitz](https://github.com/gleitz) for contributions!
