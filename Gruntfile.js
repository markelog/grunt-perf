"use strict";

module.exports = function( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( "package.json" ),

        watch: {
            express: {
                files:  [ "*.js" ],
                tasks:  [ "express:dev" ],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },

        express: {
            dev: {
                options: {
                    script: "server.js"
                }
            }
        }
    });

    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-express-server" );

    grunt.registerTask( "default", [ "express", "watch" ] );
    grunt.registerTask( "server", "default" );
};
