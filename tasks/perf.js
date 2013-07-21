module.exports = function( grunt ) {
    var perf, listen,

        tmp = ".perf",
        app = ".perf/app",

        exec = require( "child_process" ).exec,

        express = require( "express" ),
        phantomjs = require( "grunt-lib-phantomjs" ).init( grunt ),
        git = require( "../lib/git" ),

        fs = require( "fs" ),
        path = require( "path" );

    phantomjs.on( "start", function( event ) {
        grunt.log.oklns( "Test started" );
    });

    grunt.registerTask( "perf", function( name ) {
        var first = true,
            done = this.async(),

            options = this.options(),

            perf = new Perf( options, start );


        function start() {
            phantomjs.on( "complete", function( data, event ) {
                grunt.log.ok( "Test finished" );

                perf.put( data );

                if ( first ) {
                    first = false;

                    perf.checkout( perf.start );


                } else {
                    grunt.file.delete( ".perf" );
                    grunt.file.write( ".test", JSON.stringify( perf.benchmarks.replaceWith.results ) );
                    done();
                }
            });

            this.start();
        }
    });


    function Perf( options, fn ) {
        var benchmarks;

        this.benchmarks = benchmarks = {};
        this.options = options;

        grunt.file.expand( options.benchmarks ).forEach(function( name ) {
            var benchmark = benchmarks[ name.split( "/" )[ 1 ] ] = {
                results: []
            };

            grunt.file.recurse( name, function( abspath ) {
                benchmark[ abspath.split( "." )[ 1 ] ] = grunt.file.read( abspath );
            });
        });

        return this.prepare( fn );
    };

    Perf.formatNumber = function( number ) {
        number = String( number ).split( "." );

        return number[ 0 ].replace( /(?=(?:\d{3})+$)(?!\b)/g, "," ) + ( number[ 1 ] ? "." + number[ 1 ] : "" );
    }

    Perf.prototype = {
        constructor: perf,

        listen: null,

        spawn: function() {
            phantomjs.spawn( "http://localhost:7000", {
                options: {}
            });

            return this;
        },

        prepare: function( fn ) {
            var suite,
                self = this;

            if ( grunt.file.exists( tmp ) ) {
                grunt.file.delete( tmp );
            }

            grunt.file.mkdir( app );

            exec( "cp -R * " + app, function() {
                exec( "cp -R .git " + app, function() {
                    fn.apply( self, arguments );
                });
            });

            suite = grunt.file.read( __dirname + "/../suite/suite.html" );
            suite = suite.replace( "{{js}}", this.benchmarks.replaceWith.js );
            suite = suite.replace( "{{html}}", this.benchmarks.replaceWith.html );

            grunt.file.copy( this.options.dist, tmp + "/dist.js" );

            grunt.file.recurse( __dirname + "/../suite/", function( abspath, rootdir, subdir, filename ) {
                grunt.file.copy( abspath, ".perf/" + filename );
            });

            grunt.file.write( ".perf/index.html", suite );

            return this;
        },

        start: function() {
            if ( this.listen ) {
                this.listen.close();
                this.listen = null;
            }

            this.listen = express().use( express.static( path.resolve( ".perf" ) ) ).listen( 7000 );

            return this.spawn();
        },

        put: function( result ) {
            result = result[ 0 ];

            this.benchmarks.replaceWith.results.push({
                name: result.name,
                hz: Perf.formatNumber( result.hz )
            });

            return this;
        },

        checkout: function( fn ) {
            var self = this,
                buildTasks = this.options.buildTasks.join ? this.options.buildTasks.join( " " ) : this.options.buildTasks.join;

            exec( "git checkout -f HEAD~1", {
                cwd: path.resolve( ".perf/app" )
            }, function() {
                exec( "grunt " + buildTasks, {
                    cwd: path.resolve( ".perf/app" )
                }, function() {
                    fn.apply( self, arguments );
                });
            });

            return this;
        },

        _revert: function( fn ) {
            // grunt.util.spawn({
            //     cmd: "git",
            //     args: [ "checkout", "HEAD" ]
            // }, function() {
            //     console.log(arguments);
            //     // grunt.util.spawn({
            //     //     cmd: "git",
            //     //     args: [ "stash", "pop" ]
            //     // }, fn );
            // });

            return this
        },

        revert: function( fn ) {
            return this._revert( fn );
        }
    }
}
