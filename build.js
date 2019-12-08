"use strict";

const browserify = require("browserify");

browserify({ paths: [ ".", "./src", "./node_modules" ], }).
  plugin("tsify").
  external("./sar_tree.json").
  add("./index.ts").
  bundle().
  pipe(process.stdout);
