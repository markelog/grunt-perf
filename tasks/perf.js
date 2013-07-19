"use strict"

module.exports = function( grunt ) {
    var tmp = ".perf",

        express = require( "express" ),
        phantomjs = require( "grunt-lib-phantomjs" ).init( grunt ),
        git = require( "../lib/git" ),

        fs = require( "fs" ),
        path = require( "path" );


    phantomjs.on( "start", function( event ) {
        grunt.log.oklns( "Test started" );
    });

    grunt.registerTask( "perf", function( name ) {
        var done = this.async(),

            suite,

            options = this.options(),
            tests = {},

            benchmarks = options.benchmarks;

        grunt.file.expand( benchmarks ).forEach(function( name ) {
            var benchmark = tests[ name.split( "/" )[ 1 ] ] = {};

            grunt.file.recurse( name, function( abspath ) {
                benchmark[ abspath.split( "." )[ 1 ] ] = grunt.file.read( abspath );
            });
        });

        grunt.file.delete( tmp );
        grunt.file.mkdir( tmp );

        suite = grunt.file.read( __dirname + "/../suite/suite.html" );
        suite = suite.replace( "{{js}}", tests.replaceWith.js );
        suite = suite.replace( "{{html}}", tests.replaceWith.html );

        grunt.file.copy( options.dist, tmp + "/dist.js" );

        grunt.file.recurse( __dirname + "/../suite/", function( abspath, rootdir, subdir, filename ) {
            grunt.file.copy( abspath, ".perf/" + filename );
        });

        grunt.file.write( ".perf/index.html", suite );

        server();

        phantomjs.on( "complete", function( data, event ) {
            grunt.log.ok( "Test finished", data );
            done();
        });

        phantomjs.spawn( "http://localhost:7000", {
            options: {},

            done: function() {
                grunt.log.ok("finish")
            }
        });
    });

    function server() {
        express().use( express.static( path.resolve( ".perf" ) ) ).listen( 7000 );
    }
}
