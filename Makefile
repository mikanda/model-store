install:
	component install --dev

build: install
	component build --dev

test: build
	node_modules/mocha-phantomjs/bin/mocha-phantomjs test/index.html

clean:
	rm -rf components build

.PHONY: test clean
