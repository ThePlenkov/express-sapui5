'use strict';

const proxy = require('http-proxy-middleware');
const url = require('url');
const express = require('express');

module.exports = function (
    oSettings
) {

    var oNeoApp = oSettings.neoApp,
        oDestinations = oSettings.destinations,
        oManifest = oSettings.manifest,
        oAgent = oSettings.agent;

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
    if (oNeoApp && oNeoApp.welcomeFile) {
        app.get('/', function (req, res) {

            var oURL = {
                pathname: oNeoApp.welcomeFile
            };

            if (oManifest && oManifest["sap.app"]) {
                Object.assign(oURL, {
                    query: {
                        "sap-ushell-test-url-url": "../../../../../webapp",
                        "sap-ushell-test-url-additionalInformation": "SAPUI5.Component=" + oManifest["sap.app"].id
                    },
                    hash: "Test-url"

                });
            }

            res.redirect(url.format(oURL));
        });
    }

    //static paths
    ["appconfig", "webapp"].forEach(function (sPath) {
        app.use("/" + sPath, express.static(sPath));
    });

    return app;

};

