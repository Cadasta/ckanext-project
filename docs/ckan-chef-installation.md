# CKAN Core Installation as Virtual Machine

This is the way that some of the OKFN developers set up a dev environment using VirtualBox and Vagrant.  This creates an Ubuntu 12.04 VM running Postgres 9.4, Solr, Jetty, CKAN (master) and Datastore. Excerpted from OKFN docs [here](https://github.com/okfn/ckan-chef).

###Install Dependencies
VirtualBox, Vagrant, Berkshelf and vagrant plugins:

1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://www.vagrantup.com/)
3. Install Berkshelf by installing the [ChefDK](https://downloads.chef.io/chef-dk/)
4. Install vagrant-berkshelf plugin with: `$ vagrant plugin install vagrant-berkshelf`
5. Install vagrant-hostmanager plugin with: `$ vagrant plugin install vagrant-hostmanager`

###Clone ckan-chef
On your local workstation:  

```
git clone https://github.com/okfn/ckan-chef

cd ckan-chef
```
### Run Vagrant Virtual Machine

In the ckan-chef directory:

```
# Start Vagrant VM
vagrant up

# ssh into the Vagrant VM

vagrant ssh

```

###Serve CKAN from Virtual Machine

In your ssh session:  

```
# Activate the Python virtual environment
./usr/lib/ckan/default/bin/activate

# Use paster to serve CKAN app with settings from developmnet.ini file
paster serve /etc/ckan/default/development.ini
```

You should be able to view the "off the shelf" CKAN applications by pointing your browser and to http://localhost:5000

## Extensions and Plugins
Currently we are leveraging three plugins (**organization**, **project**, **cadastaroles**) distributed across two extensions (**ckanext-project**, **ckanext-cadastaroles**).

We pull the extensions into the VM via a shared folder that is accessible from both the host OS and the guest VM OS. That allows development of the extension's code on the host OS while allowing the VM to serve the code.

**1.**  Create a `synced_folders` directory in the root of the ckan-chef repo.

**2.**  `cd` into `synced_folders` and do:
  
```bash
# make sure you are on the correct branch
git clone https://github.com/Cadasta/ckanext-project.git  
# make sure you are on the correct branch
git clone https://github.com/Cadasta/ckanext-cadastaroles.git
```

Check out the dev branch in the ckanext-project.

**3.** Alter `Vagrantfile` which is found in the root of the ckan-chef repo.  You'll need to add the following below the other shared folder entries:

```bash  
config.vm.synced_folder "synced_folders/ckanext-project", "/usr/lib/ckan/default/src/ckanext-project", 
                          id: "ckanext-project", 
                          owner: "vagrant", 
                          group: "vagrant", 
                          mount_options: ["dmode=775","fmode=664"], 
                          create: false

config.vm.synced_folder "synced_folders/ckanext-cadastaroles", "/usr/lib/ckan/default/src/ckanext-cadastaroles",
                          id: "ckanext-cadastaroles",
                          owner: "vagrant",
                          group: "vagrant",
                          mount_options: ["dmode=775","fmode=664"],
                          create: false

```
**4.**  Now tell Vagrant to reload the VM by doing this at the ckan-chef root:

```
vagrant reload
```
**5.**  Then log into the VM:

````    
vagrant ssh
````
**6.**  Navigate to `/usr/lib/ckan/default/src`. You should see `ckanext-cadastaroles`, `ckanext-project`, as well as well as `ckan`. To install the extensions, do:

```
cd /usr/lib/ckan/default/src
source ../bin/activate
(cd ckanext-project && python setup.py develop)

```

**7.** Edit the `/etc/ckan/default/development.ini`: add `cadasta_organization cadastaroles project` to the list of ckan.plugins.  Also add the following configurations for the plugins:

```
# URL for Cadasta API
ckanext.cadasta.api_url = http://54.69.121.180:3000 

# Temporary setting for development
ckanext.cadasta.enforce_permissions =false
```

Also make sure that:

```
solr_url=http://54.203.254.99:8983/solr
```

**8.** Run the server with: `paster serve /etc/ckan/default/development.ini` and navigate to http://localhost:5000 on your local workstation.

**9.** In order to have sysadmin permissions, create a new CKAN user with the UI and then run the following command with your username:  

```
paster sysadmin add USERNAME -c /etc/ckan/default/development.ini
```


## PyCharm Paster Debugging

PyCharm has the ability to create a [Remote Debugging Server](https://www.jetbrains.com/pycharm/help/remote-debugging.html#6 "Remote Debugging Server") that can suspend and interact with IDE breakpoints. CKAN, being as spectacular as it is, requires a ckan extension to be installed for this all to go smoothly. Here's how:

**0.** Install [PyCharm](https://www.jetbrains.com/pycharm-edu/quickstart/installation.html) for your OS

**1.** In ``ckan_chef/synced_folders`` create a new folder called ``ckanext-dev`` and clone the [ckanext-dev repo](https://github.com/NaturalHistoryMuseum/ckanext-dev):
```bash
gcorradini@rancho:/usr/local/src/ckan-chef$ pwd
/usr/local/src/ckan-chef
gcorradini@rancho:/usr/local/src/ckan-chef$ cd synced_folders/
gcorradini@rancho:/usr/local/src/ckan-chef/synced_folders$ mkdir ckanext-dev
gcorradini@rancho:/usr/local/src/ckan-chef/synced_folders$ cd ckanext-dev
$ git clone https://github.com/NaturalHistoryMuseum/ckanext-dev.git .
```

**2.** Update the ``Vagrantfile`` config to create a new synced folder on the VM:
```bash
gcorradini@rancho:/usr/local/src/ckan-chef$ pwd
/usr/local/src/ckan-chef
gcorradini@rancho:/usr/local/src/ckan-chef/synced_folders/config$ vi Vagrantfile
```

**3.** Add the new ``ckanext-dev`` folder definition below the other definitions:
```bash
  config.vm.synced_folder "synced_folders/ckanext-dev", "/usr/lib/ckan/default/src/ckanext-dev",
                          id: "ckanext-dev",
                          owner: "vagrant",
                          group: "vagrant",
                          mount_options: ["dmode=775","fmode=664"],
                          create: false
```

**4.** Update the ``development.ini`` file to include a couple new config attributes
```bash
gcorradini@rancho:/usr/local/src/ckan-chef$ pwd
/usr/local/src/ckan-chef
gcorradini@rancho:/usr/local/src/ckan-chef$ cd synced_folders/config/
gcorradini@rancho:/usr/local/src/ckan-chef/synced_folders/config$ vi development.ini 
```

**5.** Below the ``debug = true`` section add a the following key value pairs:
```bash
debug.remote = true
debug.remote.host.port = 6666
```

**6.** ``PyCharm`` comes with a Python2.X pydev daemon debugger ``.egg`` file pre-downloaded with the IDE. Mine is located at:
```bash
/usr/local/src/pycharm/pycharm-4.0.3/pycharm-debug.egg
```
Find yours and copy it to the ``synched_folders/src/`` directory for temporary storage:
```bash
gcorradini@rancho:/usr/local/src/ckan-chef$ pwd
/usr/local/src/ckan-chef
gcorradini@rancho:/usr/local/src/ckan-chef$ cp /usr/local/src/pycharm/pycharm-4.0.3/pycharm-debug.egg synched_folders/src/
```

**7.** Reload the ``Vagrant`` VM:
```bash
gcorradini@rancho:/usr/local/src/ckan-chef$ pwd
/usr/local/src/ckan-chef
gcorradini@rancho:/usr/local/src/ckan-chef$ vagrant reload
```

**8.** SSH into the VM, ``vagrant ssh``, and navigate to the ``src`` folder. We need to install the ``pycharm-debug.egg`` you copied earlier into Python site-packages:
```bash
vagrant@default:~$ pwd
/home/vagrant
(default)vagrant@default:~$ cd /usr/lib/ckan/default/src/
(default)vagrant@default:~$ easy_install pycharm-debug.egg
```

**9.** In ``PyCharm`` create a new Run Configuration of the type **Python Remote Debug**. You can read more about how to create [Run Configurations Here](https://www.jetbrains.com/pycharm/help/remote-debugging.html#1). Make sure you do the following things in the Run Configuration Form:

* Give it an arbitrary name in the Name field
* Local host name field should be 0.0.0.0
* Port should be 6666
* Create one path mapping where **Local Path**: ``<YOUR_PATH_TO>/ckan-chef/synced_folders/src`` and **Remote Path**: ``/usr/lib/ckan/default/src``
* Leave all the other defaults checked

Click **OK**

**10.** Launch the Remote Deb Server by clicking [this button](https://www.jetbrains.com/pycharm/help/remote-debugging.html#3). You should see the following output in the bottom console:
```bash
Starting debug server at port 6666
Use the following code to connect to the debugger:
import pydevd
pydevd.settrace('0.0.0.0', port=6666, stdoutToServer=True, stderrToServer=True)
Waiting for process connection...
```

**11.** Then back over in your VM start the CKAN server ``paster serve /etc/ckan/default/development.ini``. The console should now show the debugger can properly sniff this connection:
```bash
Starting debug server at port 6666
Use the following code to connect to the debugger:
import pydevd
pydevd.settrace('0.0.0.0', port=6666, stdoutToServer=True, stderrToServer=True)
Waiting for process connection...
Connected to pydev debugger (build 139.781)
Starting server in PID 2738.
serving on 0.0.0.0:5000 view at http://127.0.0.1:5000
```

**12.** Create a breakpoint at your desired location