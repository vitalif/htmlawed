#!/bin/sh
# php -r 'require "htmLawed.php"; print htmLawed::sanitize(file_get_contents("test_xss.txt"), array("safe" => 1));' > test_php.htm
node_modules/.bin/eslint htmLawed.js
node_modules/.bin/babel htmLawed.js > htmLawed.c.js
nodejs htmLawed-test.js
