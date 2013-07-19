"use strict"

module.exports = function( grunt ) {
    var listen,

        tmp = ".perf",

        express = require( "express" ),
        phantomjs = require( "grunt-lib-phantomjs" ).init( grunt ),

        fs = require( "fs" ),
        path = require( "path" );


    phantomjs.on( "start", function( event ) {
        grunt.log.oklns( "Test started" );
    });

    grunt.registerTask( "perf", function() {
        var suite,

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

        this.async();
        server();

        return;
        var dist,
            app = express(),
            done = this.async(),
            options = this.options();

        dist = options.dist.split( "/" );
        dist = "/dist/" + dist[ dist.length - 1 ];

        app.get( "/", function( req, res ) {
            index = index.replace( "{{html}}", html );
            index = index.replace( "{{js}}", js );
            index = index.replace( "{{dist}}", dist );

            return res.send( index );
        });

        console.log(this.options());
        return

        var dist,
            done = this.async(),
            options = this.options();

        dist = options.dist.split( "/" );
        dist = "/dist/" + dist[ dist.length - 1 ];

        phantomjs.on( "complete", function( data, event ) {
            if ( data[ 0 ].error ) {
                grunt.log.error( data[ 0 ].error.message );
            }

            grunt.log.ok( "Test finished", data );
            done();
        });

        phantomjs.spawn( options.url, {
            options: {}
        });
    });

    function server() {
        var app = express();

        if ( listen ) {
            listen.close();
            listen = undefined;
        }

        // app.get( "/", function( req, res ) {
        //     index = index.replace( "{{html}}", html );
        //     index = index.replace( "{{js}}", js );
        //     index = index.replace( "{{dist}}", dist );

        //     return res.send( index );
        // });

        app.use( express.static( path.resolve( ".perf" ) ) );
        //app.use( "/static/", express.static( __dirname + "/../app/static" ) )

        listen = app.listen( 7000 );
    }
}
