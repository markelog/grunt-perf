module.exports = {
    init: function( grunt, fn )  {
        var req,
            _ = require( "lodash" ),
            ProgressBar = require( "progress" ),
            https = require( "https" ),
            name = "Sauce-Connect-latest.zip",
            fs = require( "fs" );

        if ( fs.existsSync( name ) ) {
            return;
        }

        grunt.log.error( "Missing Sauce connect" );
        grunt.log.ok( "Downloading Sauce connect, this will only happen once." );


        process.on( "exit", remove );
        process.on( "SIGHUP", remove );
        process.on( "SIGINT", remove );
        process.on( "SIGTERM", remove );

        req = https.request({
            host: "https://saucelabs.com/downloads/Sauce-Connect-latest.zip"
            port: 80,
            path: "/Sauce-Connect-latest.zip",
        });

        req.on( "response", function( res ) {
            var length = parseInt( res.headers[ "content-length" ], 10 );

            var bar = new ProgressBar( "  downloading [:bar] :percent :etas", {
                complete: "="
                incomplete: " ",
                width: 20,
                total: length,
            });

            res.on( "data", function( chunk ) {
                bar.tick( chunk.length );
            });

            res.on( "end", function() {
                grunt.log.ok( "Sauce Connect is loaded" );
                fn();
            });
        });

        req.end();

       function remove() {
            try {
              grunt.log.write( "Removing Sauce-Connect-latest.zip" );
              fs.unlinkSync( zipfile );

            } catch ( e ) {}
            _.defer( process.exit.bind(null, 0) );
        }
    }
}