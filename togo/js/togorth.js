// namespace
var togorth = {};

// id
togorth.id = 1;

// endpoint
togorth.endpoint = 'https://sparql.orth.dbcls.jp/sparql';

// issue ID
togorth.issueId = function() {
    var id = togorth.id;
    togorth.id++;
    return id;
}

// create tabs
togorth.createTabs = function( tabs ) {
    tabs.forEach( 
        function( element ) {
            title = element.title;
            page = element.page;
            var id = togorth.issueId();
            element.id = id;
            togorth.addTabButton( title, id );
            togorth.addTabContent( page, id );
        }
    );
    var tag = '<div class="tab_rest"></div>';
    $( '#tabs' ).append( tag );

    if( tabs.length > 0 ) {
        togorth.openTab( tabs[ 0 ].id );
    }
}

// add tab button
togorth.addTabButton = function( title, id ) {
    var buttonId = 'tab_button-' + id;
    var tag = '<button id="' + buttonId + '" class="tab_button">' + title + '</button>';
    $( '#tabs' ).append( tag );
    $( '#' + buttonId ).click(
        function() {
            togorth.openTab( id );
        }
    );
}

// add tab content
togorth.addTabContent = function( page, id ) {
    var panelId = 'tab_content-' + id;
    var tag = '<div id="' + panelId + '" class="tab_content"></div>'
    $( '#contents' ).append( tag );
    $( '#' + panelId ).load( page + '.html' );
}

// open tab
togorth.openTab = function( id ) {
    $( '.tab_button' ).css( 'color', 'black' );
    $( '.tab_button' ).css( 'border-bottom', 'none' );
    $( '.tab_button:hover' ).css( 'border-bottom', '2px solid #005cab' );
    $( '.tab_content' ).css( 'display', 'none' );    
    $( '#tab_button-' + id ).css( 'color', '#005cab' );
    $( '#tab_button-' + id ).css( 'border-bottom', '2px solid #005cab' );
    $( '#tab_content-' + id ).css( 'display', 'block' );
}

// submit sparql
togorth.submitSparql = function() {
    var tag = '<h3>Result:</h3><div>Searching...</div>';
    $( '#sparql_result' ).html( tag );

    var sparql = $( '#sparql_text' ).val();

    $.ajax(
        {
            url: togorth.endpoint,
            type: 'GET',
            dataType: 'json',
            data: {
                format: 'application/sparql-results+json',
                query: sparql
            }
        }
    ).then(
        function( result ) {
            var headers = togorth.getHeaders( result );
            var rows = togorth.getResult( result, headers );
            togorth.createSparqlResultTable( headers, rows );
        }
    );
}

// headers
togorth.getHeaders = function( result ) {
    var headers = [];
    result.head.vars.forEach(
        function( element ) {
            headers.push( element );
        }
    );
    return headers;
}

// results
togorth.getResult = function( result, headers ) {
    var array = [];
    result.results.bindings.forEach(
        function( element ) {
            var row = {};
            headers.forEach(
                function( header ) {
                    var value = element[ header ].value;
                    row[ header ] = value;
                }
            );
            array.push( row );
        }
    );
    return array;
}

// sparql result table
togorth.createSparqlResultTable = function( headers, result ) {
    var tag = '<h3>Result:</h3><table id="sparql_result_table"></table>';
    $( '#sparql_result' ).html( tag );

    tag = '<tr>';
    headers.forEach(
        function( header ) {
            tag += '<th>' + header + '</th>'
        }
    );
    tag += '</tr>';
    $( '#sparql_result_table' ).append( tag );

    result.forEach(
        function( row ) {
            tag = '<tr>'
            headers.forEach( 
                function( header ) {
                    tag += '<td>' + row[ header ] + '</td>';
                }
            );
            tag += '</tr>'
            $( '#sparql_result_table' ).append( tag );
        }
    );
}

