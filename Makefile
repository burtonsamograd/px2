include Makefile.inc
all: px.js
	$(MAKE) -C test

px.js: px.ps macros.ps

