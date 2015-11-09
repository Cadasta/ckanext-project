
## PyCharm Paster Debugging for CKAN
This document assumes your development environment with CKAN is a [VirtualBox VM managed by Vagrant](https://github.com/okfn/ckan-chef). 
PyCharm has the ability to create a [Remote Debugging Server](https://www.jetbrains.com/pycharm/help/remote-debugging.html#6 "Remote Debugging Server") that can suspend and interact with IDE breakpoints. 
CKAN, being as spectacular as it is, requires a ckan extension to be installed for this all to go smoothly. Here's how:

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
* Create one path mapping where **Local Path**: ``<YOUR_PATH_TO>/ckan-chef/synced_folders/src`` and **Remote Path**: ``/usr/lib/ckan/default/src``. YOU'LL NEED A MAPPING FOR EVERY FILE YOU DEBUG!
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