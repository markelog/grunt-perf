"use strict";

module.exports = function( grunt ) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( "package.json" ),

        watch: {
            express: {
                files:  [ "**", "*" ],
                tasks:  [ "run" ],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },

        express: {
            dev: {
                options: {
                    script: "server.js",
                    port: 7000
                }
            }
        },

        perf: {
            options: {
                dist: "/Users/arkel/Workspace/perf/dist/jquery.js",
                url: "http://arkel:7000/"
            }
        }
    });

    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-express-server" );

    grunt.registerTask( "default", [ "express", "watch" ] );
    grunt.registerTask( "server", "default" );

    grunt.loadTasks( "tasks" );

    grunt.registerTask( "run", [ "perf", "watch" ] );
};
