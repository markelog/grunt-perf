
    var util = require( "util" ),
        EventEmitter = require( "events" ).EventEmitter;

function Sauce() {}

util.inherits( Sauce, EventEmitter );

Sauce.prototype.start = function ( grunt, options, done ) {
    var self = this,
        wd = require( "wd" ),
        id = Math.floor( Date.now()  / 1000 - 1230768000 ).toString(),
        SauceTunnel = require( "sauce-tunnel" ),
        tunnel = new SauceTunnel( options.username, options.key, id, true, (1000 * 60 * 5) );

    grunt.log.ok( "Connecting..." );

    tunnel.start(function() {
        grunt.log.ok( "Connection is opened" );
        self.emit( "connected" );

        tunnel.stop(function() {
            console.log( arguments );
            //done();
        });
    });

    return this;
}


module.exports = Sauce;