###Notes for Angular App Development

App needs to be build before serving correctly:

    npm install
    
    grunt build --env staging
    
You can execute the above "build" task to run whenever you edit one of the angular app related files:

    grunt watch:code --env staging
    
If you have to add new script files to the app, add them to the file array in the "uglify" task of the Gruntfile.js.

If you have to add new stylesheet files to the app, add them to the file array in the "cssmin" task of the Gruntfile.js.

Any edits to Gruntfile.js require that you kill and restart the "watch" task noted above.


### Notes on Deployments
Once the new code is in proper location on the server, you would do the following (assuming it is the staging deployment):

    npm install
    
    grunt build --env staging
    
    sudo service apache2 reload