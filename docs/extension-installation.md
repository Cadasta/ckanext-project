##Extension Installation

###Linux OS
Assuming you have already installed core CKAN, clone the extension repo:


    > cd /usr/lib/ckan/default/src
    
    # Clone the extentsion
    > git clone https://github.com/Cadasta/ckanext-project.git
    
    # Activiate Python virtual environment
    > ./usr/lib/ckan/default/bin/activate
    
    # Move into extension directory
    > cd ckanext-project


If this is a development-environment installation:

    # Setup the extenstion
    > python setup.py develop


Else, if this is a non-development (production, staging, etc) installation:


    # Setup the extenstion
    > python setup.py install

Modify your .ini file (development.ini, production.ini, etc).  

1. Add `cadasta_organization`,  `cadastaroles`, and `project` to the list of ckan.plugins.  
2. Add `ckanext.cadasta.api_url` and assign it the host:port of Cadasta Node API (ex., http:localhost:3000).  
3. Add `ckanext.cadasta.enforce_permissions` set it to `true`.

Finally, restart your CKAN server (paster, apache, etc.)


###Mac OSX 

The following docs demostrate how to edit code with Mac OSX IDEs, while having them served on ckan-chef virtual machine. See [link](http://) for details on using ckan-chef.

We pull the extensions into the VM via a shared folder that is accessible from both the host OS and the guest VM OS. That allows development of the extension's code on the host OS while allowing the VM to serve the code.

At ckan-chef repository root:  


    # make synced_folders directory if it doesn't already exist
    > mkdir synced_folders
    
    > cd synced_folders
    
    # Clone the extension
    > git clone https://github.com/Cadasta/ckanext-project.git


Modify the ckan-chef Vagrantfile by adding:

```
config.vm.synced_folder "synced_folders/ckanext-project", "/usr/lib/ckan/default/src/ckanext-project",
    id: "ckanext-project", 
    owner: "vagrant",
    group: "vagrant",
    mount_options: ["dmode=775","fmode=664"],
    create: false  
```

Then reload and SSH into VM:  


    > vagrant reload
    
    > vagrant ssh
    
    > cd /usr/lib/ckan/default/src/ckanext-project
    
    > ./usr/lib/ckan/default/bin/activate
    
    > python setup.py develop


Modify `/etc/ckan/default/development.ini`  

1.  Add `cadasta_organization`,  `cadastaroles`, and `project` to the list of ckan.plugins.  
2.  Add `ckanext.cadasta.api_url` and assign it the host:port of Cadasta Node API (ex., http:localhost:3000).
3.  Add `ckanext.cadasta.enforce_permissions` set it to `true`.



Serve the CKAN application:

    paster serve /etc/ckan/default/development.ini


You should be able to view the application by pointing a browser on your host OS to http://localhost:5000.
