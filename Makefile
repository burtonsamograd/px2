include Makefile.inc
all: px2.js
	$(MAKE) -C test

px2.js: px2.ps macros.ps

