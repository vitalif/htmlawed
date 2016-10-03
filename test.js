const fs = require('fs');
const htmLawed = require('./htmLawed.js');

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

var src = '<body><style>a { }</style> <img style="abc: 1">zhopa</img> <p>Hello &nbsp; world!</p></body>';
var res = '<style>a { }</style> <img style="abc: 1" src="src" alt="image" />zhopa <p>Hello &nbsp; world!</p>';
var ok = htmLawed.sanitize(src, { safe: 1, elements: '* +style', style_pass: true });
console.log("[STYLE_PASS] "+(ok ? "OK" : "NOT OK"));

var str = 'ssss <script type="application/json" data-scope="inboxmarkup">\
{"api_version":"1.0","publisher":{"api_key":"05dde50f1d1a384dd78767c55493e4bb","name":"GitHub"},"entity":{"external_key":"github/vitalif/grive2","title":"vitalif/grive2","subtitle":"GitHub repository","main_image_url":"https://cloud.githubusercontent.com/assets/143418/17495839/a5054eac-5d88-11e6-95fc-7290892c7bb5.png","avatar_image_url":"https://cloud.githubusercontent.com/assets/143418/15842166/7c72db34-2c0b-11e6-9aed-b52498112777.png","action":{"name":"Open in GitHub","url":"https://github.com/vitalif/grive2"}},"updates":{"snippets":[{"icon":"DESCRIPTION","message":"Error syncing - TCP connection reset by peer (#111)"}],"action":{"name":"View Issue","url":"https://github.com/vitalif/grive2/issues/111"}}}\
</script> sss';
var ok = htmLawed.sanitize(str, { safe: 1, keep_bad: 0 }) == 'ssss  sss';
console.log("[keep_bad=0] "+(ok ? "OK" : "NOT OK"));
