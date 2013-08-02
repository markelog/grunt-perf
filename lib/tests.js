var fs = require( "fs" ),
    jade = require( "jade" ),
    jsdom = require( "jsdom" );

module.exports = function( grunt, path, callback ) {
    var tests = [],
        i = 0,
        stringTests = "",
        testsAmount = 0,

        files = grunt.file.expand( path );

    files.forEach(function( file ) {
        jade.renderFile( file, {}, function( err, html ) {
            stringTests += html;

            if ( files.length == ++i ) {
                generate();
            }
        });
    });

    function generate() {
        jsdom.env( stringTests, [ "http://code.jquery.com/jquery.js" ], function ( errors, window ) {
            var perfs = window.$( "perf" );

            testsAmount = perfs.length;

            perfs.each(function() {
                var rest = window.$( this ).find( "body, script" );

                add( window.$( this ).add( rest ) );
            });
        });
    }

    function add( elements ) {
        var name = elements.filter( "perf" ).attr( "name" ),
            body = elements.filter( "body" ).html(),
            script = elements.filter( "script" ).html(),

            benchmark = '{ \
                "name":"' + name + '", \
                "fn":' + fn( script ) + ', \
                "onComplete":' + onComplete() + ', \
                "setup":' + setup( body ) + '\
            }';

        tests.push({
            name: name,
            body: body,
            script: script,

            benchmark: "suite.add(" + benchmark + ");",
        });

        if ( testsAmount == tests.length ) {
            callback( tests );
        }
    }

    function fn( script ) {
        return function() {
            "body"
        }.toString().replace( '"body"', script );
    }

    function setup( body ) {
        return function() {
            document.getElementById( "fixture" ).innerHTML = '"body"';
        }.toString().replace( "body", body );
    }

    function onComplete() {
        return function() {
            document.getElementById( "fixture" ).innerHTML = "";
        }.toString();
    }
}
