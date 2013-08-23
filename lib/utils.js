module.exports = function( grunt ) {
    var folder = __dirname + "/../.clone/",
        exec = require( "child_process" ).exec,
        path = require( "path" );

    return {
        clone: function() {
            exec( "git clone . " + __dirname + "/../.clone", function() {
            });
        },

        render: function() {

        }
    }
}