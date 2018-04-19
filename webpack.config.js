"use strict";
let path = require("path")
let fs = require("fs")

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
)
let version = pkg.version


module.exports = {
    mode: 'development',
    entry: [
        "./src/index.js"
    ],
    module: {
        rules: [
            {
                test: path.join(__dirname, "src"),
                loader: "babel-loader"
            }
        ]
    },
    resolve: {
        alias: {
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing")
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `jsds-${version}.js`
    }
}
