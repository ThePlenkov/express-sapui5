'use strict';

const proxy = require('http-proxy-middleware');
const url = require('url');
const express = require('express');

module.exports = function (oNeoApp, oDestinations, oManifest, oAgent) {

    var app = express();

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
                        oOptions.agent = oAgent;
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
    if (oNeoApp && oNeoApp.welcomeFile && oManifest && oManifest["sap.app"]) {
        app.get('/', function (req, res) {
            res.redirect(url.format({
                pathname: oNeoApp.welcomeFile,
                query: {
                    "sap-ushell-test-url-url": "../../../../../webapp",
                    "sap-ushell-test-url-additionalInformation": "SAPUI5.Component=" + oManifest["sap.app"].id
                },
                hash: "Test-url"
            }));
        });
    }

    //static paths
    ["appconfig", "webapp"].forEach(function (sPath) {
        app.use("/" + sPath, express.static(sPath));
    });

    return app;

};

