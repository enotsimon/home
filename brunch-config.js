// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      'vendor.js': /^(?!app)/,
      'app.js': /^app/
    }
  },
  stylesheets: {joinTo: 'app.css'}
};

exports.plugins = {
  babel: {
    presets: ['latest', 'react'],
    plugins: ["transform-object-rest-spread"]
  }
};

exports.server = {
  port: 3334
  //base: '/myapp',
  //stripSlashes: true
};
