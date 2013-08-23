module.exports = function( grunt ) {
    var perf, listen,

        tmp = ".clone",
        app = ".clone/app",

        exec = require( "child_process" ).exec,

        username = process.env.SAUCE_USERNAME,
        key = process.env.SAUCE_ACCESS_KEY,

        express = require( "express" ),

        Perf = require( "../lib/perf" ),
        tests = require( "../lib/tests" ),
        server = require( "../lib/server" ),
        Sauce = require( "../lib/sauce" ),
        utils = require( "../lib/utils" )( grunt );

        fs = require( "fs" );

    grunt.registerTask( "perf", function() {
        var dir = __dirname + "/../";
            template = grunt.file.read( dir + "suite/suite.html" ),

            done = grunt.task.current.async(),
            options = this.options(),

            browsers = options.browsers,
            dist = options.dist,
            port = options.port || 7777,

            sauce = new Sauce;

        tmp = dir + tmp;

        grunt.option( "force", true );

        if ( grunt.file.exists( tmp ) ) {
            grunt.file.delete( tmp );
        }

        utils.clone( options );
        grunt.file.copy( dir + "/suite/benchmark.js", tmp + "/benchmark.js" );

        tests( grunt, options.benchmarks, function( tests ) {
            grunt.file.copy( dist, tmp + "/dist.js" );
            grunt.file.write( tmp + "/index.html", prepare( template, tests ) );

            delete tests.benchmark;

            server.start( browsers, tests, port, sauce );

            sauce.start( grunt, {
                username: username,
                key: key,
                browsers: options.browsers,
                port: port,
                address: "localhost:7776"
            }, done );

            //new Perf();
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