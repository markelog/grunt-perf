module.exports = function() {
    var sys = require( "sys" ),
        exec = require( "child_process" ).exec,
        path = require( "path" ),

        defaultReference = "HEAD~1";

    return {
        checkout: function( reference ) {
            reference = reference || defaultReference;

            exec( "cd " + path.resolve() );

            console.log( __dirname );
            exec( "git checkout " + reference );
        }
    }
}();