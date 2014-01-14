/*
* Cloud Storage
* Copyright (C) Codexa Organization 2013.
*/

'use strict';


/* Variables
------------------------*/
// Namespace
var cloud = {};


/* Cloud
------------------------*/
cloud.init = function () {
  // Dropbox
    // Error Handler
    cloud.dropbox.auth.onError.addListener(function (error) {
      if (window.console) {
        console.error(error);
        cloud.dropbox.error(error);
      }
    });

    if (!cloud.dropbox.client) {
      // Auth
      cloud.dropbox.auth.authenticate(function(error, client) {
        console.log("ASD1")
//        if (!error && client) {
//          // Set client
//          cloud.dropbox.client = client;
//
//          // Code to get dropbox files
//          updateDocLists();
//
//          // Show UI elements
//          welcomeDropboxArea.style.display = 'block';
//          openDialogDropboxArea.style.display = 'block';
//          locationDropbox = document.createElement('option');
//          locationDropbox.textContent = 'Dropbox';
//          locationSelect.appendChild(locationDropbox);
//
//          // Dispatch auth event
//          window.dispatchEvent(cloud.dropbox.auth.onAuth);
//
//          // This is a workaround for a very weird bug...
//          setTimeout(updateAddDialog, 1);
//        } else {
//          // Hide/Remove UI elements
//          welcomeDropboxArea.style.display = 'none';
//          openDialogDropboxArea.style.display = 'none';
//          if (locationDropbox) {
//            locationSelect.removeChild(locationDropbox);
//            locationDropbox = undefined;
//          }
//        }
      });
    } 

//  updateAddDialog();
};

