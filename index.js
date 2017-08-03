module.exports = require('express');

/* 
const express = require('express');
const _ = require('lodash');
const proxy = require('http-proxy-middleware');
const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');

var app = express();
var oNeoApp = require('./neo-app.json');
var oDestinations = require('./neo-dest.json');

// corporate proxy to connect to
var proxyServer = "http://webproxy.corp.booking.com:3128";

if (oDestinations && oNeoApp && oNeoApp.routes) {
    oNeoApp.routes.forEach(function (oRoute) {
        var oTarget = oRoute.target;
        if (oTarget && oTarget.name) {

            var oDestination = oDestinations[oTarget.name];
            if (oDestination) {

                var oRouteNew = {};
                var sPathOld = "^" + oRoute.path;
                oRouteNew[sPathOld] = oTarget.entryPath;

                var oOptions = {
                    target: oDestination.target,
                    changeOrigin: true,
                    pathRewrite: oRouteNew
                };

                if (oDestination.useProxy) {
                    oOptions.agent = new HttpsProxyAgent(proxyServer);
                }

                if (oTarget.version) {
                    oOptions.target = oOptions.target + "/" + oTarget.version;
                }



                app.use(oRoute.path, proxy(oOptions));
            }

        }

    });
}

//redirect by default to launchpad
if (oNeoApp && oNeoApp.welcomeFile) {
    app.get('/', function (req, res) {
        res.redirect(url.format({
            pathname: oNeoApp.welcomeFile,
            query: {
                "sap-ushell-test-url-url": "../../../../../webapp",
                "sap-ushell-test-url-additionalInformation": "SAPUI5.Component=booking.fiori.ovp.payments"
            },
            hash: "Test-url"
        }));
    });
}

//static paths
["appconfig", "webapp"].forEach(function (sPath) {
    app.use("/" + sPath, express.static(sPath));
});

app.listen(3000); */