"use strict";

module.exports = function( grunt ) {
    grunt.initConfig({
        pkg: grunt.file.readJSON( "package.json" ),

        watch: {
            app: {
                files: [ "**.js", "*.js" ],
                tasks: [ "jshint" ]
            }
        },

        jshint: {
            app: {
                src: [ "lib/*.js", "tasks/*.js", "Grunfile.js" ],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        }
    });

    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );

    grunt.registerTask( "default", [ "jshint", "watch" ] );
};