// create db table
togorth.createDbTable = function( id ) {
    var no = 1;
    $.ajax(
        {
            url: 'json/databases.json',
            type: 'GET',
            dataType: 'json',
            data: {
                alt: 'json'
            }
        }
    ).then(
        function( result ) {
            var content = '<thead><tr><th>No.</th><th>Name</th><th>Method</th><th>Hierarchical / Flat</th><th>Target</th><th>#organisms</th><th>Sequence Source</th>'
                    + '<th>First Publication</th><th>Last Update</th></tr></thead>'
            result.forEach(
                function( entry ) {              
                    if( entry['Obsolete']  != '1' ) {
                        entry.no = no;
                        var lineTag = togorth.createDbLineTag( entry );
                        content += lineTag;
                        no++;                        
                    }
                }
            );
            $( '#' + id ).html(content).tablesorter({
                headers: {
                }
            });
        }
    );
}

// create DB line tag
togorth.createDbLineTag = function( object ) {
    var keys = ['no', 'Name', 'Method', 'Hierarchical/flat/pair-wise (and other characteristics)', 'Target', '#organisms', 'sequence source', 'Publication', 'Last update'];
    var tag = togorth.createLineTag( object, keys );
    return tag;
}

// create line tag
togorth.createLineTag = function( object, keys ) {
    var tag = '';
    keys.forEach(
        function( key ) {
            if( key in object ) {
                var value = object[ key ];
                if( key === 'Name' ) {
                    var url = object.URL;
                    value = '<a href="' + url + '" target="_blank">' + value + '</a>';
                }
                tag += '<td>' + value + '</td>'
            }
            else {
                tag += '<td></td>';
            }
        }
    );
    tag = '<tr>' + tag + '</tr>';
    return tag;
}

// create endpoint table
togorth.createEndpointTable = function( id ) {
    var tag = '<tr><th>Name</th><th>URL</th></tr>';
    $( '#' + id ).html( tag );
    $.getJSON(
        'json/endpoints.json',
        function( data ) {
            data.forEach(
                function( element ) {
                    var tag = togorth.createLineTag( element, [ 'name', 'url' ] );
                    $( '#' + id ).append( tag );
                }
            );
        }
    );
}

// create link table
togorth.createLinkTable = function( id ) {
    var tag = '<tr><th>Name</th><th>URL</th></tr>';
    $( '#' + id ).html( tag );
    $.getJSON(
        'json/links.json',
        function( data ) {
            data.forEach(
                function( element ) {
                    var tag = togorth.createLineTag( element, [ 'name', 'url' ] );
                    $( '#' + id ).append( tag );
                }
            );
        }
    );
}

// create paper table
togorth.createPaperTable = function( id ) {
    var no = 1;
    $.ajax(
        {
            url: 'json/references.json',
            type: 'GET',
            dataType: 'json',
            data: {
                alt: 'json'
            }
        }
    ).then(
        function( result ) {
          var tag = '<tr><th>Tag</th><th>Year</th><th>Paper</th></tr>'
            $( '#' + id ).html( tag );
            result.forEach(
                function( entry ) {
                    var lineTag = togorth.createPaperLineTag( entry['Tag'], entry['Paper'], entry['Year'], entry['URL']);
                    $( '#' + id ).append( lineTag );
                }
            );
        }
    );
}

// create paper line tag
togorth.createPaperLineTag = function( tag, paper, year, url ) {
    var line = '<tr><td>' + tag + '</td><td>' + year + '</td>';
    var paperTag = paper;
    if( url !== '' ) {
        paperTag = '<a href="' + url + '" target="_blank">' + paperTag + '</a>';
    }
    paperTag = '<td>' + paperTag + '</td>';
    line = line + paperTag + '</tr>';
    return line;
}

// create reference table
togorth.createReferenceTable = function( id ) {
    var tag = '<tr><th>Authors</th><th>Year</th><th>Title</th><th>Journal</th></tr>';
    $( '#' + id ).html( tag );
    $.getJSON(
        'json/references.json',
        function( data ) {
            data.forEach(
                function( element ) {
                    var keys = [ 'authors', 'year', 'title', 'journal' ];
                    var tag = togorth.createLineTag( element, keys );
                    $( '#' + id ).append( tag );
                }
            );
        }
    );
}

