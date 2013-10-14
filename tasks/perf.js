"use strict";

module.exports = function( grunt ) {
    var username = process.env.SAUCE_USERNAME,
        key = process.env.SAUCE_ACCESS_KEY,

        express = require( "express" ),
        tmp = require( "temporary" ),

        tests = require( "./lib/tests" ),
        format = require( "./lib/format" ),
        Sauce = require( "./lib/sauce" );

    grunt.registerMultiTask( "perf", function() {
        var dir = __dirname + "/../",
            date = Date.now(),
            template = grunt.file.read( dir + "suite/suite.html" ),

            done = grunt.task.current.async(),
            options = this.options(),

            dump = grunt.option( "dump" ),

            dist = options.dist,

            path = new tmp.Dir().path,

            sauce = new Sauce;

        grunt.option( "force", true );

        grunt.file.copy( dir + "/suite/benchmark.js", path + "/benchmark.js" );

        if ( dump ) {
            sauce.on( "all-done", function( results ) {
                grunt.file.write( dump, format( date, results ) );
            });
        }

        tests( grunt, this.filesSrc, function( tests ) {
            grunt.file.copy( dist, path + "/dist.js" );
            grunt.file.write( path + "/index.html", prepare( template, tests ) );

            delete tests.benchmark;

            express().use( express.static( path ) ).listen( 9999 );

            sauce.start( grunt, {
                username: username,
                key: key,
                browsers: options.browsers,
                address: "http://127.0.0.1:9999/index.html"
            }, done );
        }.bind( this ) );
    });

    function prepare( suite, tests ) {
        var data = "";

        tests.forEach(function( test ) {
            data += test.benchmark;
        });

        return suite.replace( "{{tests}}", data );
    }
};
