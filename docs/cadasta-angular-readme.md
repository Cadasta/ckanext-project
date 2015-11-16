#Cadasta Angular Applications
We use the Angular.js MVC framework for the development of the more complex pages/views in the Cadasta application; namely the organization and project dashboard views.
![Organization dashboard](https://github.com/Cadasta/ckanext-project/blob/master/docs/organization-dashboard.png?raw=true)

![Project dashboard](https://github.com/Cadasta/ckanext-project/blob/master/docs/project-dashboard.png?raw=true)

The highlighted sections of the page below indicate the outer-scope of the Angular application, which is rendered on the browser with the Angular application. The page skeleton and controls outside of that scope are rendered and controlled by the CKAN framework. All Angular application code is stored in the `public` directory.

Annotated structure of `public` directory:  


    |-- images # All images used by Angular apps
    |-- organization-dashboard # JavaScript, CSS, HTML specific to organization dashboard
    |-- project-dashboard # JavaScript, CSS, HTML specific to project dashboard
    |-- shared # custom code shared between project and organization dashboard apps
    |-- vendor # Third party code and libraries (Angular, UI-Router
    

The above directories constitute the "source" files for the Angular portions of the Cadasta application.  These source files need to be combined with a build script before they can be served (locally or remotely). 

##Install and build
####Dependencies
[Node.js](https://nodejs.org/en/) >= 0.10.24  
[Bower](http://bower.io/)  
[Grunt-CLI](https://github.com/gruntjs/grunt-cli)

Once the above dependencies are installed, update packages and libraries:


    # install node packages need for build
    > npm install
    
    # Make sure third party libraries are up-to-date
    > bower install
    
    
Build angular apps from source; provide valid [environment](https://github.com/Cadasta/ckanext-project/blob/master/environment-settings.js) inorder to connect to correct CKAN API.

    > grunt build --env <environment>
    
The Grunt "build" combines a number of tasks:  

1) Sets Angular constant used to access the CKAN pass-through API endpoints  

2) Bundles, minifies, and creates sourcemaps for JavaScript and CSS files. Resultant files are written to the `/ckanext/project/public/build` directory.

3) Adds a cache-breaking querystring to the HTML script includes that reference the above resources.  This is useful during development cycles - it ensures vistors to a staging deployment site are not using cached and potentially out of date JavaScript and CSS files.  
  
##Developing
All development needs occur on source files; never edit files in the `build` directory, as they will be lost on the next `grunt build`. To facilitate development, there is a Grunt `watch` task, which automates builds on every source file save.  To start the watch task:

    > grunt watch
    
Note that if you edit your Gruntfile to modify the build task, you will need to restart the watch for the changes to have an effect.


## Deployment

Note that the  `/ckanext/project/public/build` directory is `.gitignored` from the repository.  We don't want build artifacts to clutter the commit history. However, this means that you will need to run the Grunt build task on the deployment server.  This build task is part of the redeploy script.
