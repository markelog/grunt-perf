var EventEmitter = require( "events" ).EventEmitter;

    io = require( "socket.io" ),
    express = require( "express" );

module.exports = {
    start: function( browsers, tests, port, sauce ) {
        var app = express(),
            connection = {
                id: 1,
                status: "connecting"
            },
            data = prepare( browsers, tests );

        io = io.listen( port, {
            "log level": 1
        });

        app.use( express.static( __dirname + "/../.clone" ) );
        app.listen( 9999 );

        sauce.on( "connected", function() {
            connection.status = "connected";
        });

        io.sockets.on( "connection", function( socket ) {
            socket.on( "all:browsers", function( args, event ) {
                socket.emit( event, data );
            });

            socket.on( "all:tests", function( args, event ) {
                socket.emit( event, data );
            });

            socket.on( "id:connection", function( args, event ) {
                socket.emit( event, {
                    connection: connection
                });
            });

            sauce.on( "connected", function() {
                socket.emit( "keepalive:connection/1", {
                    connection: connection
                });
            });

            sauce.on( "done", function( browser ) {
                socket.emit( "keepalive:browsers", {
                    browsers: [ browser ]
                });
            });
        });
    }
}

function prepare( browsers, tests, connections ) {
    var res = {};

    tests = tests.map(function( test, i ) {
        test.id = ++i;

        test.browsers = browsers.map(function( browser, i ) {
            return ++i;
        });

        return test;
    });

    browsers.tests = []
    browsers = browsers.map(function( browser, i ) {
        browser.id = ++i;

        browser.tests = tests.map(function( test, i ) {
            return ++i;
        });

        return browser;
    });

    return {
        browsers: browsers,
        tests: tests
    };
}
