const fs = require('fs');
const htmLawed = require('./htmLawed.c.js');

var out1 = htmLawed.sanitize(fs.readFileSync('htmLawed_TESTCASE.txt', { encoding: 'utf8' }), { safe: 1, keep_bad: 1 });
var check1 = fs.readFileSync('htmLawed_TESTCASE_out.htm', { encoding: 'utf8' });
if (out1 == check1)
    console.log("[TESTCASE.txt] OK");
else
{
    console.log("[TESTCASE.txt] NOT OK, see htmLawed_TESTCASE_bad.htm");
    fs.writeFileSync('htmLawed_TESTCASE_bad.htm', out1, { encoding: 'utf8' });
}

var tests = fs.readFileSync('rsnake_xss.txt', { encoding: 'utf8' });
var m;
while ((m = /^(\d+)\.\s*([^\n]+)\n\nInput code »\n([\s\S]*?)\n\nOutput code »\n([\s\S]*?)\n\n/.exec(tests)))
{
    var output = htmLawed.sanitize(m[3], { safe: 1, keep_bad: 1 }).trim();
    if (output === m[4])
        console.log("["+m[1]+"] "+m[2]+": OK");
    else
        console.log("["+m[1]+"] "+m[2]+": NOT OK\n"+m[4]+"\n vs \n"+output);
    tests = tests.substr(m[0].length);
}
