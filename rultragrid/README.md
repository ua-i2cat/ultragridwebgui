# RUltraGrid

UltraGRid GUI API Ruby implementation

## Installation

While developing:

    $ bundle install

To make it available system-wide:

    $ gem build rultragrid.gemspec
    $ gem install rultragrid-<version>.gem

To generate the documentation:

    $ rake rdoc

Or just `rake`, since `rdoc` is the default task.

## Usage

    require 'rultragrid'

    m = RUltraGrid::UltraGrid.new 'localhost', 5054

