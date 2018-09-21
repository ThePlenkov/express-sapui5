"use strict";

const proxy = require("http-proxy-middleware");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const noCache = require("nocache");

let serveUi5 = function(oSettings, app) {
  var oNeoApp = oSettings.neoApp,
    oDestinations = oSettings.destinations,
    oManifest = oSettings.manifest,
    oAgent = oSettings.agent;

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
    if ($("#sap-ui-bootstrap").attr()) {
      $("#sap-ui-bootstrap").attr().src = cdn + "/resources/sap-ui-core.js";
    }
    if ($("#sap-ushell-bootstrap").attr()) {
      $("#sap-ushell-bootstrap").attr().src =
        cdn + "/test-resources/sap/ushell/bootstrap/sandbox.js";
    }

    res.send($.html());
  });

  // no odata cache (including metadata)
  app.use("/sap/opu", noCache());

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
            oOptions.secure = false;
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

  return app;
};

let bInitialized;

module.exports = oSettings => (req, res, next) => {
  if (!bInitialized) {
    bInitialized = true;
    serveUi5(oSettings, req.app);
  }
  next();
};
