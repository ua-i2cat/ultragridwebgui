#
#  RUBYULTRAGRID - A management ruby interface for UltraGrid
#  Copyright (C) 2013  Fundació i2CAT, Internet i Innovació digital a Catalunya
#
#  This file is part of thin RUBYULTRAGRID.
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
#  Authors:  Gerard Castillo <gerard.castillo@i2cat.net>,
#

require "rultragrid/version"
require 'mkmf'
require 'open3'
require 'sexpistol'
require 'socket'
require 'json'

module RUltraGrid
  # Generic error to be thrown when an error is returned by the remote
  # *UltraGrid* instance
  class UltraGridError < StandardError
  end

  class UltraGrid

    @@uvgui_state = {:have_uv => false, 
      :uv_running => false, :uv_params => "",   #TODO data persistent with mongodb (if reinit interface re-check if uv exists and uv running params...) 
      :host => "127.0.0.1", :port => 5054, 
      :o_fps => 0, :o_br => 0, :o_size => "0x0", 
      :c_fps => 0, :c_br => 0, :c_size => "0x0", 
      :losses => 0}

    def initialize(host, port)
      #configure network interface buffer size
      puts "Please, if required, enter administrator password in order to configure network buffer for UltraGrid"
      
      output = system('sudo sysctl -w net.core.rmem_max=9123840')
      
      puts "Network coinfiguration: DONE!" if output == true
      puts "Network coinfiguration: FAILED!"  if output == false
      
      @@uvgui_state[:have_uv] = check_ug
      @@uvgui_state[:host] = host
      @@uvgui_state[:port] = port
    end

    #
    #ULTRAGRID SYSTEM WORKFLOWS
    #
    def have_uv
      @@uvgui_state[:have_uv]
    end
    
    def get_curr_state
      #JSON.generate(uvgui_state)
      return @@uvgui_state
    end
    
    def set_curr_state(state)
      state_hash = JSON.parse(state)
      state_hash.each do |key, value|
        @@uvgui_state[key] = value
      end
      #      @uvgui_state[:host] = @state[:host] if @state[:host]
      #      @uvgui_state[:port] = @state[:port] if @state[:port]
      #      @uvgui_state[:o_fps] = @state[:o_fps] if @state[:o_fps]
      #      @uvgui_state[:o_br] = @state[:o_br] if @state[:o_br]
      #      @uvgui_state[:o_size] = @state[:o_size] if @state[:o_size]
      #      @uvgui_state[:c_fps] = @state[:c_fps] if @state[:c_fps]
      #      @uvgui_state[:c_br] = @state[:c_br] if @state[:c_br]
      #      @uvgui_state[:c_size] = @state[:c_size] if @state[:c_size]
      #      @uvgui_state[:losses] = @state[:losses] if @state[:losses]
    end
    
    #main methods (check uv, local capture, remote connectivity and set start/stop uv)
    def check_ug
      !(find_executable 'uv').nil?
    end

    def local_check
      begin
        response = send_and_wait("compress param bitrate=1m\n")
      rescue JSON::ParserError, Errno::ECONNREFUSED => e
        puts "SOCKET ERROR: #{e.message}"
      end
      puts "RESPONSE---> #{response}"
    end

    def remote_check
      puts "GOT REMOTE CHECK MODE\n"

    end

    def check(input)
      if input[:mode].eql?"local"
        local_check
      end
      if input[:mode].eql?"remote"
        remote_check
      end
    end

    #!!!!!!!testing cmds
    def run_ug
      cmd = 'uv -t v4l2 -c libavcodec:codec=H.264 -d sdl'
      @parser = Sexpistol.new
      @parser.scheme_compatability = true
      error = false

      Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
        #while line = stdout_err.gets
        # puts line
        #end
        pid = wait_thr[:pid]
        start = Time.now

        while (Time.now - start) < 10 and wait_thr.alive?
          # Wait up to `tick` seconds for output/error data
          Kernel.select([stdout_err], nil, nil, 10)
          # Try to read the data
          begin
            puts "\nSTDOUTERR: "
            output = stdout_err.read_nonblock(4096)
            parsed = @parser.parse_string(output)
            puts "--> #{parsed[0]}"
            puts "GOT V4L2" if parsed[0].to_s.eql?"[V4L2"
            #            puts "parsed[0][1]\n\n"
            #            puts "output\n\n"
          rescue IO::WaitReadable
            # A read would block, so loop around for another select
          rescue EOFError
            # Command has completed, not really an error...
            break
          end
        end
        # Give Ruby time to clean up the other thread
        sleep 1

        if wait_thr.alive?
          # We need to kill the process, because killing the thread leaves
          # the process alive but detached, annoyingly enough.
          Process.kill("TERM", pid)

          stdin.close if stdin
          stdout_err.close if stdout_err
        end

        exit_status = wait_thr.value
        if exit_status.success?
          puts "WORKED !!! #{cmd}"
        else
          puts "FAILED !!! #{cmd}"
        end

      end
    end

    def testing_method_check(cmd)
      #cmd = cmd.to_s
      Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
        #           while line = stdout_err.gets
        #             puts line
        #           end
        pid = thread[:pid]
        start = Time.now

        exit_status = wait_thr.value
        unless exit_status.success?
          puts "FAILED !!! #{cmd}"
        end

      end
    end
    #END ULTRAGRID SYSTEM WORKFLOWS
    
    #
    #TCP SOCKET MESSAGING TO ULTRAGRID
    #
    def send_and_wait(cmd)
      #request = cmd.to_s
      request = cmd.to_s
      puts request
      s = TCPSocket.open(@@uvgui_state[:host], @@uvgui_state[:port])
      s.print(request)
      response = s.recv(2048) # TODO: max_len ?
      s.close
      return response
    end

    def dont_wait(cmd)
      request = cmd
      s = TCPSocket.open(@@uvgui_state[:host], @@uvgui_state[:port])
      s.print(request)
      s.close
      response = "ok"
      return response
    end
    #END TCP SOCKET MESSAGING

  end

end
