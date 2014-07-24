<b>UltraGridWebGUI</b>
===============

An Ultragrid software middleware to make Ultragid controllable from a REST Web service
<br>
<b>Requirements</b><br>

UltraGrid software installation on system
<br>
<br>

<b>Installation</b><br>

Install Nginx proxy server<br>

$sudo apt-get install nginx<br>

$sudo service nginx restart<br><br>



First of all, install RVM, a ruby version manager<br>

$curl -sSL https://get.rvm.io | bash -s stable<br>

$source ~/.bashrc<br><br>



After that, install ruby 2.0.0<br>

$rvm install 2.0.0<br>

$rvm use 2.0.0<br>
<br>


Finally, install livemediastremer web GUI<br>

$git clone https://github.com/ua-i2cat/ultragridwebgui.git<br>

$cd ultragridwebgui/rultragrid<br>

$bundle install<br>

$cd ../api<br>

$bundle install<br>
<br>


<b>Deployment</b>
Working modes:<br>

1.-	Rack server deployment<br>

Recommended only  for testing purposes. Default port is 9292.<br>

$ cd ultragridwebgui/api<br>

$ rackup –p<port><br>
<br>


2.-	Nginx + Unicorn deployment<br>

Recommended for non testing purposes. <br>

It is necessary to configure nginx configuration file correctly. An example can be found in ultragridwebgui/api/nginx.conf.example<br>

$ cd ultragridwebgui/api<br>

$ mkdir tmp<br>

$ mkdir tmp/sockets<br>

$ mkdir tmp/pids<br>

$ mkdir log<br>

$ sudo service nginx restart<br>

$ unicorn –c unicorn.rb -D<br>

