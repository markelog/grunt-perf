module.exports = function( grunt ) {
    var clonePath = ".clone",

        exec = require( "child_process" ).exec,

        username = process.env.SAUCE_USERNAME,
        key = process.env.SAUCE_ACCESS_KEY,

        express = require( "express" ),

        tests = require( "../lib/tests" ),
        Sauce = require( "../lib/sauce" ),

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

        clonePath = dir + clonePath;

        grunt.option( "force", true );

        if ( grunt.file.exists( clonePath ) ) {
            grunt.file.delete( clonePath );
        }

        grunt.file.copy( dir + "/suite/benchmark.js", clonePath + "/benchmark.js" );

        tests( grunt, options.benchmarks, function( tests ) {
            grunt.file.copy( dist, clonePath + "/dist.js" );
            grunt.file.write( clonePath + "/index.html", prepare( template, tests ) );

            delete tests.benchmark;

            express().use( express.static( clonePath ) ).listen( 9999 );

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

}
