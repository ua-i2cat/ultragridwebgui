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
  set :port, 5056
  set :ultragrid, RUltraGrid::UltraGrid.new(settings.ip, settings.port)

  def ug_exists
    settings.ultragrid.check_ug
  end

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

    if ug_exists
      settings.ultragrid.run_ug

      liquid :index
#      
#      #Input streams json parsing
#      i_streams = settings.ultragrid.input_streams
#      input_streams = []
#      
#      i_streams.each do |s|
#        crops = []
#        s[:crops].each do |c|
#          crops << k2s[c]
#        end
#        s[:crops] = crops
#        input_streams << k2s[s]
#      end
#
#      #Output stream json parsing
#      o_stream = settings.ultragrid.output_stream
#      output_stream = []
#      o_crops = []
#
#      o_stream[:crops].each do |c|
#        dst = []
#        c[:destinations].each do |d|
#          dst << k2s[d]
#        end
#        c[:destinations] = dst
#        o_crops << k2s[c]
#      end
#
#      o_stream[:crops] = o_crops
#      output_stream << k2s[o_stream]
#
#      #Stats json parsing
#      hash_stats = settings.ultragrid.get_stats
#      i_stats, o_stats = [], []
#
#    if hash_stats[:input_streams] != nil
#      hash_stats[:input_streams].each do |s|
#        i_stats << k2s[s]
#      end
#      hash_stats[:input_streams] = i_stats
#    end
#      
#    if hash_stats[:output_streams] != nil
#      hash_stats[:output_streams].each do |s|
#        o_stats << k2s[s]
#      end
#      hash_stats[:output_streams] = o_stats
#    end
#
#      if (id == 2)
#        liquid :commute, :locals => {
#          "input_streams" => input_streams,
#          "fade_time" =>settings.fade_time
#        }
#      elsif (id == 3)
#        liquid :stats, :locals => {
#          "input_stats" => i_stats,
#          "output_stats" => o_stats
#        }
#      else
#        liquid :index, :locals => {
#          "input_streams" => input_streams,
#          "output_streams" => output_stream,
#          "grid" => settings.grid,
#          "output_grid" => settings.output_grid
#        }
#      end
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

  get '/ultragrid/gui/stop' do
      #stop ug process
  end
  
  post '/ultragrid/gui/check' do
    #content_type :html
    settings.ultragrid.check(params)
    #redirect '/ultragrid/gui'
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