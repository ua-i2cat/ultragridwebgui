# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rultragrid/version'

Gem::Specification.new do |spec|
  spec.name          = "rultragrid"
  spec.version       = RUltraGrid::VERSION
  spec.authors       = ["i2CAT Foundation"]
  spec.email         = ["gerard.castillo@i2cat.net"]
  spec.description   = %q{UltraGrid GUI API Ruby implementation}
  spec.summary       = %q{UltraGrid GUI API}
  spec.homepage      = ""

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end