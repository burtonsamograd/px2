include Makefile.inc
all: px2.js px2.min.js
	$(MAKE) -C test

px2.js: px2.ps macros.ps
px2.min.js: px2.js
	uglify -s px2.js -o px2.min.js

