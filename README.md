# htmLawed

This is a JS rewrite of a safe HTML sanitizer "htmLawed", http://www.bioinformatics.org/phplabware/internal_utilities/htmLawed/

It is safe against almost all possible XSS vectors; see test cases in htmLawed_TESTCASE.txt and rsnake_xss.txt.

Code is awful, but it works :D

Version corresponds to 1.2.4.1

## Install

`npm install htmlawed`

## Basic usage

```js
const htmlawed = require('htmlawed');
var safe = htmlawed.sanitize('<html code>', { safe: 1 });
```

## Config options

The same config as in the original PHP version is supported. See documentation here:

http://www.bioinformatics.org/phplabware/internal_utilities/htmLawed/htmLawed_README.htm#s2.2

The most interesting options are:
* `safe`: sanitize against most XSS
* `elements`: space-delimited allowed HTML elements with '+' or '-' in front.
  for example, `* +style` means "allow all standard elements and &lt;style&gt; element".
* `keep_bad`: what to do with bad tags (6 is the default)
 * 0 = remove them
 * 1 = escape tags and element content (replace < > to &amp;lt; &amp;gt;)
 * 2 = remove tags, escape element content
 * 3, 4 = like 1, 2 but remove if text (#PCDATA) is invalid in parent element
 * 5, 6 = like 3, 4 but leave space characters in place
* `parent`: supposed parent element that will be wrapped around content
* `tidy: -1 = compact/uglify HTML, 0 = no change (default), 1 = tify/beautify HTML
* `abs_url`: -1 = make relative, 0 = no change (default), 1 = make absolute
* `base_url`: base URL for `abs_url` to work if not 0

# License

LGPL, because it's a rewrite of the original LGPL-licensed library.

Copyright (c) 2016+ Vitaliy Filippov (vitalif ~ mail.ru)
