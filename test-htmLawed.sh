#!/bin/sh
# php -r 'require "htmLawed.php"; print htmLawed::sanitize(file_get_contents("test_xss.txt"), array("safe" => 1));' > test_php.htm
node_modules/.bin/eslint --rulesdir eslint-plugin-no-regex-dot htmLawed.js
node_modules/.bin/babel htmLawed.js > htmLawed.c.js
nodejs htmLawed-test.js test_xss.txt
