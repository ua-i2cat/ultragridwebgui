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
require 'socket'
require 'json'
require 'thread'

module RUltraGrid
  # Generic error to be thrown when an error is returned by the remote
  # *UltraGrid* instance
  class UltraGridError < StandardError
  end

  class UltraGrid

    @@uvgui_state = {:have_uv => false,
      :checked_local => false, :checked_remote => false,
      :uv_running => false, :uv_params => "",   #TODO data persistent with mongodb (if reinit interface re-check if uv exists and uv running params...)
      :uv_play => false, :uv_vbcc => false,
      :host => "127.0.0.1", :port => 0,
      :o_fps => 0, :o_br => 0, :o_size => "0x0",
      :c_fps => 0, :c_br => 0, :c_size => "0x0",
      :losses => 0}

    at_exit {
      #define method to join thread and exit properly
      begin
        @@uv_thr.join   # Calling an instance method join
        #dosomething
      rescue SignalException => e
        raise e
      rescue Exception => e
        puts "Exiting without no UltraGrid to join!"
      end
      puts "BYE BYE!"
    }

    def reset
      stop_uv
      @@uvgui_state[:have_uv] = check_ug
      @@uvgui_state[:host] = "127.0.0.1"
      @@uvgui_state[:port] = 0
      @@uvgui_state[:checked_local] = false
      @@uvgui_state[:checked_remote] = false
      @@uvgui_state[:uv_running] = false
      @@uvgui_state[:uv_params] = ""
      @@uvgui_state[:uv_play] = false
      @@uvgui_state[:uv_vbcc] = false
    end

    def initialize(host, port)
      #configure network interface buffer size
      output = system('sudo sysctl -w net.core.rmem_max=9123840')
      puts "Network coinfiguration: DONE!" if output == true
      puts "Network coinfiguration: FAILED!" if output == false

      @@uvgui_state[:have_uv] = check_ug
      @@uvgui_state[:host] = host
    end

    def set_control_port(input)
      @@uvgui_state[:port] = input[:port]
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
    end

    def check_ug
      !(find_executable 'uv').nil?
    end

    def check(input)
      if input[:mode].eql?"local"
        local_check(input[:cmd])
      end
      if input[:mode].eql?"remote"
        remote_check(input[:cmd])
      end
    end

    def local_check(cmd)
      puts "GOT LOCAL CHECK MODE\n"
      @@uvgui_state[:checked_local] = false
      @@uvgui_state[:uv_params] = cmd
      unless cmd.nil?
        puts "got cmd to execute local test!"
        @@uvgui_state[:checked_local] = uv_test_local(cmd)
        @@uvgui_state[:uv_params] = cmd
      end
    end

    def remote_check(cmd)
      puts "GOT REMOTE CHECK MODE\n"
      @@uvgui_state[:checked_remote] = false
      @@uvgui_state[:uv_params] = cmd
      unless cmd.nil?
        puts "got cmd to execute remote connectivity test!"
        @@uvgui_state[:checked_remote] = uv_test_remote(cmd)
        @@uvgui_state[:uv_params] = cmd
      end
    end

    def run_uv
      @@uvgui_state[:uv_running] = false
      cmd = @@uvgui_state[:uv_params]
      puts cmd
      #run thread uv (parsing std and updating uvgui_state)
      if @@uvgui_state[:checked_remote] && @@uvgui_state[:checked_local]
        @@uv_thr = Thread.new do   # Calling a class method new
          begin
            puts "Starting UltraGrid"
            Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
              while line = stdout_err.gets
                puts line
                #TODO here socket push to gui
                #TODO set timeout for RX OK! to 30s, then shutdown by socket
