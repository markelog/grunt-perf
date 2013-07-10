"use strict"

var express = require( "express" );

express().use( express.static( __dirname + "/html" ) ).listen( 7000 );