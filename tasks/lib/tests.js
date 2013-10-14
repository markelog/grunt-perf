"use strict";

var jade = require( "jade" ),
    jsdom = require( "jsdom" );

module.exports = function( grunt, files, callback ) {
    var tests = [],
        i = 0,
        stringTests = "",
        testsSum = 0;

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
            var modules = window.$( "module" );

            testsSum = window.$( "perf" ).length;

            modules.each(function() {
                var module = this.getAttribute( "name" ),
                    perfs = window.$( this ).find( "perf" );

                perfs.each(function() {
                    var rest = window.$( this ).find( "body, script" );

                    add( module, window.$( this ).add( rest ) );
                });
            });
        });
    }

    function add( module, elements ) {
        var name = elements.filter( "perf" ).attr( "name" ),
            body = elements.filter( "body" ).html(),
            runner = elements.filter( "script[runner]" ).html(),
            setupCode = elements.filter( "script[setup]" ).html(),

            benchmark = '{' +
                'name:"' + module + ": " + name + '",' +
                'fn:' + fn( runner ) + ',' +
                'setup:' + setup( setupCode ) + ',' +
                'onComplete:' + onComplete() + ',' +
                'onStart:' + onStart( body ) +
            '}';

        tests.push({
            module: module,
            name: name,
            body: body,
            script: runner,
            setup: setupCode,

            benchmark: "suite.add(" + benchmark + ");",
        });

        if ( testsSum == tests.length ) {
            callback( tests );
        }
    }

    function fn( runner ) {
        return function() {
            (runner);
        }.toString().replace( "(runner)", runner );
    }

    function setup( fn ) {
        return function() {
            (fn);
        }.toString().replace( "(fn)", fn );
    }

    function onStart( body ) {
        return function() {
            document.getElementById( "fixture" ).innerHTML = '(body)';
        }.toString().replace( "(body)", body );
    }

    function onComplete() {
        return function() {
            document.getElementById( "fixture" ).innerHTML = "";
        }.toString();
    }
};
