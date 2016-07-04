const fs = require('fs');
const htmLawed = require('./htmLawed.c.js');
console.log(htmLawed.sanitize(fs.readFileSync(process.argv[2], { encoding: 'utf8' }), { safe: 1 }));
