var express = require( "express" ),
    path = require( "path" );

function Perf( options, fn ) {
    this.start();
};

Perf.formatNumber = function( number ) {
    number = String( number ).split( "." );

    return number[ 0 ].replace( /(?=(?:\d{3})+$)(?!\b)/g, "," ) + ( number[ 1 ] ? "." + number[ 1 ] : "" );
}

Perf.prototype = {
    constructor: Perf,

    listen: null,

    params: function( type ) {
        var data;

        for ( var benchmark in this.benchmarks ) {
            data = this.benchmarks[ benchmark ][ type ];

            if ( type == "js" ) {
                this.templates.js += "suite.add(" + data + ");";

            } else {
                this.templates.html += data;
            }
        }

        return this.templates[ type ];
    },

    prepare: function( dist ) {
        dist = dist || this.options.dist;

        var suite,
            d = tmp + "/dist.js",
            self = this;

        if ( grunt.file.exists( tmp ) ) {
            grunt.file.copy( dist, d );

            return this;
        }

        grunt.file.mkdir( app );

        suite = grunt.file.read( __dirname + "/../suite/suite.html" );

        suite = suite.replace( "{{tests}}", this.params( "js" ) );
        suite = suite.replace( "{{html}}", this.params( "html" ) );

        grunt.file.copy( dist, d );

        grunt.file.recurse( __dirname + "/../suite/", function( abspath, rootdir, subdir, filename ) {
            grunt.file.copy( abspath, ".perf/" + filename );
        });

        grunt.file.write( ".perf/index.html", suite );

        return this;
    },

    erenow: function( fn ) {
        var self = this,
            dist = app + "/" + this.options.dist;

        exec( "cp -R * " + app, function() {
            exec( "cp -R .git " + app, function() {
                fn.apply( self, arguments );
            });
        });

        return this;
    },

    spawn: function() {
        phantomjs.spawn( "http://localhost:7000", {
            options: {}
        });

        return this;
    },

    start: function() {
        if ( this.listen ) {
            this.listen.close();
            this.listen = null;
        }


        this.listen = express().use( express.static( path.resolve( ".perf" ) ) ).listen( 7000 );

        //return this.spawn();
    },

    put: function( result ) {
        result = result[ 0 ];

        this.benchmarks.replaceWith.results.push( result.hz );

        return this;
    },

    finish: function() {
        var results, percentage;

        for ( var benchmark in this.benchmarks ) {
            results = this.benchmarks[ benchmark ].results;

            if ( results[ 0 ] > results[ 1 ] ) {
                percentage = Math.round( (1 - results[ 1 ] / results[ 0 ]) * 100);

                if ( percentage >= 5 ) {
                    grunt.log.oklns( benchmark + " became faster by " + percentage + "%" );
                }
            } else if ( results[ 0 ] < results[ 1 ] ) {
                percentage = Math.round(1 - results[ 1 ] / results[ 0 ]) * 100;

                if ( percentage >= 5 ) {
                    grunt.log.errorlns( benchmark + " became slower by " + percentage + "%" );
                }
            }
        }

        grunt.file.delete( ".perf" );

        return this;
    },

    checkout: function( fn ) {
        var self = this,
            dist = app + "/" + this.options.dist,
            buildTasks = this.options.buildTasks.join ? this.options.buildTasks.join( " " ) : this.options.buildTasks;

        exec( "git checkout -f " + this.reference, {
            cwd: path.resolve( ".perf/app" )
        }, function() {
            grunt.file.delete( dist );

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

module.exports = Perf;
