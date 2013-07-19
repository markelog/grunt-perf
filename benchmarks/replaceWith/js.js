var currentDiv = jQuery( document.getElementById( "div" ) ),
    newDiv = document.createElement("div");

currentDiv.replaceWith( newDiv );
jQuery( newDiv ).replaceWith( currentDiv );
