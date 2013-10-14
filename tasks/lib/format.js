"use strict";

function modules( data ) {
	var results, name, bm, hz, _modules,

	for ( var res in data ) {
		results = data[ res ].results;

		for ( var i = 0, l = results.length; i < l; i++ ) {
			name = results[ i ].name.split( ":" )[ 0 ];
			bm = new Benchmark( results[ i ] );
			hz = bm.hz.toFixed( bm.hz < 100 ? 2 : 0 );

			if ( !_modules[ name ] ) {
				_modules[ name ] = 0;
			}

			_modules[ name ] += +hz;
		}
	}

	return _modules;
}

function series( data ) {
	var modules, part, _series;

	for ( var module in modules ) {
		for ( value in _series ) {
			if ( _series[ value ].name == module ) {
				part = _series[ value ].data;

				part.push( modules[ module ] );
			}
		}

		if ( !part ) {
			_series.push({
				name: module,
				data: [ modules[ module ] ]
			});
		}

		part = null;
	}

	return _series;
}

module.exports = function( date, results ) {
	
}