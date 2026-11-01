// CloudFront Function (cloudfront-js-2.0), viewer-request, distribution REDACTED-DISTRIBUTION-ID
// Keeps legacy Ghost URLs working after the move to Hugo + S3 website hosting.
var CANONICAL_HOST = 'focaaby.com';

function qs(request) {
    var q = request.querystring, parts = [];
    for (var k in q) {
        if (q[k].multiValue) {
            q[k].multiValue.forEach(function (v) { parts.push(k + (v.value !== '' ? '=' + v.value : '')); });
        } else {
            parts.push(k + (q[k].value !== '' ? '=' + q[k].value : ''));
        }
    }
    return parts.length ? '?' + parts.join('&') : '';
}

function redirect(request, location) {
    return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://' + CANONICAL_HOST + location + qs(request) } }
    };
}

function handler(event) {
    var request = event.request;
    var host = request.headers.host ? request.headers.host.value : CANONICAL_HOST;
    var uri = request.uri;

    // www -> apex
    if (host !== CANONICAL_HOST) {
        return redirect(request, uri);
    }

    // Ghost AMP pages: /<slug>/amp/ -> /<slug>/
    var m = uri.match(/^(.*\/)amp\/?$/);
    if (m) { return redirect(request, m[1]); }

    // Ghost sitemap index children -> Hugo single sitemap
    if (/^\/sitemap-[a-z]+\.xml$/.test(uri)) { return redirect(request, '/sitemap.xml'); }

    // Ghost /page/1/ -> listing root
    m = uri.match(/^(.*\/)page\/1\/?$/);
    if (m) { return redirect(request, m[1]); }

    if (uri === '/favicon.png') { return redirect(request, '/favicon.ico'); }

    // Ghost RSS: /rss/, /tag/x/rss/, /author/x/rss/ -> Hugo index.xml
    m = uri.match(/^(.*\/)rss\/$/);
    if (m) { request.uri = m[1] + 'index.xml'; return request; }

    // Ghost always used trailing slashes for pages
    var last = uri.substring(uri.lastIndexOf('/') + 1);
    if (last !== '' && last.indexOf('.') === -1) { return redirect(request, uri + '/'); }

    return request;
}
