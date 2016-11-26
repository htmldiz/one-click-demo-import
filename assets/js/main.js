jQuery( function ( $ ) {
	'use strict';

	/**
	 * ---------------------------------------
	 * ------------- Events ------------------
	 * ---------------------------------------
	 */

	/**
	 * No or Single predefined demo import button click.
	 */
	$( '.js-ocdi-import-data' ).on( 'click', function () {

		// Reset response div content.
		$( '.js-ocdi-ajax-response' ).empty();

		// Prepare data for the AJAX call
		var data = new FormData();
		data.append( 'action', 'ocdi_import_demo_data' );
		data.append( 'security', ocdi.ajax_nonce );
		data.append( 'selected', $( '#ocdi__demo-import-files' ).val() );
		if ( $('#ocdi__content-file-upload').length ) {
			data.append( 'content_file', $('#ocdi__content-file-upload')[0].files[0] );
		}
		if ( $('#ocdi__widget-file-upload').length ) {
			data.append( 'widget_file', $('#ocdi__widget-file-upload')[0].files[0] );
		}
		if ( $('#ocdi__customizer-file-upload').length ) {
			data.append( 'customizer_file', $('#ocdi__customizer-file-upload')[0].files[0] );
		}

		// AJAX call to import everything (content, widgets, before/after setup)
		ajaxCall( data );

	});


	/**
	 * Grid Layout import button click.
	 */
	$( '.js-ocdi-gl-import-data' ).on( 'click', function () {
		var selectedImportID = $( this ).val();
		var $itemContainer   = $( this ).closest( '.js-ocdi-gl-item' );

		// If the import confirmation is enabled, then do that, else import straight away.
		if ( ocdi.import_popup ) {
			displayConfirmationPopup( selectedImportID, $itemContainer );
		}
		else {
			gridLayoutImport( selectedImportID, $itemContainer );
		}
	});

	/**
	 * Switch preview images on select change event, but only if the img element .js-ocdi-preview-image exists.
	 * Also switch the import notice (if it exists).
	 */
	$( '#ocdi__demo-import-files' ).on( 'change', function(){
		if ( $( '.js-ocdi-preview-image' ).length ) {

			// Attempt to change the image, else display message for missing image.
			var currentFilePreviewImage = ocdi.import_files[ this.value ]['import_preview_image_url'] || '';
			$( '.js-ocdi-preview-image' ).prop( 'src', currentFilePreviewImage );
			$( '.js-ocdi-preview-image-message' ).html( '' );

			if ( '' === currentFilePreviewImage ) {
				$( '.js-ocdi-preview-image-message' ).html( ocdi.texts.missing_preview_image );
			}
		}

		// Update import notice.
		var currentImportNotice = ocdi.import_files[ this.value ]['import_notice'] || '';
		$( '.js-ocdi-demo-import-notice' ).html( currentImportNotice );
	});

	/**
	 * Grid Layout categories navigation.
	 */
	$( '.js-ocdi-nav-link' ).on( 'click', function( event ) {
		event.preventDefault();

		// Remove 'active' class from the previous nav list items.
		$( this ).parent().siblings().removeClass( 'active' );

		// Add the 'active' class to this nav list item.
		$( this ).parent().addClass( 'active' );

		// Show all items if the 'hash' is equal to '#all'.
		if ( '#all' === this.hash ) {
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item' ).show();
		}
		else {
			// Hide all items.
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item' ).hide();

			// Show just the ones that have the correct category data.
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item[data-categories*="' + this.hash.slice(1) + '"]' ).show();
		}
	} );


	/**
	 * Grid Layout search functionality.
	 */
	$( '.js-ocdi-mql-search' ).on( 'keyup', function( event ) {
		if ( 0 < $(this).val().length ) {
			// Hide all items.
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item' ).hide();

			// Show just the ones that have a match on the import name.
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item[data-name*="' + $(this).val().toLowerCase() + '"]' ).show();
		}
		else {
			$( '.js-ocdi-gl-item-container' ).find( '.js-ocdi-gl-item' ).show();
		}
	} );

	/**
	 * ---------------------------------------
	 * --------Helper functions --------------
	 * ---------------------------------------
	 */

	/**
	 * Prepare grid layout import data and execute the AJAX call.
	 *
	 * @param int selectedImportID The selected import ID.
	 * @param obj $itemContainer The jQuery selected item container object.
	 */
	function gridLayoutImport( selectedImportID, $itemContainer ) {
		// Reset response div content.
		$( '.js-ocdi-ajax-response' ).empty();

		// Hide all other import items.
		$itemContainer.siblings( '.js-ocdi-gl-item' ).hide( 100 );

		// Hide the header with category navigation and search box.
		$itemContainer.closest( '.js-ocdi-gl' ).find( '.js-ocdi-gl-header' ).hide( 100 );

		// Append a title for the selected demo import.
		$itemContainer.parent().prepend( '<h3>' + ocdi.texts.selected_import_title + '</h3>' );

		// Remove the import button of the selected item.
		$itemContainer.find( '.js-ocdi-gl-import-data' ).remove();

		// Prepare data for the AJAX call
		var data = new FormData();
		data.append( 'action', 'ocdi_import_demo_data' );
		data.append( 'security', ocdi.ajax_nonce );
		data.append( 'selected', selectedImportID );

		// AJAX call to import everything (content, widgets, before/after setup)
		ajaxCall( data );
	}

	/**
	 * Display the confirmation popup.
	 *
	 * @param int selectedImportID The selected import ID.
	 * @param obj $itemContainer The jQuery selected item container object.
	 */
	function displayConfirmationPopup( selectedImportID, $itemContainer ) {
		var $dialogContiner         = $( '#js-ocdi-modal-content' );
		var currentFilePreviewImage = ocdi.import_files[ selectedImportID ]['import_preview_image_url'] || '';
		var previewImageContent     = '';
		var importNotice            = ocdi.import_files[ selectedImportID ]['import_notice'] || '';
		var importNoticeContent     = '';

		if ( '' === currentFilePreviewImage ) {
			previewImageContent = '<p>' + ocdi.texts.missing_preview_image + '</p>';
		}
		else {
			previewImageContent = '<div class="ocdi__modal-image-container"><img src="' + currentFilePreviewImage + '" alt="' + ocdi.import_files[ selectedImportID ]['import_file_name'] + '"></div>'
		}

		// Prepare notice output.
		if( '' !== importNotice ) {
			importNoticeContent = '<div class="ocdi__modal-notice  ocdi__demo-import-notice">' + importNotice + '</div>';
		}

		// Populate the dialog content.
		$dialogContiner.prop( 'title', ocdi.texts.dialog_title );
		$dialogContiner.html(
			'<p style="text-align: center;"><b>' + ocdi.import_files[ selectedImportID ]['import_file_name'] + '</b></p>' +
			previewImageContent +
			importNoticeContent
		);

		$dialogContiner.dialog( {
			'dialogClass': 'wp-dialog',
			'resizable':   false,
			'height':      'auto',
			'modal':       true,
			'buttons':     [
				{
					text: ocdi.texts.dialog_no,
					click: function() {
							$(this).dialog('close');
					}
				},
				{
					text: ocdi.texts.dialog_yes,
					class: 'button  button-primary',
					click: function() {
						$(this).dialog('close');
						gridLayoutImport( selectedImportID, $itemContainer );
					}
				}
			]
		} );
	}

	/**
	 * The main AJAX call, which executes the import process.
	 *
	 * @param FormData data The data to be passed to the AJAX call.
	 */
	function ajaxCall( data ) {
		$.ajax({
			method:      'POST',
			url:         ocdi.ajax_url,
			data:        data,
			contentType: false,
			processData: false,
			beforeSend:  function() {
				$( '.js-ocdi-ajax-loader' ).show();
			}
		})
		.done( function( response ) {
			if ( 'undefined' !== typeof response.status && 'newAJAX' === response.status ) {
				ajaxCall( data );
			}
			else if ( 'undefined' !== typeof response.status && 'customizerAJAX' === response.status ) {
				data.set( 'action', 'ocdi_import_customizer_data' );
				data.set( 'wp_customize', 'on' );
				ajaxCall( data );
			}
			else if ( 'undefined' !== typeof response.status && 'afterAllImportAJAX' === response.status ) {
				data.set( 'action', 'ocdi_after_import_data' );
				data.delete( 'wp_customize' );
				ajaxCall( data );
			}
			else if ( 'undefined' !== typeof response.message ) {
				$( '.js-ocdi-ajax-response' ).append( '<p>' + response.message + '</p>' );
				$( '.js-ocdi-ajax-loader' ).hide();
			}
			else {
				$( '.js-ocdi-ajax-response' ).append( '<div class="notice  notice-error  is-dismissible"><p>' + response + '</p></div>' );
				$( '.js-ocdi-ajax-loader' ).hide();
			}
		})
		.fail( function( error ) {
			$( '.js-ocdi-ajax-response' ).append( '<div class="notice  notice-error  is-dismissible"><p>Error: ' + error.statusText + ' (' + error.status + ')' + '</p></div>' );
			$( '.js-ocdi-ajax-loader' ).hide();
		});
	}
} );
