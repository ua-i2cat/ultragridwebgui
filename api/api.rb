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
#  Authors:  Marc Palau <marc.palau@i2cat.net>,
#            Ignacio Contreras <ignacio.contreras@i2cat.net>
#   

require 'rubygems'
require 'bundler/setup'

require 'liquid'
require 'sinatra/base'
require 'rultragrid'

class UltraGridAPI < Sinatra::Base

  set :ip, '127.0.0.1'
  set :port, 5054
  set :ultragrid, RUltraGrid::UltraGrid.new(settings.ip, settings.port)
  
  def dashboard (id = 1)
    k2s =
    lambda do |h|
      Hash === h ?
        Hash[
          h.map do |k, v|
            [k.respond_to?(:to_s) ? k.to_s : k, k2s[v]]
          end
        ] : h
    end

    if settings.ultragrid.have_uv
      
      #testing/debugging
      puts settings.ultragrid.get_curr_state
      #settings.ultragrid.run_uv('uv -t v4l2 -c libavcodec:codec=H.264 -d sdl')
      #end testing
            
      #return index
      liquid :index, :locals => {
        "state" => k2s[settings.ultragrid.get_curr_state]
      }
        
    else
      liquid :before
    end
    
  end

  # Web App Methods

  get '/' do
    redirect '/ultragrid'
  end

  get '/ultragrid' do
    redirect '/ultragrid/gui'
  end

  get '/ultragrid/gui' do
    content_type :html
    dashboard
  end
  
  post '/ultragrid/gui/check' do
    #check local config. or remote config.&connectivity 
    content_type :html
    settings.ultragrid.check(params)
    redirect '/ultragrid/gui'
  end
  
  get '/ultragrid/gui/start' do
    #start ug process and play stream
    content_type :html
    settings.ultragrid.run_uv
    redirect '/ultragrid/gui'      
  end  
  
  get '/ultragrid/gui/stop' do
    #stop ug process
    content_type :html
    settings.ultragrid.stop_uv
    redirect '/ultragrid/gui'    
  end  

  get '/ultragrid/gui/play' do
    #play ug streaming
    content_type :html
    settings.ultragrid.play_uv
    redirect '/ultragrid/gui'    
  end  
  
  get '/ultragrid/gui/pause' do
    #pause ug streaming 
    content_type :html
    settings.ultragrid.pause_uv
    redirect '/ultragrid/gui'    
  end  
  
  post '/ultragrid/gui/ccontrol' do
    #stop ug process
    content_type :html
    settings.ultragrid.set_cc_mode(params)
    redirect '/ultragrid/gui'    
  end  
  
  get '/ultragrid/gui/statistics' do
    #pause ug streaming 
    content_type :html
    settings.ultragrid.pause_uv
    redirect '/ultragrid/gui'    
  end  
#
#  get '/app/stats' do
#    content_type :html
#    dashboard(3)
#  end
#
#  post '/app/start' do
#    content_type :html
#    error_html do
#      settings.ultragrid.start(params)
#    end
#    redirect '/app'
#  end
#
  end