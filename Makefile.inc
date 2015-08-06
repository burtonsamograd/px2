ifdef DEBUG
PS2JSOPTS+=--eval '(defconstant +debug+ t)'
endif

MOCHA=mocha . && { mocha . -R html-cov > coverage.html; mocha --bail . -R mocha-text-cov | tee coverage.txt | grep TOTAL | grep '100%' || { cat coverage.txt; echo 'CODE COVERAGE NOT AT 100%!'; exit 1; } }

%.js: %.ps
	ps2js $(PS2JSOPTS) $< > $@
	-rm -f test/test
