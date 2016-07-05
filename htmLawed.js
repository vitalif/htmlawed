// JS rewrite of http://www.bioinformatics.org/phplabware/internal_utilities/htmLawed/

var htmLawed = module.exports =
{
    _flip: function(a)
    {
        var e = {};
        for (var i = 0; i < a.length; i++)
            e[a[i]] = true;
        return e;
    },
    _strtr: function(t, h)
    {
        for (var i in h)
            t = t.replace(new RegExp(i, 'g'), h[i]);
        return t;
    },
    _keys: function(h)
    {
        var r = [];
        for (var i in h)
            r.push(i);
        return r;
    },
    _htmlspecialchars: function(t)
    {
        return t.replace(/&/g, '&amp;')
            .replace(/'/g, '&apos;') // '
            .replace(/"/g, '&quot;') // "
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    hl_Ids: {},
    sanitize: function(t, C, S)
    {
        if (!C) C = {};
        if (!S) S = {};
        if (C.valid_xhtml)
        {
            C.elements = C.elements || '*-center-dir-font-isindex-menu-s-strike-u';
            C.make_tag_strict = C.make_tag_strict !== undefined ? C.make_tag_strict : 2;
            C['xml:lang'] = C['xml:lang'] !== undefined ? C['xml:lang'] : 2;
        }
        // config eles
        var e = { 'a':1, 'abbr':1, 'acronym':1, 'address':1, 'applet':1, 'area':1, 'b':1, 'bdo':1, 'big':1, 'blockquote':1, 'br':1, 'button':1, 'caption':1, 'center':1, 'cite':1, 'code':1, 'col':1, 'colgroup':1, 'dd':1, 'del':1, 'dfn':1, 'dir':1, 'div':1, 'dl':1, 'dt':1, 'em':1, 'embed':1, 'fieldset':1, 'font':1, 'form':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'hr':1, 'i':1, 'iframe':1, 'img':1, 'input':1, 'ins':1, 'isindex':1, 'kbd':1, 'label':1, 'legend':1, 'li':1, 'map':1, 'menu':1, 'noscript':1, 'object':1, 'ol':1, 'optgroup':1, 'option':1, 'p':1, 'param':1, 'pre':1, 'q':1, 'rb':1, 'rbc':1, 'rp':1, 'rt':1, 'rtc':1, 'ruby':1, 's':1, 'samp':1, 'script':1, 'select':1, 'small':1, 'span':1, 'strike':1, 'strong':1, 'sub':1, 'sup':1, 'table':1, 'tbody':1, 'td':1, 'textarea':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1, 'tt':1, 'u':1, 'ul':1, 'var':1 }; // 86/deprecated+embed+ruby
        if (C.safe)
        {
            delete e.applet;
            delete e.embed;
            delete e.iframe;
            delete e.object;
            delete e.script;
        }
        var x = C.elements ? C.elements.replace(/\s+/g, '') : '*';
        var v, m, i;
        if (x == '-*')
            e = {};
        else if (x.indexOf('*') < 0)
            e = htmLawed._flip(e.split(/,/));
        else if (x.length > 1)
        {
            var re = /(?:^|-|\+)[^\-+]+?(?=-|\+|$)/g;
            m = {};
            while ((v = re.exec(x)))
                m[v[0]] = true;
            for (v in m)
            {
                if (v[0] == '+')
                    e[v.substr(1)] = true;
                else if (v[0] == '-' && !m['+'+v.substr(1)])
                    delete e[v.substr(1)];
            }
        }
        C.elements = e;
        // config attrs
        x = C.deny_attribute ? C.deny_attribute.replace(/\s+/g, '') : '';
        x = htmLawed._flip(x[0] == '*' ? x.split(/-/) : (x+(C.safe ? ',on*' : '')).split(','));
        if (x['on*'])
        {
            delete x['on*'];
            v = { 'onblur':1, 'onchange':1, 'onclick':1, 'ondblclick':1, 'onfocus':1, 'onkeydown':1, 'onkeypress':1, 'onkeyup':1, 'onmousedown':1, 'onmousemove':1, 'onmouseout':1, 'onmouseover':1, 'onmouseup':1, 'onreset':1, 'onselect':1, 'onsubmit':1 };
            for (i in v)
                x[i] = true;
        }
        C.deny_attribute = x;
        // config URL
        x = C.schemes && C.schemes.length > 2 && C.schemes.indexOf(':') > 0 ? C.schemes.toLowerCase() : 'href: aim, feed, file, ftp, gopher, http, https, irc, mailto, news, nntp, sftp, ssh, telnet; *:file, http, https';
        C.schemes = {};
        m = x.replace(/\s+/g, '').split(';');
        for (v in m)
        {
            x = m[v].split(':', 2);
            if (x[1])
                C.schemes[x[0]] = htmLawed._flip(x[1].split(','));
        }
        if (!C.schemes['*'])
            C.schemes['*'] = { file: 1, http: 1, https: 1 };
        if (C.safe && !C.schemes.style)
            C.schemes.style = { '!': 1 };
        C.abs_url = C.abs_url !== undefined ? C.abs_url : 0;
        if (C.base_url === undefined || !/^[a-zA-Z\d\.+\-]+:\/\/[^\/]+\/([\s\S]+?\/)?$/.exec(C.base_url))
            C.base_url = C.abs_url = 0;
        // config rest
        C.and_mark = !C.and_mark ? 0 : 1;
        C.anti_link_spam = (C.anti_link_spam !== undefined && C.anti_link_spam instanceof Array &&
            C.anti_link_spam.length == 2 && (!C.anti_link_spam[0] || htmLawed.hl_regex(C.anti_link_spam[0])) &&
            (!C.anti_link_spam[1] || htmLawed.hl_regex(C.anti_link_spam[1]))) ? C.anti_link_spam : 0;
        C.anti_mail_spam = C.anti_mail_spam !== undefined ? C.anti_mail_spam : 0;
        C.balance = C.balance !== undefined ? true && C.balance : true;
        C.cdata = C.cdata !== undefined ? C.cdata : (!C.safe ? 3 : 0);
        C.clean_ms_char = !C.clean_ms_char ? 0 : C.clean_ms_char;
        C.comment = C.comment !== undefined ? C.comment : (!C.safe ? 3 : 0);
        C.css_expression = !C.css_expression ? 0 : 1;
        C.direct_list_nest = !C.direct_list_nest ? 0 : 1;
        C.hexdec_entity = C.hexdec_entity !== undefined ? C.hexdec_entity : 1;
        C.hook = (C.hook && typeof C.hook == 'function') ? C.hook : 0;
        C.hook_tag = (C.hook_tag && typeof C.hook_tag == 'function') ? C.hook_tag : 0;
        C.keep_bad = C.keep_bad !== undefined ? C.keep_bad : 6;
        C.lc_std_val = C.lc_std_val !== undefined ? !!C.lc_std_val : 1;
        C.make_tag_strict = C.make_tag_strict !== undefined ? C.make_tag_strict : 1;
        C.named_entity = C.named_entity !== undefined ? !!C.named_entity : 1;
        C.no_deprecated_attr = C.no_deprecated_attr !== undefined ? C.no_deprecated_attr : 1;
        C.parent = typeof C.parent == 'string' && C.parent.length > 0 ? C.parent.toLowerCase() : 'body';
        C.show_setting = C.show_setting ? C.show_setting : 0;
        C.style_pass = !C.style_pass ? 0 : 1;
        C.tidy = !C.tidy ? 0 : C.tidy;
        C.unique_ids = C.unique_ids !== undefined ? C.unique_ids : 1;
        C['xml:lang'] = C['xml:lang'] !== undefined ? C['xml:lang'] : 0;
        S = typeof S == 'object' ? S : htmLawed.hl_spec(S);

        // FIXME statics
        htmLawed.C = C;
        htmLawed.S = S;

        // FIXME: т.к. яваскрипт работает с unicode, вероятно t = unescape(encodeURIComponent(s))
        t = t.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f]+/g, '');
        if (C.clean_ms_char)
        {
            x = { "\x7f":'', "\x80":'&#8364;', "\x81":'', "\x83":'&#402;', "\x85":'&#8230;', "\x86":'&#8224;', "\x87":'&#8225;', "\x88":'&#710;', "\x89":'&#8240;', "\x8a":'&#352;', "\x8b":'&#8249;', "\x8c":'&#338;', "\x8d":'', "\x8e":'&#381;', "\x8f":'', "\x90":'', "\x95":'&#8226;', "\x96":'&#8211;', "\x97":'&#8212;', "\x98":'&#732;', "\x99":'&#8482;', "\x9a":'&#353;', "\x9b":'&#8250;', "\x9c":'&#339;', "\x9d":'', "\x9e":'&#382;', "\x9f":'&#376;' };
            var y;
            if (C.clean_ms_char == 1)
                y = { "\x82":'&#8218;', "\x84":'&#8222;', "\x91":'&#8216;', "\x92":'&#8217;', "\x93":'&#8220;', "\x94":'&#8221;' };
            else
                y = { "\x82":'\'', "\x84":'"', "\x91":'\'', "\x92":'\'', "\x93":'"', "\x94":'"' };
            for (i in y)
                x[i] = y[i];
            t = htmLawed._strtr(t, x);
        }
        if (C.cdata || C.comment)
            t = t.replace(/<!(?:(?:--[\s\S]*?--)|(?:\[CDATA\[[\s\S]*?\]\]))>/g, htmLawed.hl_cmtcd);
        t = t.replace(/&/g, '&amp;').replace(/&amp;([A-Za-z][A-Za-z0-9]{1,30}|#(?:[0-9]{1,8}|[Xx][0-9A-Fa-f]{1,7}));/g, htmLawed.hl_ent);
        if (C.unique_ids && !htmLawed.hl_Ids)
            htmLawed.hl_Ids = {};
        if (C.hook)
            t = C.hook(t, C, S);
        // main
        t = t.replace(/<(?:(?:\s|$)|(?:[^>]*(?:>|$)))|>/gm, htmLawed.hl_tag);
        if (C.balance)
            t = htmLawed.hl_bal(t, C.keep_bad, C.parent);
        if ((C.cdata || C.comment) && t.indexOf("\x01") >= 0)
            t = htmLawed._strtr(t, { "\x01": '', "\x02": '', "\x03": '&', "\x04": '<', "\x05": '>' });
        if (C.tidy)
            t = htmLawed.hl_tidy(t, C.tidy, C.parent);
        // eof
        return t;
    },
    hl_attrval: function(a, t, p)
    {
        // check attr val against S
        var ma = { accesskey: 1, class: 1, rel: 1 };
        var s = ma[a] ? ' ' : '';
        var r = [];
        var i;
        t = s ? t.split(s) : [ t ];
        for (var tk = 0; tk < t.length; tk++)
        {
            var tv = t[tk];
            var o = 1;
            var l = tv.length;
            for (var k in p)
            {
                var v = p[k];
                switch (k)
                {
                case 'maxlen': if(l > v){o = 0;} break;
                case 'minlen': if(l < v){o = 0;} break;
                case 'maxval': if(parseFloat(tv) > v){o = 0;} break;
                case 'minval': if(parseFloat(tv) < v){o = 0;} break;
                case 'match': if(!v.exec(tv)){o = 0;} break;
                case 'nomatch': if(v.exec(tv)){o = 0;} break;
                case 'oneof':
                    v = v.split('|');
                    for (i = 0; i < v.length && v[i] != tv; i++) {}
                    o = (i < v.length);
                    break;
                case 'noneof':
                    v = v.split('|');
                    for (i = 0; i < v.length && v[i] != tv; i++) {}
                    o = (i >= v.length);
                    break;
                }
                if (!o)
                    break;
            }
            if (o)
                r.push(tv);
        }
        return (r.length > 0 ? r.join(s) : (p['default'] || 0));
        // eof
    },
    hl_bal: function(t, keep_bad, intag)
    {
        if (keep_bad === undefined)
            keep_bad = 1;
        // balance tags
        // by content
        var cont = {};
        cont.B = { 'blockquote':1, 'form':1, 'map':1, 'noscript':1 }; // Block
        cont.E = { 'area':1, 'br':1, 'col':1, 'embed':1, 'hr':1, 'img':1, 'input':1, 'isindex':1, 'param':1 }; // Empty
        cont.F = { 'button':1, 'del':1, 'div':1, 'dd':1, 'fieldset':1, 'iframe':1, 'ins':1, 'li':1, 'noscript':1, 'object':1, 'td':1, 'th':1 }; // Flow; later context-wise dynamic move of ins & del to cont.I
        cont.I = { 'a':1, 'abbr':1, 'acronym':1, 'address':1, 'b':1, 'bdo':1, 'big':1, 'caption':1, 'cite':1, 'code':1, 'dfn':1, 'dt':1, 'em':1, 'font':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'i':1, 'kbd':1, 'label':1, 'legend':1, 'p':1, 'pre':1, 'q':1, 'rb':1, 'rt':1, 's':1, 'samp':1, 'small':1, 'span':1, 'strike':1, 'strong':1, 'sub':1, 'sup':1, 'tt':1, 'u':1, 'var':1 }; // Inline
        cont.N = { 'a':{'a':1}, 'button':{'a':1, 'button':1, 'fieldset':1, 'form':1, 'iframe':1, 'input':1, 'label':1, 'select':1, 'textarea':1}, 'fieldset':{'fieldset':1}, 'form':{'form':1}, 'label':{'label':1}, 'noscript':{'script':1}, 'pre':{'big':1, 'font':1, 'img':1, 'object':1, 'script':1, 'small':1, 'sub':1, 'sup':1}, 'rb':{'ruby':1}, 'rt':{'ruby':1} }; // Illegal
        cont.R = { 'blockquote':1, 'dir':1, 'dl':1, 'form':1, 'map':1, 'menu':1, 'noscript':1, 'ol':1, 'optgroup':1, 'rbc':1, 'rtc':1, 'ruby':1, 'select':1, 'table':1, 'tbody':1, 'tfoot':1, 'thead':1, 'tr':1, 'ul':1 };
        cont.S = { 'colgroup':{'col':1}, 'dir':{'li':1}, 'dl':{'dd':1, 'dt':1}, 'menu':{'li':1}, 'ol':{'li':1}, 'optgroup':{'option':1}, 'option':{'#pcdata':1}, 'rbc':{'rb':1}, 'rp':{'#pcdata':1}, 'rtc':{'rt':1}, 'ruby':{'rb':1, 'rbc':1, 'rp':1, 'rt':1, 'rtc':1}, 'select':{'optgroup':1, 'option':1}, 'script':{'#pcdata':1}, 'table':{'caption':1, 'col':1, 'colgroup':1, 'tfoot':1, 'tbody':1, 'tr':1, 'thead':1}, 'tbody':{'tr':1}, 'tfoot':{'tr':1}, 'textarea':{'#pcdata':1}, 'thead':{'tr':1}, 'tr':{'td':1, 'th':1}, 'ul':{'li':1} }; // Specific - immediate parent-child
        if (htmLawed.C.direct_list_nest)
            cont.S['ol']['ol'] = cont.S['ul']['ol'] = cont.S['ol']['ul'] = cont.S['ul']['ul'] = 1;
        cont.O = { 'address':{'p':1}, 'applet':{'param':1}, 'blockquote':{'script':1}, 'fieldset':{'legend':1, '#pcdata':1}, 'form':{'script':1}, 'map':{'area':1}, 'object':{'param':1, 'embed':1} }; // Other
        cont.T = { 'colgroup':1, 'dd':1, 'dt':1, 'li':1, 'option':1, 'p':1, 'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1 }; // Omitable closing
        // block/inline type; ins & del both type; #pcdata: text
        var el = {};
        el.B = { 'address':1, 'blockquote':1, 'center':1, 'del':1, 'dir':1, 'dl':1, 'div':1, 'fieldset':1, 'form':1, 'ins':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'hr':1, 'isindex':1, 'menu':1, 'noscript':1, 'ol':1, 'p':1, 'pre':1, 'table':1, 'ul':1 };
        el.I = { '#pcdata':1, 'a':1, 'abbr':1, 'acronym':1, 'applet':1, 'b':1, 'bdo':1, 'big':1, 'br':1, 'button':1, 'cite':1, 'code':1, 'del':1, 'dfn':1, 'em':1, 'embed':1, 'font':1, 'i':1, 'iframe':1, 'img':1, 'input':1, 'ins':1, 'kbd':1, 'label':1, 'map':1, 'object':1, 'q':1, 'ruby':1, 's':1, 'samp':1, 'select':1, 'script':1, 'small':1, 'span':1, 'strike':1, 'strong':1, 'sub':1, 'sup':1, 'textarea':1, 'tt':1, 'u':1, 'var':1 };
        el.N = { 'a':1, 'big':1, 'button':1, 'fieldset':1, 'font':1, 'form':1, 'iframe':1, 'img':1, 'input':1, 'label':1, 'object':1, 'ruby':1, 'script':1, 'select':1, 'small':1, 'sub':1, 'sup':1, 'textarea':1 }; // Exclude from specific ele; cont.N values
        el.O = { 'area':1, 'caption':1, 'col':1, 'colgroup':1, 'dd':1, 'dt':1, 'legend':1, 'li':1, 'optgroup':1, 'option':1, 'param':1, 'rb':1, 'rbc':1, 'rp':1, 'rt':1, 'rtc':1, 'script':1, 'tbody':1, 'td':1, 'tfoot':1, 'thead':1, 'th':1, 'tr':1 }; // Missing in el.B & el.I
        el.F = { ...el.B, ...el.I }; // FIXME <=> Object.assign({}, el.B, el.I)

        function getCont(intag)
        {
            var inOk = {};
            if (cont.S[intag])
                inOk = cont.S[intag];
            else if (cont.I[intag])
            {
                inOk = el.I;
                cont.I['del'] = 1;
                cont.I['ins'] = 1;
            }
            else if (cont.F[intag])
            {
                inOk = el.F;
                delete cont.I['del'];
                delete cont.I['ins'];
            }
            else if (cont.B[intag])
            {
                inOk = el.B;
                delete cont.I['del'];
                delete cont.I['ins'];
            }
            if (cont.O[intag])
                inOk = { ...inOk, ...cont.O[intag] };
            if (cont.N[intag])
            {
                inOk = { ...inOk };
                for (var k in cont.N[intag])
                    delete inOk[k];
            }
            return inOk;
        }

        // intag sets allowed child
        intag = ((el.F[intag] && intag != '#pcdata') || el.O[intag]) ? intag : 'div';
        if (cont.E[intag])
            return (!keep_bad ? '' : htmLawed.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        var inOk = getCont(intag);
        var ok = {}, q = [], ql; // q = seq list of open non-empty ele
        var _ob = '';
        var r, s, e, a, x, p;
        t = t.split('<');
        for (var i = 0, ci = t.length; i < ci; i++)
        {
            // get markup
            r = /^(\/?)([a-z1-6]+)([^>]*)>([\s\S]*)$/.exec(t[i]);
            if (!r)
                x = t[i];
            else
            {
                //s = r[1]; e = r[2]; a = r[3]; x = r[4];
                [ , s, e, a, x ] = r; // FIXME ES6
                // close tag
                if (s)
                {
                    if (cont.E[e] || !q.filter(x => x == e).length) // FIXME ES5.1 (IE9+)
                    {
                        // Empty/unopen
                    }
                    else if (p == e)
                    {
                        q.pop();
                        _ob += '</'+e+'>';
                        e = null;
                        // Last open
                    }
                    else
                    {
                        var add = ''; // Nesting - close open tags that need to be
                        while (q.length)
                        {
                            var d = q.pop();
                            if (d == e)
                                break;
                            else
                                add += '</'+d+'>';
                        }
                        _ob += add+'</'+e+'>';
                        e = null;
                    }
                }
                // open tag
                // cont.B ele needs el.B ele as child
                else if (cont.B[e] && x.trim().length > 0) // FIXME trim
                {
                    t[i] = e+a+'>';
                    t.splice(i+1, 0, 'div>'+x);
                    ci++; i--;
                    e = x = null;
                }
                else if (((ql && cont.B[p]) || (cont.B[intag] && !ql)) && !el.B[e] && !ok[e])
                {
                    t.splice(i, 0, 'div>');
                    ci++; i--;
                    e = x = null;
                }
                // if no open ele, intag = parent; mostly immediate parent-child relation should hold
                else if (!ql || !el.N[e] || !q.filter(_k => cont.N[_k]).length)
                {
                    if (!ok[e])
                    {
                        if (ql && cont.T[p])
                        {
                            _ob += '</'+q.pop()+'>';
                            e = x = null;
                            i--;
                        }
                    }
                    else
                    {
                        if (!cont.E[e])
                            q.push(e);
                        _ob += '<'+e+a+'>';
                        e = null;
                    }
                }
                // specific parent-child
                else if (cont.S[p] && cont.S[p][e])
                {
                    if (!cont.E[e])
                        q.push(e);
                    _ob += '<'+e+a+'>';
                    e = null;
                }
                else
                {
                    // nesting
                    add = '';
                    var q2 = [];
                    var _stop = 0;
                    for (var k = 0, kc = q.length; k < kc; k++)
                    {
                        d = q[k];
                        if (cont.S[d])
                        {
                            q2.push(d);
                            continue;
                        }
                        var ok2 = cont.I[d] ? el.I : el.F;
                        if (cont.O[d])
                            ok2 = { ...ok2, ...cont.O[d] };
                        if (cont.N[d])
                        {
                            ok2 = { ...ok2 };
                            for (var _k in cont.N[d])
                                delete ok2[_k];
                        }
                        if (!ok2[e])
                        {
                            if (!k && !inOk[e])
                            {
                                _stop = 1;
                                break;
                            }
                            add = '</'+d+'>';
                            while (++k < kc)
                                add = '</'+q[k]+'>'+add;
                            break;
                        }
                        else
                            q2.push(d);
                    }
                    if (!_stop)
                    {
                        q = q2;
                        if (!cont.E[e])
                            q.push(e);
                        _ob += add+'<'+e+a+'>';
                        e = null;
                    }
                }
            }
            // allowed (ok) in parent (p)
            ql = q.length;
            if (ql)
            {
                p = q[ql-1];
                ok = getCont(p);
            }
            else
            {
                ok = inOk;
                delete cont.I['del'];
                delete cont.I['ins'];
            }
            // bad tags, & ele content
            if (e && (keep_bad == 1 || (ok['#pcdata'] && (keep_bad == 3 || keep_bad == 5))))
                _ob += '&lt;'+s+e+a+'&gt;';
            if (x !== '' && x !== null)
            {
                if (x.trim().length > 0 && ((ql && cont.B[p]) || (cont.B[intag] && !ql))) // FIXME trim
                    _ob += '<div>'+x+'</div>';
                else if (keep_bad < 3 || ok['#pcdata'])
                    _ob += x;
                else if (x.indexOf("\x02\x04") >= 0)
                {
                    x = x.split(/(\x01\x02[^\x01\x02]+\x02\x01)+/);
                    for (var _i = 0; _i < x.length; _i++)
                    {
                        var v = x[_i];
                        _ob += v.substr(0, 2) == "\x01\x02" ? v : (keep_bad > 4 ? v.replace(/\S+/g, '') : '');
                    }
                }
                else if (keep_bad > 4)
                    _ob += x.replace(/\S+/g, '');
            }
        }

        // end
        while ((e = q.pop()))
            _ob += '</'+e+'>';
        return _ob;
        // eof
    },
    hl_cmtcd: function(t)
    {
        // comment/CDATA sec handler
        var n = t[3] == '-' ? 'comment' : 'cdata';
        var v = htmLawed.C[n];
        if (!v) return t;
        if (v == 1) return '';
        if (n == 'comment')
        {
            t = t.substr(4, t.length-3-4).replace(/--+/g, '-');
            if (t.substr(t.length-1) != ' ')
                t += ' ';
        }
        else
            t = t.substr(1, t.length-2);
        t = v == 2 ? htmLawed._strtr(t, { '&': '&amp;', '<' : '&lt;', '>': '&gt;' }) : t;
        t = (n == 'comment' ? "\x01\x02\x04!--"+t+"--\x05\x02\x01" : "\x01\x01\x04"+t+"\x05\x01\x01");
        return htmLawed._strtr(t, { '&': "\x03", '<' : "\x04", '>': "\x05" });
        // eof
    },
    ENT: { 'fnof':'402', 'Alpha':'913', 'Beta':'914', 'Gamma':'915', 'Delta':'916', 'Epsilon':'917', 'Zeta':'918', 'Eta':'919', 'Theta':'920', 'Iota':'921', 'Kappa':'922', 'Lambda':'923', 'Mu':'924', 'Nu':'925', 'Xi':'926', 'Omicron':'927', 'Pi':'928', 'Rho':'929', 'Sigma':'931', 'Tau':'932', 'Upsilon':'933', 'Phi':'934', 'Chi':'935', 'Psi':'936', 'Omega':'937', 'alpha':'945', 'beta':'946', 'gamma':'947', 'delta':'948', 'epsilon':'949', 'zeta':'950', 'eta':'951', 'theta':'952', 'iota':'953', 'kappa':'954', 'lambda':'955', 'mu':'956', 'nu':'957', 'xi':'958', 'omicron':'959', 'pi':'960', 'rho':'961', 'sigmaf':'962', 'sigma':'963', 'tau':'964', 'upsilon':'965', 'phi':'966', 'chi':'967', 'psi':'968', 'omega':'969', 'thetasym':'977', 'upsih':'978', 'piv':'982', 'bull':'8226', 'hellip':'8230', 'prime':'8242', 'Prime':'8243', 'oline':'8254', 'frasl':'8260', 'weierp':'8472', 'image':'8465', 'real':'8476', 'trade':'8482', 'alefsym':'8501', 'larr':'8592', 'uarr':'8593', 'rarr':'8594', 'darr':'8595', 'harr':'8596', 'crarr':'8629', 'lArr':'8656', 'uArr':'8657', 'rArr':'8658', 'dArr':'8659', 'hArr':'8660', 'forall':'8704', 'part':'8706', 'exist':'8707', 'empty':'8709', 'nabla':'8711', 'isin':'8712', 'notin':'8713', 'ni':'8715', 'prod':'8719', 'sum':'8721', 'minus':'8722', 'lowast':'8727', 'radic':'8730', 'prop':'8733', 'infin':'8734', 'ang':'8736', 'and':'8743', 'or':'8744', 'cap':'8745', 'cup':'8746', 'int':'8747', 'there4':'8756', 'sim':'8764', 'cong':'8773', 'asymp':'8776', 'ne':'8800', 'equiv':'8801', 'le':'8804', 'ge':'8805', 'sub':'8834', 'sup':'8835', 'nsub':'8836', 'sube':'8838', 'supe':'8839', 'oplus':'8853', 'otimes':'8855', 'perp':'8869', 'sdot':'8901', 'lceil':'8968', 'rceil':'8969', 'lfloor':'8970', 'rfloor':'8971', 'lang':'9001', 'rang':'9002', 'loz':'9674', 'spades':'9824', 'clubs':'9827', 'hearts':'9829', 'diams':'9830', 'apos':'39',  'OElig':'338', 'oelig':'339', 'Scaron':'352', 'scaron':'353', 'Yuml':'376', 'circ':'710', 'tilde':'732', 'ensp':'8194', 'emsp':'8195', 'thinsp':'8201', 'zwnj':'8204', 'zwj':'8205', 'lrm':'8206', 'rlm':'8207', 'ndash':'8211', 'mdash':'8212', 'lsquo':'8216', 'rsquo':'8217', 'sbquo':'8218', 'ldquo':'8220', 'rdquo':'8221', 'bdquo':'8222', 'dagger':'8224', 'Dagger':'8225', 'permil':'8240', 'lsaquo':'8249', 'rsaquo':'8250', 'euro':'8364', 'nbsp':'160', 'iexcl':'161', 'cent':'162', 'pound':'163', 'curren':'164', 'yen':'165', 'brvbar':'166', 'sect':'167', 'uml':'168', 'copy':'169', 'ordf':'170', 'laquo':'171', 'not':'172', 'shy':'173', 'reg':'174', 'macr':'175', 'deg':'176', 'plusmn':'177', 'sup2':'178', 'sup3':'179', 'acute':'180', 'micro':'181', 'para':'182', 'middot':'183', 'cedil':'184', 'sup1':'185', 'ordm':'186', 'raquo':'187', 'frac14':'188', 'frac12':'189', 'frac34':'190', 'iquest':'191', 'Agrave':'192', 'Aacute':'193', 'Acirc':'194', 'Atilde':'195', 'Auml':'196', 'Aring':'197', 'AElig':'198', 'Ccedil':'199', 'Egrave':'200', 'Eacute':'201', 'Ecirc':'202', 'Euml':'203', 'Igrave':'204', 'Iacute':'205', 'Icirc':'206', 'Iuml':'207', 'ETH':'208', 'Ntilde':'209', 'Ograve':'210', 'Oacute':'211', 'Ocirc':'212', 'Otilde':'213', 'Ouml':'214', 'times':'215', 'Oslash':'216', 'Ugrave':'217', 'Uacute':'218', 'Ucirc':'219', 'Uuml':'220', 'Yacute':'221', 'THORN':'222', 'szlig':'223', 'agrave':'224', 'aacute':'225', 'acirc':'226', 'atilde':'227', 'auml':'228', 'aring':'229', 'aelig':'230', 'ccedil':'231', 'egrave':'232', 'eacute':'233', 'ecirc':'234', 'euml':'235', 'igrave':'236', 'iacute':'237', 'icirc':'238', 'iuml':'239', 'eth':'240', 'ntilde':'241', 'ograve':'242', 'oacute':'243', 'ocirc':'244', 'otilde':'245', 'ouml':'246', 'divide':'247', 'oslash':'248', 'ugrave':'249', 'uacute':'250', 'ucirc':'251', 'uuml':'252', 'yacute':'253', 'thorn':'254', 'yuml':'255' },
    ENT_U: { 'quot':1, 'amp':1, 'lt':1, 'gt':1 },
    hl_ent: function(all, t)
    {
        // entity handler
        var C = htmLawed.C;
        if (t[0] != '#')
        {
            return (C.and_mark ? "\x06" : '&')+(htmLawed.ENT_U[t] ? t : (htmLawed.ENT[t]
                ? (!C.named_entity ? '#'+(C.hexdec_entity > 1 ? 'x'+parseInt(htmLawed.ENT[t]).toString(16) : htmLawed.ENT[t]) : t)
                : 'amp;'+t))+';';
        }
        t = t.substr(1);
        var n = /^\d+$/.exec(t) ? parseInt(t) : parseInt(t.replace(/[^a-f0-9]/gi, ''), 16);
        if (n < 9 || (n > 13 && n < 32) || n == 11 || n == 12 || (n > 126 && n < 160 && n != 133) ||
            (n > 55295 && (n < 57344 || (n > 64975 && n < 64992) || n == 65534 || n == 65535 || n > 1114111)))
        {
            return (C.and_mark ? "\x06" : '&')+"amp;#"+t+";";
        }
        return (C.and_mark ? "\x06" : '&')+'#'+(((/^\d+$/.exec(t) && C.hexdec_entity < 2) || !C.hexdec_entity) ? n : 'x'+n.toString(16))+';';
        // eof
    },
    hl_prot: function(p, c)
    {
        var C = htmLawed.C;
        var d = 'denied:';
        // check URL scheme
        var a = '', b = '';
        if (c === undefined)
        {
            c = 'style';
            b = p[1];
            a = p[3];
            p = p[2].trim();
        }
        c = C.schemes[c] || C.schemes['*'];
        if (c['!'] && p.substr(0, 7) != d)
            p = d+p;
        if (c['*'] || /^[#;?]/.exec(p) || p.substr(0, 7) == d)
            return b+p+a; // All ok, frag, query, param
        var m = /^([^:?[@!$()*,=\/\'\]]+?)(:|&#(58|x3a);|%3a|\\0{0,4}3a)[\s\S]/i.exec(p); // '
        if (m && !c[m[1].toLowerCase()]) // Denied prot
            return b+d+p+a;
        if (C.abs_url)
        {
            if (C.abs_url == -1 && p.indexOf(C.base_url) === 0)
            {
                // Make url rel
                p = p.substr(C.base_url.length);
            }
            else if (!m[1])
            {
                // Make url abs
                if (p.substr(0, 2) == '//')
                    p = C.base_url.substr(0, C.base_url.indexOf(':')+1)+p;
                else if (p[0] == '/')
                    p = C.base_url.replace(/(^[\s\S]+?:\/\/[^\/]+)([\s\S]*)/, '$1')+p;
                else if (!/^[\.\/]/.exec(p))
                    p = C.base_url+p;
                else
                {
                    m = /^([a-zA-Z\d\-+\.]+:\/\/[^\/]+)([\s\S]*)/.exec(C.base_url);
                    p = (m[2]+p).replace(/\/\.\//g, '/');
                    while (/\/([^\/]{3,}|[^\/\.]+?|\.[^\/\.]|[^\/\.]\.)\/\.\.\//.exec(p))
                        p = p.replace(/\/([^\/]{3,}|[^\/\.]+?|\.[^\/\.]|[^\/\.]\.)\/\.\.\//g, '/');
                    p = m[1]+p;
                }
            }
        }
        return b+p+a;
        // eof
    },
    hl_regex: function(p)
    {
        try
        {
            var re = new RegExp(p);
            return re && true;
        }
        catch (e)
        {
        }
        return false;
    },
    hl_spec: function(t)
    {
        // final $spec
        var s = {};
        t = t.trim().replace(/"(`[\s\S]|[^\"])*"/g, function(m)
        {
            m = htmLawed._strtr(m[0], {';': "\x01", '|':"\x02", '~':"\x03", ' ':"\x04", ',':"\x05", '/':"\x06", '(':"\x07", ')':"\x08", '`"':'"'});
            return m.substr(1, m.length-2);
        }).replace(/\s+/g, '');
        t = t.split(/;/);
        var e, a, _i;
        for (var i = t.length-1; i >= 0; i--)
        {
            var w = t[i];
            if (!w || (e = w.indexOf('=')) < 0 || (a = w.substr(e+1)) === '')
                continue;
            var x, y = {}, n = {}, p, v, m;
            a = a.split(',');
            for (_i = 0; _i < a.length; _i++)
            {
                v = a[_i];
                m = /^([a-z:\-\*]+)(?:\(([\s\S]*?)\))?/i.exec(v);
                if (!m)
                    continue;
                if (m[1] === '-*')
                {
                    n['*'] = 1;
                    continue;
                }
                x = m[1].toLowerCase();
                if (x[0] == '-')
                {
                    n[x.substr(1)] = 1;
                    continue;
                }
                if (!m[2])
                {
                    y[x] = 1;
                    continue;
                }
                m = m[2].split('/');
                for (var _j = 0; _j < m.length; _j++)
                {
                    if (!m[_j] || (p = m.indexOf('=')) == 0 || p < 5)
                    {
                        y[x] = 1;
                        continue;
                    }
                    y[x][m[_j].substr(0, p).toLowerCase()] = htmLawed._strtr(m[_j].substr(p+1), {"\x01":';', "\x02":'|', "\x03":'~', "\x04":' ', "\x05":',', "\x06":'/', "\x07":'(', "\x08":')'});
                }
                if (y[x].match && !htmLawed.hl_regex(y[x].match))
                    delete y[x].match;
                if (y[x].nomatch && !htmLawed.hl_regex(y[x].nomatch))
                    delete y[x].nomatch;
            }
            var _y = 0;
            for (_i in y)
            {
                _y = 1;
                break;
            }
            var _n = 0;
            for (_i in n)
            {
                _n = 1;
                break;
            }
            if (!_y && !_n)
                continue;
            w = w.substr(0, e);
            for (_i = 0; _i < w.length; _i++)
            {
                v = w[_i].toLowerCase();
                if (v === '')
                    continue;
                if (_y)
                    s[v] = y;
                if (_n)
                    s[v].n = n;
            }
        }
        return s;
        // eof
    },
    TAG: {
        D: { 'applet':1, 'center':1, 'dir':1, 'embed':1, 'font':1, 'isindex':1, 'menu':1, 's':1, 'strike':1, 'u':1 }, // Deprecated
        E: { 'area':1, 'br':1, 'col':1, 'embed':1, 'hr':1, 'img':1, 'input':1, 'isindex':1, 'param':1 }, // Empty ele
        N: { // Ele-specific
            'abbr':{'td':1, 'th':1},
            'accept-charset':{'form':1},
            'accept':{'form':1, 'input':1},
            'accesskey':{'a':1, 'area':1, 'button':1, 'input':1, 'label':1, 'legend':1, 'textarea':1},
            'action':{'form':1},
            'align':{
                'caption':1, 'embed':1, 'applet':1, 'iframe':1, 'img':1, 'input':1, 'object':1, 'legend':1, 'table':1,
                'hr':1, 'div':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'p':1, 'col':1, 'colgroup':1, 'tbody':1,
                'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1
            },
            'allowfullscreen':{'iframe':1},
            'alt':{'applet':1, 'area':1, 'img':1, 'input':1},
            'archive':{'applet':1, 'object':1},
            'axis':{'td':1, 'th':1},
            'bgcolor':{'embed':1, 'table':1, 'tr':1, 'td':1, 'th':1},
            'border':{'table':1, 'img':1, 'object':1},
            'bordercolor':{'table':1, 'td':1, 'tr':1},
            'cellpadding':{'table':1},
            'cellspacing':{'table':1},
            'char':{'col':1, 'colgroup':1, 'tbody':1, 'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1},
            'charoff':{'col':1, 'colgroup':1, 'tbody':1, 'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1},
            'charset':{'a':1, 'script':1},
            'checked':{'input':1},
            'cite':{'blockquote':1, 'q':1, 'del':1, 'ins':1},
            'classid':{'object':1},
            'clear':{'br':1},
            'code':{'applet':1},
            'codebase':{'object':1, 'applet':1},
            'codetype':{'object':1},
            'color':{'font':1},
            'cols':{'textarea':1},
            'colspan':{'td':1, 'th':1},
            'compact':{'dir':1, 'dl':1, 'menu':1, 'ol':1, 'ul':1},
            'coords':{'area':1, 'a':1},
            'data':{'object':1},
            'datetime':{'del':1, 'ins':1},
            'declare':{'object':1},
            'defer':{'script':1},
            'dir':{'bdo':1},
            'disabled':{'button':1, 'input':1, 'optgroup':1, 'option':1, 'select':1, 'textarea':1},
            'enctype':{'form':1},
            'face':{'font':1},
            'flashvars':{'embed':1},
            'for':{'label':1},
            'frame':{'table':1},
            'frameborder':{'iframe':1},
            'headers':{'td':1, 'th':1},
            'height':{'embed':1, 'iframe':1, 'td':1, 'th':1, 'img':1, 'object':1, 'applet':1},
            'href':{'a':1, 'area':1},
            'hreflang':{'a':1},
            'hspace':{'applet':1, 'img':1, 'object':1},
            'ismap':{'img':1, 'input':1},
            'label':{'option':1, 'optgroup':1},
            'language':{'script':1},
            'longdesc':{'img':1, 'iframe':1},
            'marginheight':{'iframe':1},
            'marginwidth':{'iframe':1},
            'maxlength':{'input':1},
            'method':{'form':1},
            'model':{'embed':1},
            'multiple':{'select':1},
            'name':{
                'button':1, 'embed':1, 'textarea':1, 'applet':1, 'select':1, 'form':1, 'iframe':1, 'img':1,
                'a':1, 'input':1, 'object':1, 'map':1, 'param':1
            },
            'nohref':{'area':1},
            'noshade':{'hr':1},
            'nowrap':{'td':1, 'th':1},
            'object':{'applet':1},
            'onblur':{'a':1, 'area':1, 'button':1, 'input':1, 'label':1, 'select':1, 'textarea':1},
            'onchange':{'input':1, 'select':1, 'textarea':1},
            'onfocus':{'a':1, 'area':1, 'button':1, 'input':1, 'label':1, 'select':1, 'textarea':1},
            'onreset':{'form':1},
            'onselect':{'input':1, 'textarea':1},
            'onsubmit':{'form':1},
            'pluginspage':{'embed':1},
            'pluginurl':{'embed':1},
            'prompt':{'isindex':1},
            'readonly':{'textarea':1, 'input':1},
            'rel':{'a':1},
            'rev':{'a':1},
            'rows':{'textarea':1},
            'rowspan':{'td':1, 'th':1},
            'rules':{'table':1},
            'scope':{'td':1, 'th':1},
            'scrolling':{'iframe':1},
            'selected':{'option':1},
            'shape':{'area':1, 'a':1},
            'size':{'hr':1, 'font':1, 'input':1, 'select':1},
            'span':{'col':1, 'colgroup':1},
            'src':{'embed':1, 'script':1, 'input':1, 'iframe':1, 'img':1},
            'standby':{'object':1},
            'start':{'ol':1},
            'summary':{'table':1},
            'tabindex':{'a':1, 'area':1, 'button':1, 'input':1, 'object':1, 'select':1, 'textarea':1}, // FIXME not specific! allowed everywhere
            'target':{'a':1, 'area':1, 'form':1},
            'type':{'a':1, 'embed':1, 'object':1, 'param':1, 'script':1, 'input':1, 'li':1, 'ol':1, 'ul':1, 'button':1},
            'usemap':{'img':1, 'input':1, 'object':1},
            'valign':{'col':1, 'colgroup':1, 'tbody':1, 'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1},
            'value':{'input':1, 'option':1, 'param':1, 'button':1, 'li':1},
            'valuetype':{'param':1},
            'vspace':{'applet':1, 'img':1, 'object':1},
            'width':{'embed':1, 'hr':1, 'iframe':1, 'img':1, 'object':1, 'table':1, 'td':1, 'th':1, 'applet':1, 'col':1, 'colgroup':1, 'pre':1},
            'wmode':{'embed':1},
            'xml:space':{'pre':1, 'script':1, 'style':1}
        },
        NE: { // Empty
            'allowfullscreen':1, 'checked':1, 'compact':1, 'declare':1, 'defer':1, 'disabled':1,
            'ismap':1, 'multiple':1, 'nohref':1, 'noresize':1, 'noshade':1, 'nowrap':1, 'readonly':1, 'selected':1
        },
        NP: { // Need scheme check; excludes style, on* & src
            'action':1, 'cite':1, 'classid':1, 'codebase':1, 'data':1, 'href':1,
            'longdesc':1, 'model':1, 'pluginspage':1, 'pluginurl':1, 'usemap':1
        },
        NU: { // Univ & exceptions
            'class':{'param':1, 'script':1},
            'dir':{'applet':1, 'bdo':1, 'br':1, 'iframe':1, 'param':1, 'script':1},
            'id':{'script':1},
            'lang':{'applet':1, 'br':1, 'iframe':1, 'param':1, 'script':1},
            'xml:lang':{'applet':1, 'br':1, 'iframe':1, 'param':1, 'script':1},
            'onclick':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'ondblclick':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onkeydown':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onkeypress':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onkeyup':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onmousedown':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onmousemove':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onmouseout':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onmouseover':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'onmouseup':{'applet':1, 'bdo':1, 'br':1, 'font':1, 'iframe':1, 'isindex':1, 'param':1, 'script':1},
            'style':{'param':1, 'script':1},
            'title':{'param':1, 'script':1}
        },
        // predef attr vals for $eAL & $aNE ele
        NL: {
            'all':1, 'baseline':1, 'bottom':1, 'button':1, 'center':1, 'char':1, 'checkbox':1, 'circle':1, 'col':1,
            'colgroup':1, 'cols':1, 'data':1, 'default':1, 'file':1, 'get':1, 'groups':1, 'hidden':1, 'image':1,
            'justify':1, 'left':1, 'ltr':1, 'middle':1, 'none':1, 'object':1, 'password':1, 'poly':1, 'post':1,
            'preserve':1, 'radio':1, 'rect':1, 'ref':1, 'reset':1, 'right':1, 'row':1, 'rowgroup':1,
            'rows':1, 'rtl':1, 'submit':1, 'text':1, 'top':1
        },
        AL: {
            'a':1, 'area':1, 'bdo':1, 'button':1, 'col':1, 'form':1, 'img':1, 'input':1, 'object':1, 'optgroup':1,
            'option':1, 'param':1, 'script':1, 'select':1, 'table':1, 'td':1, 'tfoot':1, 'th':1, 'thead':1, 'tr':1, 'xml:space':1
        },
        // dep attr:applicable ele
        ND: {
            'align':{
                'caption':1, 'div':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'hr':1, 'img':1,
                'input':1, 'legend':1, 'object':1, 'p':1, 'table':1
            },
            'bgcolor':{'table':1, 'td':1, 'th':1, 'tr':1},
            'border':{'img':1, 'object':1},
            'bordercolor':{'table':1, 'td':1, 'tr':1},
            'clear':{'br':1},
            'compact':{'dl':1, 'ol':1, 'ul':1},
            'height':{'td':1, 'th':1},
            'hspace':{'img':1, 'object':1},
            'language':{'script':1},
            'name':{'a':1, 'form':1, 'iframe':1, 'img':1, 'map':1},
            'noshade':{'hr':1},
            'nowrap':{'td':1, 'th':1},
            'size':{'hr':1},
            'start':{'ol':1},
            'type':{'li':1, 'ol':1, 'ul':1},
            'value':{'li':1},
            'vspace':{'img':1, 'object':1},
            'width':{'hr':1, 'pre':1, 'td':1, 'th':1}
        },
        AD: {
            'a':1, 'br':1, 'caption':1, 'div':1, 'dl':1, 'form':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1,
            'h6':1, 'hr':1, 'iframe':1, 'img':1, 'input':1, 'legend':1, 'li':1, 'map':1, 'object':1, 'ol':1,
            'p':1, 'pre':1, 'script':1, 'table':1, 'td':1, 'th':1, 'tr':1, 'ul':1
        },
        AR: { // rqd attr
            'area':{'alt':'area'},
            'bdo':{'dir':'ltr'},
            'form':{'action':''},
            'img':{'src':'', 'alt':'image'},
            'map':{'name':''},
            'optgroup':{'label':''},
            'param':{'name':''},
            'script':{'type':'text/javascript'},
            'textarea':{'rows':'10', 'cols':'50'}
        }
    },
    STYLE_ENT: {
        '&#x20;':' ', '&#32;':' ',
        '&#x45;':'e', '&#69;':'e', '&#x65;':'e', '&#101;':'e',
        '&#x58;':'x', '&#88;':'x', '&#x78;':'x', '&#120;':'x',
        '&#x50;':'p', '&#80;':'p', '&#x70;':'p', '&#112;':'p',
        '&#x53;':'s', '&#83;':'s', '&#x73;':'s', '&#115;':'s',
        '&#x49;':'i', '&#73;':'i', '&#x69;':'i', '&#105;':'i',
        '&#x4f;':'o', '&#79;':'o', '&#x6f;':'o', '&#111;':'o',
        '&#x4e;':'n', '&#78;':'n', '&#x6e;':'n', '&#110;':'n',
        '&#x55;':'u', '&#85;':'u', '&#x75;':'u', '&#117;':'u',
        '&#x52;':'r', '&#82;':'r', '&#x72;':'r', '&#114;':'r',
        '&#x4c;':'l', '&#76;':'l', '&#x6c;':'l', '&#108;':'l',
        '&#x28;':'(', '&#40;':'(', '&#x29;':')', '&#41;':')',
        '&#x3a;':':', '&#58;':':', '&#x22;':'"', '&#34;':'"', // FIXME PHP version has bug here: bad codes for ':'
        '&#x27;':"'", '&#39;':"'", '&#x2f;':'/', '&#47;':'/',
        '&#x2a;':'*', '&#42;':'*', '&#x5c;':'\\', '&#92;':'\\'
    },
    FONT_SIZE: {
        '0':'xx-small', '1':'xx-small', '2':'small', '3':'medium', '4':'large',
        '5':'x-large', '6':'xx-large', '7':'300%', '-1':'smaller', '-2':'60%',
        '+1':'larger', '+2':'150%', '+3':'200%', '+4':'300%'
    },
    hl_tag: function(t)
    {
        // tag/attribute handler
        var C = htmLawed.C;
        var S = htmLawed.S;
        var TAG = htmLawed.TAG;
        // invalid < >
        if (t == '< ')
            return '&lt; ';
        if (t == '>')
            return '&gt;';
        var e;
        var m = /^<(\/?)([a-zA-Z][a-zA-Z1-6]*)([^>]*?)\s?>$/m.exec(t);
        if (!m)
            return t.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        else if (!C.elements[e = m[2].toLowerCase()])
            return (C.keep_bad%2) ? t.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        // attr string
        var a = m[3].trim().replace(/[\n\r\t]/g, ' ');
        // tag transform
        var tr_tag_attr = '';
        if (C.make_tag_strict && TAG.D[e])
        {
            [ e, a, tr_tag_attr ] = htmLawed.hl_tag2(e, a, C.make_tag_strict);
            if (!e)
                return (C.keep_bad%2) ? t.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        }
        // close tag
        if (m[1])
            return !TAG.E[e] ? (!C.hook_tag ? '</'+e+'>' : C.hook_tag(e)) : ((C.keep_bad%2) ? t.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '');
        // open tag & attr
        var lcase;
        if (C.lc_std_val)
            lcase = TAG.AL[e] ? 1 : 0;
        var depTr = 0;
        if (C.no_deprecated_attr)
        {
            // dep attr:applicable ele
            depTr = TAG.AD[e] ? 1 : 0;
        }
        // attr name-vals
        if (a.indexOf("\x01") >= 0)
        {
            // No comment/CDATA sec
            a = a.replace(/\x01[^\x01]*\x01/g, '');
        }
        var mode = 0;
        a = a.replace(/^[ \/]+|[ \/]+$/g, '');
        var aA = {};
        var nm;
        while (a !== '')
        {
            var w = 0;
            switch (mode)
            {
            case 0: // Name
                m = /^[a-zA-Z][\-a-zA-Z:]+/.exec(a);
                if (m)
                {
                    nm = m[0].toLowerCase();
                    w = mode = 1;
                    a = a.substr(m[0].length).replace(/^\s+/, '');
                }
                break;
            case 1:
                if (a[0] == '=')
                {
                    // =
                    w = 1;
                    mode = 2;
                    a = a.replace(/^[ =]+/, '');
                }
                else
                {
                    // No val
                    w = 1;
                    mode = 0;
                    a = a.replace(/^\s+/, '');
                    aA[nm] = '';
                }
                break;
            case 2: // Val
                m = /^((?:"[^\"]*")|(?:'[^\']*\')|(?:\s*[^\s"']+))([\s\S]*)/.exec(a);
                if (m)
                {
                    a = m[2].replace(/^\s+/, '');
                    m = m[1];
                    w = 1;
                    mode = 0;
                    aA[nm] = (m[0] == '"' || m[0] == '\'' ? m.substr(1, m.length-2) : m).replace(/</g, '&lt;').trim();
                }
                break;
            }
            if (w == 0)
            {
                // Parse errs, deal with space, " & '
                a = a.replace(/^(?:"[^\"]*("|$)|'[^\']*('|$)|\S)*\s*/g, '');
                mode = 0;
            }
        }
        if (mode == 1)
            aA[nm] = '';
        // clean attrs
        var rl = S[e] || {};
        a = {};
        var nfr = 0;
        var k, v;
        for (k in aA)
        {
            v = aA[k];
            if (((C.deny_attribute['*'] ? C.deny_attribute[k] : !C.deny_attribute[k]) &&
                (TAG.N[k] && TAG.N[k][e] || (TAG.NU[k] && !TAG.NU[k][e])) &&
                (!rl.n || !rl.n[k] && !rl.n['*'])) || rl[k])
            {
                if (TAG.NE[k])
                    v = k;
                else if (lcase && ((e != 'button' || e != 'input') || k == 'type'))
                {
                    // Rather loose but ?not cause issues
                    var v2 = v.toLowerCase();
                    v = TAG.NL[v2] ? v2 : v;
                }
                if (k == 'style' && !C.style_pass)
                {
                    if (v.indexOf('&#') >= 0)
                        v = htmLawed._strtr(v, htmLawed.STYLE_ENT);
                    v = v.replace(/(url(?:\()(?: )*(?:'|"|&(?:quot|apos);)?)([\s\S]+?)((?:"|'|&(?:quot|apos);)?(?: )*(?:\)))/gi, function(m, m1, m2, m3)
                    {
                        return htmLawed.hl_prot([ m, m1, m2, m3 ]);
                    });
                    v = !C.css_expression ? v.replace(/\\\S|(\/|(%2f))(\*|(%2a))/gi, ' ').replace(/expression/gi, ' ') : v;
                }
                else if (TAG.NP[k] || k.indexOf('src') >= 0 || k[0] == 'o')
                {
                    // double-quoted char is soft-hyphen; appears here as "­" or hyphen or something else depending on viewing software
                    v = (v.indexOf('&') >= 0 ? v.replace(/&#xad;|&#173;|&shy;/g, ' ') : v).replace(/­/g, ' ');
                    v = htmLawed.hl_prot(v, k);
                    if (k == 'href')
                    {
                        // X-spam
                        if (C.anti_mail_spam && v.indexOf('mailto:') === 0)
                            v = v.replace(/@/g, htmLawed._htmlspecialchars(C.anti_mail_spam));
                        else if (C.anti_link_spam)
                        {
                            var r1 = C.anti_link_spam[1];
                            if (r1 && (new RegExp(r1)).exec(v))
                                continue;
                            var r0 = C.anti_link_spam[0];
                            if (r0 && (new RegExp(r0)).exec(v))
                            {
                                if (a.rel)
                                {
                                    if (!/\bnofollow\b/i.exec(a.rel))
                                        a.rel += ' nofollow';
                                }
                                else if (aA['rel'])
                                {
                                    if (!/\bnofollow\b/i.exec(aA['rel']))
                                        nfr = 1;
                                }
                                else
                                    a.rel = 'nofollow';
                            }
                        }
                    }
                }
                if (rl[k] && rl[k] instanceof Array && (v = htmLawed.hl_attrval(k, v, rl[k])) === 0)
                    continue;
                a[k] = v.replace(/"/g, '&quot;'); // "
            }
        }
        if (nfr)
            a.rel = a.rel ? a.rel+' nofollow' : 'nofollow';

        // rqd attr
        if (TAG.AR[e])
        {
            for (k in TAG.AR[e])
                if (!a[k])
                    a[k] = TAG.AR[e][k] || k;
        }

        // depr attrs
        if (depTr)
        {
            var c = [];
            for (k in a)
            {
                v = a[k];
                if (k == 'style' || !TAG.ND[k] || !TAG.ND[k][e])
                    continue;
                if (k == 'align')
                {
                    delete a[k];
                    if (e == 'img' && (v == 'left' || v == 'right'))
                        c.push('float: '+v);
                    else if ((e == 'div' || e == 'table') && v == 'center')
                        c.push('margin: auto');
                    else
                        c.push('text-align: '+v);
                }
                else if (k == 'bgcolor')
                    c.push('background-color: '+v);
                else if (k == 'border')
                    c.push('border: '+v+'px');
                else if (k == 'bordercolor')
                    c.push('border-color: '+v);
                else if (k == 'clear')
                    c.push('clear: '+(v != 'all' ? v : 'both'));
                else if (k == 'compact')
                    c.push('font-size: 85%');
                else if (k == 'height' || k == 'width')
                    c.push(k+': '+(v[0] != '*' ? v+(/^\d+$/.exec(v) ? 'px' : '') : 'auto'));
                else if (k == 'hspace')
                    c.push('margin-left: '+v+'px; margin-right: '+v+'px');
                else if (k == 'language' && !a.type)
                    a.type = 'text/'+v.toLowerCase();
                else if (k == 'name')
                {
                    if (!a.id && /^[a-zA-Z][a-zA-Z\d\.:_\-]*$/.exec(v))
                        a.id = v;
                    if (!(C.no_deprecated_attr == 2 || (e != 'a' && e != 'map')))
                    {
                        // do not delete a[name]
                        continue;
                    }
                }
                else if (k == 'noshade')
                    c.push('border-style: none; border: 0; background-color: gray; color: gray');
                else if (k == 'nowrap')
                    c.push('white-space: nowrap');
                else if (k == 'size')
                    c.push('size: '+v+'px');
                else if (k == 'start' || k == 'value')
                {
                    // just delete
                }
                else if (k == 'type')
                {
                    var ol_type = { 'i':'lower-roman', 'I':'upper-roman', 'a':'lower-latin', 'A':'upper-latin', '1':'decimal' };
                    c.push('list-style-type: '+(ol_type[v] || 'decimal'));
                }
                else if (k == 'vspace')
                    c.push('margin-top: '+v+'px; margin-bottom: '+v+'px');
                else
                    continue;
                delete a[k];
            }
            if (c.length)
            {
                c = c.join('; ');
                a.style = a.style ? a.style.replace(/[ ;]+$/, '')+'; '+c+';' : c+';';
            }
        }

        // unique ID
        if (C.unique_ids && a.id)
        {
            if (!/^[A-Za-z][A-Za-z0-9_\-\.:]*$/.exec(a.id) ||
                htmLawed.hl_Ids[a.id] && C.unique_ids == 1)
                delete a.id;
            else
            {
                while (htmLawed.hl_Ids[a.id])
                    a.id = C.unique_ids+a.id; // FIXME 1 2 3 4 ... ?
                htmLawed.hl_Ids[a.id] = 1;
            }
        }

        // xml:lang
        if (C['xml:lang'] && a.lang)
        {
            a['xml:lang'] = a['xml:lang'] || a['lang'];
            if (C['xml:lang'] == 2)
                delete a['lang'];
        }

        // for transformed tag
        if (tr_tag_attr)
            a.style = a.style ? a.style.replace(/[ ;]+$/, '')+'; '+tr_tag_attr : tr_tag_attr;

        // return with empty ele /
        if (!C.hook_tag)
        {
            aA = '';
            for (k in a)
                aA += ' '+k+'="'+a[k]+'"';
            return '<'+e+aA+(TAG.E[e] ? ' /' : '')+'>';
        }
        return C.hook_tag(e, a);
        // eof
    },
    hl_tag2: function(e, a, t)
    {
        if (!t)
            t = 1;
        // transform tag
        if (e == 'center')
            return [ 'div', a, 'text-align: center;' ];
        else if (e == 'dir' || e == 'menu')
            return [ 'ul', a, '' ];
        else if (e == 's' || e == 'strike')
            return [ 'span', a, 'text-decoration: line-through;' ];
        else if (e == 'u')
            return [ 'span', a, 'text-decoration: underline;' ];
        else if (e == 'font')
        {
            var a2 = '';
            var m;
            while ((m = /(^|\s)(color|size)\s*=\s*('|")?([\s\S]+?)(\3|\s|$)/i.exec(a))) // '
            {
                a = a.replace(m[0], ' ');
                m[4] = m[4].trim();
                if (m[2].toLowerCase() == 'color')
                    a2 += ' color: '+m[4].replace(/"/g, "'")+';'; // '
                else if ((m = htmLawed.FONT_SIZE[m[4]]))
                    a2 += ' font-size: '+m.replace(/"/g, "'")+';'; // '
            }
            while ((m = /(^|\s)face\s*=\s*('|")([^=]+)\2/i.exec(a) || /(^|\s)face\s*=(\s*)(\S+)/i.exec(a))) // FIXME: PHP version has bug here: ("|')?
            {
                a = a.replace(m[0], ' ');
                a2 += ' font-family: '+m[3].trim().replace(/"/g, "'")+';'; // '
            }
            return [ 'span', a, a2.replace(/<|^\s+/g, '') ];
        }
        if (t == 2)
            return [ 0, a, 0 ];
        return [ e, a, '' ];
        // eof
    },
    TIDY: {
        a: {'br':1},
        b: {'button':1, 'input':1, 'option':1, 'param':1},
        c: {
            'caption':1, 'dd':1, 'dt':1, 'h1':1, 'h2':1, 'h3':1, 'h4':1, 'h5':1, 'h6':1, 'isindex':1,
            'label':1, 'legend':1, 'li':1, 'object':1, 'p':1, 'pre':1, 'td':1, 'textarea':1, 'th':1
        },
        d: {
            'address':1, 'blockquote':1, 'center':1, 'colgroup':1, 'dir':1, 'div':1, 'dl':1, 'fieldset':1,
            'form':1, 'hr':1, 'iframe':1, 'map':1, 'menu':1, 'noscript':1, 'ol':1, 'optgroup':1, 'rbc':1,
            'rtc':1, 'ruby':1, 'script':1, 'select':1, 'table':1, 'tbody':1, 'tfoot':1, 'thead':1, 'tr':1, 'ul':1
        }
    },
    hl_tidy: function(t, w, p)
    {
        // Tidy/compact HTM
        if (' pre,script,textarea'.indexOf("$p,") >= 0)
            return t;
        var _repl = function(m)
        {
            return m[1]+htmLawed._strtr(m[3], {'<': "\x01", '>':"\x02", "\n":"\x03", "\r":"\x04", "\t":"\x05", ' ':"\x07"})+m[4];
        };
        t = t.replace(/(<(!\[CDATA\[))([\s\S]+?)(\]\]>)/g, _repl)
            .replace(/(<(!--))([\s\S]+?)(-->)/g, _repl)
            .replace(/(<(pre|script|textarea)[^>]*?>)([\s\S]+?)(<\/\2>)/g, _repl)
            .replace(/\s+/g, ' ');
        if (w == -1)
            return htmLawed._strtr(t, {"\x01":'<', "\x02":'>', "\x03":"\n", "\x04":"\r", "\x05":"\t", "\x07":' '});
        w = w.toLowerCase();
        var s = w.indexOf('t') >= 0 ? "\t" : ' ';
        var m = /\d/.exec(w);
        s = new Array(1+(m ? m[0] : (s == "\t" ? 1 : 2))).join(s); // str_repeat == new Array(n+1).join(s)
        m = /[ts]([1-9])/.exec(w);
        var N = m ? m[1] : 0;
        var T = t.split('<');
        var X = 1;
        var n, e, r;
        var _ob, ss = '';
        _tidy: while (X)
        {
            n = N;
            t = T;
            _ob = '';
            if (htmLawed.TIDY.d[p])
                _ob += (ss += s);
            _ob += t.shift().replace(/^\s+/, '');
            for (var i = 0, j = t.length; i < j; i++)
            {
                [ e, r ] = t[i].split('>');
                var x = e[0] == '/' ? 0 : (e.substr(e.length-1) == '/' ? 1 : (e[0] != '!' ? 2 : -1));
                var _p = e.indexOf(' ');
                var y = !x ? e.replace(/^\/+/, '') : (x > 0 ? (_p < 0 ? e : e.substr(0, _p)) : 0);
                e = '<'+e+'>';
                if (htmLawed.TIDY.d[y])
                {
                    if (!x)
                    {
                        if (n)
                        {
                            ss = ss.substr(0, ss.length-s.length);
                            _ob += "\n" + ss + e + "\n" + ss;
                        }
                        else
                        {
                            N++;
                            continue _tidy;
                        }
                    }
                    else
                    {
                        _ob += "\n"+ss+e+"\n";
                        _ob += (x != 1 ? (ss += s) : ss);
                    }
                    _ob += r;
                    continue;
                }
                var f = "\n"+ss;
                if (htmLawed.TIDY.c[y])
                {
                    if (!x)
                        _ob += e+f+r;
                    else
                        _ob += f+e+r;
                }
                else if (htmLawed.TIDY.b[y])
                    _ob += f+e+r;
                else if (htmLawed.TIDY.a[y])
                    _ob += e+f+r;
                else if (!y)
                    _ob += f+e+f+r;
                else
                    _ob += e+r;
            }
            X = 0;
        }
        t = _ob.replace(/[\n]\s*?[\n]+/g, "\n").replace(/\n | \n/g, "\n");
        var l = w.indexOf('r') >= 0 ? (w.indexOf('n') >= 0 ? "\r\n" : "\r") : null;
        if (l)
            t = t.replace(/\n/g, l);
        return htmLawed._strtr(t, {"\x01":'<', "\x02":'>', "\x03":"\n", "\x04":"\r", "\x05":"\t", "\x07":' '});
        // eof
    },
    hl_version: function()
    {
        return '1.1.22';
    }
};
