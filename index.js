"use strict";

const proxy = require("http-proxy-middleware");
const url = require("url");
const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

module.exports = function(oSettings) {
  var oNeoApp = oSettings.neoApp,
    oDestinations = oSettings.destinations,
    oManifest = oSettings.manifest,
    oAgent = oSettings.agent;

  var app = express();

  let cdn = oSettings.cdn || "https://ui5.sap.com";
  if (oSettings.version) {
    cdn += "/" + oSettings.version;
  }

  const homePage =
    "/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html";
  // redirect to FLP
  app.get("/", async (req, res) => {
    res.redirect(homePage);
  });

  // redirect to FLP
  app.get(homePage, async (req, res) => {
    let flp = await fetch(cdn + homePage, {
      agent: oAgent
    });
    const $ = cheerio.load(await flp.text());
    $("#sap-ui-bootstrap").attr().src = cdn + "/resources/sap-ui-core.js";
    $("#sap-ushell-bootstrap").attr().src =
      cdn + "/test-resources/sap/ushell/bootstrap/sandbox.js";

    res.send($.html());
  });

  if (oNeoApp && oNeoApp.routes) {
    oNeoApp.routes.forEach(function(oRoute) {
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

            let sVersion = oSettings.version || oTarget.version;

            if (oTarget.name === "sapui5" && sVersion) {
              oOptions.target = oOptions.target + "/" + sVersion;
            }
          }
        }

        if (oRoute.path && oTarget.entryPath) {
          var oRouteNew = {};
          var sPathOld = "^" + oRoute.path;
          oRouteNew[sPathOld] = oTarget.entryPath;
          oOptions.pathRewrite = oRouteNew;
        }

        app.use(oRoute.path, proxy(oOptions));
      }
    });
  }

  //static paths
  ["appconfig", "webapp"].concat(oSettings.static).forEach(function(sPath) {
    if (sPath) app.use("/" + sPath, express.static(sPath));
  });

  return app;
};
