module.exports = function( grunt ) {
    var perf, listen,

        tmp = ".perf",
        app = ".perf/app",

        exec = require( "child_process" ).exec,

        username = process.env.SAUCE_LABS_USERNAME,
        key = process.env.SAUCE_LABS_KEY,

        express = require( "express" ),
        //phantomjs = require( "grunt-lib-phantomjs" ).init( grunt ),

        Perf = require( "../lib/perf" ),
        tests = require( "../lib/tests" ),
        server = require( "../lib/server" ),
        Sauce = require( "../lib/sauce" ),

        fs = require( "fs" );

    grunt.registerTask( "perf", function() {
        var template = grunt.file.read( __dirname + "/../suite/suite.html" ),

            done = grunt.task.current.async(),
            options = this.options(),

            browsers = options.browsers,
            dist = options.dist,

            sauce = new Sauce;

        if ( grunt.file.exists( tmp ) ) {
            grunt.file.delete( tmp );
        }

        grunt.file.copy( __dirname + "/../suite/benchmark.js", tmp + "/benchmark.js" );

        tests( grunt, options.benchmarks, function( tests ) {
            grunt.file.copy( dist, tmp + "/dist.js" );
            grunt.file.write( tmp + "/index.html", prepare( template, tests ) );

            delete tests.benchmark;

            sauce.start( grunt, {
                username: username,
                key: key
            }, done );

            server.start( browsers, tests, options.port, sauce );

            // sauce.on( "connected", function() {
            //     server.emit( "connected" );
            // })

            new Perf();
        }.bind( this ) );
    });

    function prepare( suite, tests ) {
        var data = "";

        tests.forEach(function( test ) {
            data += test.benchmark;
        });

        return suite.replace( "{{tests}}", data );
    }

}