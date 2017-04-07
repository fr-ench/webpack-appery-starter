'use strict';

var autoprefixer         = require('autoprefixer');
var postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
var cssnano              = require('cssnano');

var IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

function PUSH_IF(arr, condition, element) {
  if(condition) {
    arr.push(element);
  }
};

module.exports = (function(){
    let postPlugins = [
        autoprefixer({ browsers: ["last 5 versions", "ie 9"] }),
        postcssFlexbugsFixes
    ];
    
    PUSH_IF(postPlugins, !IS_DEVELOPMENT, cssnano({
                safe: true,
                zindex: false,
                filterPlugins: false,
                autoprefixer: { add: false, remove: false },
                discardComments: { removeAll: true },
                convertValues: { length: false }
            }));

    return postPlugins;
})();