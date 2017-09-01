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

    if (oNeoApp && oNeoApp.routes) {
        oNeoApp.routes.forEach(function (oRoute) {

            var oTarget = oRoute.target;
            if (oTarget) {

                // proxy options
                var oOptions = {};

                // search for destination
                if (oDestinations && oTarget.name) {
                    var oDestination = oDestinations[oTarget.name];
                    if (oDestination) {
                        oOptions.target = oDestination.target;
                        oOptions.changeOrigin = true;
                        if (oDestination.useProxy) {
                            oOptions.agent = oAgent;
                        }
                        if (oTarget.version) {
                            oOptions.target = oOptions.target + "/" + oTarget.version;
                        }
                    }

                    var oRouteNew = {};
                    var sPathOld = "^" + oRoute.path;
                    oRouteNew[sPathOld] = oTarget.entryPath;
                    oOptions.pathRewrite = oRouteNew;

                    app.use(oRoute.path, proxy(oOptions));

                } else if (oRoute.path && oTarget.entryPath) {

                    app.route(oRoute.path + '/:path')
                        .get(function (req, res) {
                            res.redirect(oTarget.entryPath + req.param.path);
                        });

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

