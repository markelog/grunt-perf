var util = require( "util" ),
    Benchmark = require( "benchmark" ),

    EventEmitter = require( "events" ).EventEmitter,

    green = "\u001b[32m",
    red = "\u001b[31m",
    blue = "\u001b[34m",
    reset = "\u001b[0m";

function Sauce() {}

util.inherits( Sauce, EventEmitter );

Sauce.prototype.start = function ( grunt, options, done ) {
    var self = this,
        wd = require( "wd" ),

        id = Date.now().toString(),

        SauceTunnel = require( "sauce-tunnel" ),
        tunnel = new SauceTunnel( options.username, options.key, id, true, (1000 * 60 * 5) ),
        browsers = options.browsers,

        address = "http://127.0.0.1:9999/index.html";

    grunt.log.ok( "Connecting..." );

    configureTunnel( tunnel ).start(function() {
        var driver = wd.remote( "ondemand.saucelabs.com", 80, options.username, options.key ),
            finished = [];

        grunt.log.ok( "Connection is opened" );
        self.emit( "connected" );

        configureBrowsers( browsers ).forEach(function( browser ) {
            var name = browser.browserName,
                version = browser.version;

            driver.init( browser, function( error ) {
                if ( error ) {
                    grunt.log.error( "Could not initialize browser:", name, "(" + browser.version + ")" );
                    grunt.log.error( error );
                    quit();
                    return;
                }

                driver.get( address, function( error ) {
                    if ( error ) {
                        grunt.log.error( "Could not open perfomance suite:", error );
                        driver.quit();
                        return;
                    }

                    console.log("");
                    grunt.log.ok( "Tests started for " + blue + name, browser.version, reset );

                    driver.waitForElementById( "done", 5000, function( error ) {
                        driver.elementById( "done", function( error, element ) {
                            driver.text( element, function( error, results ) {
                                grunt.log.ok( "Tests finished for " + blue + name, browser.version, reset );

                                results = JSON.parse( results );
                                for ( var result in results ) {
                                    if ( results[ result ].name ) {
                                        grunt.log.oklns( new Benchmark( results[ result ] ) );
                                    }
                                }

                                finish( results );
                                self.emit( "done", browser, results );
                            });
                        });
                    });
                });
            });
        });

        function finish( result ) {
            finished.push( result );

            if ( browsers.length == finished.length ) {
                quit();
            }
        }

        function quit() {
            grunt.log.writeln();
            tunnel.stop( done );
            driver.quit();
        }
    });

    function configureBrowsers( browsers ) {
        browsers.map(function( browser ) {
            browser[ "tunnel-identifier" ] = id;
            browser.name = "perfomance test";
        });

        return browsers;
    }

    function configureTunnel( tunnel ) {
        [ "write", "writeln", "error", "ok", "debug" ].forEach(function ( method ) {
            tunnel.on( "log:" + method, function ( text ) {
                if ( text ) {
                    grunt.log[ method ]( text );
                }
            });
            tunnel.on( "verbose:" + method, function ( text ) {
                if ( text ) {
                    grunt.verbose[ method ]( text );
                }
            });
        });

        return tunnel;
    }

    return this;
}

module.exports = Sauce;