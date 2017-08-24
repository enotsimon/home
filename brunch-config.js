exports.config = {
  notifications: false,
  // See http://brunch.io/#documentation for docs.
  // To use a separate vendor.js bundle, specify two files path
  // https://github.com/brunch/brunch/blob/stable/docs/config.md#files
  // joinTo: {
  //  "js/app.js": /^(web\/static\/js)/,
  //  "js/vendor.js": /^(web\/static\/vendor)|(deps)/
  // }
  //
  // To change the order of concatenation of files, explicitly mention here
  // https://github.com/brunch/brunch/tree/master/docs#concatenation
  // order: {
  //   before: [
  //     "web/static/vendor/js/jquery-2.1.1.js",
  //     "web/static/vendor/js/bootstrap.min.js"
  //   ]
  // }
  files: {
    javascripts: {
      joinTo: "js/app.js"
    },
    stylesheets: {
      joinTo: "css/app.css"
    },
    templates: {
      joinTo: "js/app.js"
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    assets: [
      /^(static)/
    ]
  },

  paths: {
    // Dependencies and current project directories to watch
    watched: ["js", "css"],
    // Where to compile files to
    public: "public"
  },

  // Configure your plugins
  plugins: {
    babel: {
      // Do not use ES6 compiler in vendor code
      //ignore: [/web\/static\/vendor/]
    }
  },

  /*
  modules: {
    autoRequire: {
      "js/app.js": ["public/js/app"],
      "js\\app.js": ["public/js/app"]
    }
  },
  */

  npm: {
    enabled: true,
    whitelist: [],
  }
};
