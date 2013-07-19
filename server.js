"use strict"

module.exports = function() {
    var express = require( "express" ),
        fs = require( "fs" ),

        index = fs.readFileSync( "app/index.html", "utf-8" ),
        js = fs.readFileSync( "benchmarks/replaceWith/js.js", "utf-8" ),
        html = fs.readFileSync( "benchmarks/replaceWith/html.html", "utf-8" );

    grunt.registerTask( "perf", function() {
        var app = express();

        app.get( "/", function( req, res ) {
            index = index.replace( "{{html}}", html );
            index = index.replace( "{{js}}", js )

            console.log(" ");

            return res.send( index );
        });

        app.use( "/static/", express.static( __dirname + "/app/static" ) )
        app.listen( 7000 );

        this.async();
    });
}
