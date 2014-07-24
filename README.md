<b>ultragridwebgui</b>
===============

An Ultragrid software middleware to make Ultragid controllable from a REST Web service

<b>Requirements</b>
UltraGrid software installation on system

<b>Installation</b>
Install Nginx proxy server
$sudo apt-get install nginx
$sudo service nginx restart

First of all, install RVM, a ruby version manager
$curl -sSL https://get.rvm.io | bash -s stable
$source ~/.bashrc

After that, install ruby 2.0.0
$rvm install 2.0.0
$rvm use 2.0.0

Finally, install livemediastremer web GUI
$git clone https://github.com/ua-i2cat/ultragridwebgui.git
$cd ultragridwebgui/rultragrid
$bundle install
$cd ../api
$bundle install

<b>Deployment</b>
Working modes:
1.-	Rack server deployment
Recommended only  for testing purposes. Default port is 9292.
$ cd ultragridwebgui/api
$ rackup –p<port>

2.-	Nginx + Unicorn deployment
Recommended for non testing purposes. 
It is necessary to configure nginx configuration file correctly. An example can be found in ultragridwebgui/api/nginx.conf.example
$ cd ultragridwebgui/api
$ mkdir tmp
$ mkdir tmp/sockets
$ mkdir tmp/pids
$ mkdir log
$ sudo service nginx restart
$ unicorn –c unicorn.rb -D