#                :o_fps => 0, :o_br => 0, :o_size => "0x0",
#                :c_fps => 0, :c_br => 0, :c_size => "0x0",
#                :losses => 0
                
                #CASE 1 [GET PARAMS]
                #string.partition('=').last
                if line.include?"[OFPS]"
                  @@uvgui_state[:o_fps] = line.partition(']').last
                end
                if line.include?"[ORES]"
                  @@uvgui_state[:o_size] = line.partition(']').last
                end
                if line.include?"[OBR]"
                  @@uvgui_state[:o_br] = line.partition(']').last
                end
                if line.include?"[CFPS]"
                  @@uvgui_state[:c_fps] = line.partition(']').last
                end
                if line.include?"[CFPS]"
                  @@uvgui_state[:c_size] = line.partition(']').last
                end
                if line.include?"[CBR]"
                  @@uvgui_state[:c_br] = line.partition(']').last
                end
                #CASE 2 [GET RX LOSSES]

                #CASE 3 [erase AUDIO AND VIDEO MSG for CHECKS]

                #CASE 4 [PUTS UG OUTPUT TO SOCKET FEEDBACK]

              end
              exit_status = wait_thr.value
              if exit_status.success?
                puts "WORKED !!! #{cmd}"
              else
                puts "FAILED !!! #{cmd}"
              end
            end
          rescue SignalException => e
            raise e
          rescue Exception => e
            puts "No succes on running UltraGrid...!"
            @@uvgui_state[:uv_running] = false
            @@uvgui_state[:uv_play] = false
          end
          @@uvgui_state[:uv_running] = false
          @@uvgui_state[:uv_play] = false
        end
        @@uvgui_state[:uv_running] = true
        @@uvgui_state[:uv_play] = true
      end
      # @@uvgui_state[:uv_running] = false
    end

    def stop_uv
      begin
        puts "Stopping UltraGrid"
        Thread.kill(@@uv_thr)
      rescue SignalException => e
        raise e
      rescue Exception => e
        puts "No succes on exiting UltraGrid...!"
      end
      @@uvgui_state[:uv_running] = false
    end

    def play_uv
      @@uvgui_state[:uv_play] = false
      if @@uvgui_state[:uv_running]
        response = send_and_wait("play\n")
        if response.nil?
          @@uvgui_state[:uv_play] = false
        else
          @@uvgui_state[:uv_play] = true
        end
      end
    end

    def pause_uv
      @@uvgui_state[:uv_play] = false
      if @@uvgui_state[:uv_running]
        send_and_wait("pause\n")
        @@uvgui_state[:uv_play] = false
      end
    end

    def set_cc_mode(input)
      puts "\n"
      puts !@@uvgui_state[:uv_vbcc] && input[:mode].eql?("auto")
      puts "\n"
      if !@@uvgui_state[:uv_vbcc] && input[:mode].eql?("auto")
        #activate vbcc
        response = send_and_wait("capture.filter vbcc\n")
        if response.nil?
          @@uvgui_state[:uv_vbcc] = false
        else
          puts "VBCC ACTIVE"
          @@uvgui_state[:uv_vbcc] = true
        end
      end
      if @@uvgui_state[:uv_vbcc] && input[:mode].eql?("manual")
        #deactivate vbcc
        #TODO do a global flush and reinit previous filters!!!
        send_and_wait("capture.filter flush\n")
        puts "VBCC DISABLED"
        @@uvgui_state[:uv_vbcc] = false
      end
    end
    #def set_anyparam_rc
    #  begin
    #    response = send_and_wait("compress param bitrate=1m\n")
    #  rescue JSON::ParserError, Errno::ECONNREFUSED => e
    #    puts "SOCKET ERROR: #{e.message}"
    #  end
    #  puts "RESPONSE---> #{response}"

    def uv_test_local(cmd)
      test_duration = 2 #seconds
      puts cmd

      Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
        video_error = true
        audio_error = true

        pid = wait_thr[:pid]
        start = Time.now

        while (Time.now - start) < test_duration and wait_thr.alive?
          # Wait up to `tick` seconds for output/error data
          Kernel.select([stdout_err], nil, nil, test_duration)
          # Try to read the data
          begin
            output = stdout_err.read_nonblock(4096)
            if output.include?"OK!"
              video_error = false
            end
            if output.include?"KO!"
              video_error = true
            end
            if output.include?"OK!"
              audio_error = false
            else
              audio_error = true
            end

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

        if cmd.include?" -t"
          if cmd.include?" -s"
            return !audio_error && !video_error
          else
            return !video_error
          end
        end
        if cmd.include?"-s"
          return !audio_error
        end
      end
    end

    def uv_test_remote(cmd)
      test_duration = 3 #seconds
      puts cmd

      Open3.popen2e(cmd) do |stdin, stdout_err, wait_thr|
        rx_error = true

        pid = wait_thr[:pid]
        start = Time.now

        while (Time.now - start) < test_duration and wait_thr.alive?
          # Wait up to `tick` seconds for output/error data
          Kernel.select([stdout_err], nil, nil, test_duration)
          # Try to read the data
          begin
            output = stdout_err.read_nonblock(4096)
            if output.include?"[RX] OK!"
              rx_error = false
            end

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

        return !rx_error

      end
    end

    #!!!!!!!testing cmds
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

