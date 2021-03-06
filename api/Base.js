/**
 * The base class for providing core functions to all module classes.
 * @class Base.js
 */
// IceHRMBase renamed to BingoJSBase
function BingoJSBase() {
	this.deleteParams = {};
	this.createRemoteTable = false; // show all data in single table (without pagination)
	this.instanceId = "None";
	this.ga = []; // google analytics
	this.showEdit = true; // show edit button
	this.showDelete = true; // show delete button
	this.showSave = true; // show add button
	this.showCancel = true; // show cancel button
	this.showFormOnPopup = false; // show form in popup
	this.filtersAlreadySet = false; // flag for filters already applied or not
	this.currentFilterString = '';
}

this.fieldTemplates = null;
this.templates = null;
this.customTemplates = null;
this.emailTemplates = null;
this.fieldMasterData = null;
this.fieldMasterDataKeys = null;
this.fieldMasterDataCallback = null;
this.sourceMapping = null;
this.currentId = null;
this.user = null;
this.currentProfile = null;
this.permissions = {};
this.baseUrl = null;

BingoJSBase.method('init', function(appName, currentView, dataUrl, permissions) {

});

/**
 * Some browsers do not support sending JSON in get parameters. Set this to true to avoid sending JSON
 * @method setNoJSONRequests
 * @param val {Boolean}
 */
BingoJSBase.method('setNoJSONRequests', function(val) {
	this.noJSONRequests = val;
});

BingoJSBase.method('setPermissions', function(permissions) {
	this.permissions = permissions;
});

/**
 * Check if the current user has a permission
 * @method checkPermission
 * @param permission {String}
 * @example
 * 	this.checkPermission("Upload/Delete Profile Image")
 */
BingoJSBase.method('checkPermission', function(permission) {
	if (this.permissions[permission] == undefined || this.permissions[permission] == null || this.permissions[permission] == 'Yes') {
		return 'Yes';
	} else {
		return this.permissions[permission];
	}
});

BingoJSBase.method('setBaseUrl', function(url) {
	this.baseUrl = url;
}); 

BingoJSBase.method('setUser', function(user) {
	this.user = user;
});

BingoJSBase.method('getUser', function() {
	return this.user;
}); 

BingoJSBase.method('setInstanceId', function(id) {
	this.instanceId = id;
}); 

BingoJSBase.method('setGoogleAnalytics', function(ga) {
	this.ga = ga;
}); 

/**
 * If this method returned false the action buttons in data table for modules will not be displayed.
 * Override this method in module lib.js to hide action buttons
 * @method showActionButtons
 * @param permission {String}
 * @example
 * 	EmployeeLeaveEntitlementAdapter.method('showActionButtons' , function() {
 *  	return false;
 *	});
 */
BingoJSBase.method('showActionButtons', function() {
	return true;
});  

BingoJSBase.method('trackEvents', function(action, label, value) {
	try{
		if(label == undefined || label == null){
			this.ga.push(['_trackEvent', this.instanceId, action]);
		}else if(value == undefined || value == null){
			this.ga.push(['_trackEvent', this.instanceId, action, label]);
		}else{
			this.ga.push(['_trackEvent', this.instanceId, action, label, value]);
		}
	}catch (e) {
	
	}
});  

BingoJSBase.method('setCurrentProfile', function(currentProfile) {
	this.currentProfile = currentProfile;
});  

/**
 * Get the current profile
 * @method getCurrentProfile
 * @returns Profile of the current user if the profile is not switched
 */

BingoJSBase.method('getCurrentProfile', function() {
	return this.currentProfile;
});  

/**
 * Retrive data required to create select boxes for add new /edit forms for a given module. This is called when loading the module
 * @method initFieldMasterData
 * @param callback {Function} call this once loading completed
 * @param callback {Function} call this once all field loading completed. This indicate that the form can be displayed safely
 * @example
 * 	ReportAdapter.method('renderForm', function(object) {
 *		var that = this;
 *		this.processFormFieldsWithObject(object);
 *		var cb = function(){
 *			that.uber('renderForm',object);
 *		};
 *		this.initFieldMasterData(cb);
 *      });
 */
BingoJSBase.method('initFieldMasterData', function(callback, loadAllCallback, loadAllCallbackData) {
	var values;
	if(this.showAddNew == undefined || this.showAddNew == null){
		this.showAddNew = true;
	}
	this.fieldMasterData = {};
	this.fieldMasterDataKeys = {};
	this.fieldMasterDataCallback = loadAllCallback;
	this.fieldMasterDataCallbackData = loadAllCallbackData;
	this.sourceMapping = {};
	var fields = this.getFormFields();
	var filterFields = this.getFilters();
	
	if(filterFields != null){
		for(var j=0; j<filterFields.length; j++){
			values = this.getMetaFieldValues(filterFields[j][0], fields);
			if(values == null || (values['type'] != 'select' || values['type'] != 'select2' || values['type'] != 'select2multi')){
				fields.push(filterFields[j]);
			}
		}
	}
	
	var remoteSourceFields = [];
	var remoteSourceFieldKeys = [];
	var field = null;
	var fieldSub = null;
	for(var i=0; i<fields.length; i++){
		field = fields[i];
		if(field[1]['remote-source'] != undefined && field[1]['remote-source'] != null){
			var key = field[1]['remote-source'][0]+"_"+field[1]['remote-source'][1]+"_"+field[1]['remote-source'][2];
			if(remoteSourceFieldKeys.indexOf(key) < 0){
				remoteSourceFields.push(field);
				remoteSourceFieldKeys.push(key);
			}
		}else if(field[1]['form'] != undefined && field[1]['form'] != null){
			for(var j=0; j<field[1]['form'].length; j++){
				fieldSub = field[1]['form'][j];
				if(fieldSub[1]['remote-source'] != undefined && fieldSub[1]['remote-source'] != null){
					var key = fieldSub[1]['remote-source'][0]+"_"+fieldSub[1]['remote-source'][1]+"_"+fieldSub[1]['remote-source'][2];
					if(remoteSourceFieldKeys.indexOf(key) < 0){
						remoteSourceFields.push(fieldSub);
						remoteSourceFieldKeys.push(key);
					}
				}
			}
		}
	}
	
	for(var i=0; i<remoteSourceFields.length; i++){
		var field = remoteSourceFields[i];
		if(field[1]['remote-source'] != undefined && field[1]['remote-source'] != null){
			var key = field[1]['remote-source'][0]+"_"+field[1]['remote-source'][1]+"_"+field[1]['remote-source'][2];
			this.fieldMasterDataKeys[key] = false;
			this.sourceMapping[field[0]] = field[1]['remote-source'];
			
			var callBackData = {};
			callBackData['callBack'] = 'initFieldMasterDataResponse';
			callBackData['callBackData'] = [key];
			if(callBack != undefined && callBack != null){
				callBackData['callBackSuccess'] = callBack;
			}
			this.getFieldValues(field[1]['remote-source'], callBackData);
		}
	}
});  

/**
 * Pass true to this method after creating module JS object to open new/edit entry form for the module on a popup.
 * @method setShowFormOnPopup
 * @param val {Boolean}
 * @example
 * 	modJs.subModJsList['tabCandidateApplication'] = new CandidateApplicationAdapter('Application','CandidateApplication',{"candidate":data.id});
 *	modJs.subModJsList['tabCandidateApplication'].setShowFormOnPopup(true);
 */

BingoJSBase.method('showFormOnPopup', function(val) {
	this.showFormOnPopup = val;
});
 
/**
 * Set this to false  if you need the datatable to load data page by page instead of loading all data at once.
 * @method setRemoteTable
 * @param val {Boolean}
 * @example
 * 	modJs.subModJsList['tabCandidateApplication'] = new CandidateApplicationAdapter('Application','CandidateApplication',{"candidate":data.id});
 *	modJs.subModJsList['tabCandidateApplication'].setRemoteTable(false);
 */
BingoJSBase.method('setRemoteTable', function(val) {
	this.createRemoteTable = val;
});

BingoJSBase.method('getRemoteTable', function() {
	return this.createRemoteTable;
});

BingoJSBase.method('isAllLoaded', function(fieldMasterDataKeys) {
	for(key in fieldMasterDataKeys){
		if(fieldMasterDataKeys[key] == false){
			return false;
		}
	}
	return true;
});

BingoJSBase.method('initFieldMasterDataResponse', function(key, data, callBack, loadAllCallBackData) {
	this.fieldMasterData[key] = data;
	this.filedMasterDataKeys[key] = true;
	
	if(callBack != undefined && callBack != null){
		callBack();
	}
	
	if(this.fieldMasterDataCallBack != null && this.fieldMasterDataCallBack != undefined && this.isAllLoaded(this.fieldMasterDataKeys)){
		if(this.fieldMasterDataCallBackData == null || this.fieldMasterDataCallBackData == undefined){
			this.fieldMasterDataCallBack();
		}else{
			this.fieldMasterDataCallBack(this.fieldMasterDataCallBackData);
		}
	}
});


BingoJSBase.method('getMetaFieldValues', function(key, fields) {
	for(var i=0; i<fields.length; i++){
		if(key == fields[i][0]){
			return fields[i][1];
		}
	}
	return null;
});

BingoJSBase.method('getSourceMapping', function() {
	return this.sourceMapping;
});

BingoJSBase.method('setTesting', function(testing) {
	this.testing = testing;
});

BingoJSBase.method('consoleLog', function(message) {
	if(this.testing){
		console.log(message);
	}
});

BingoJSBase.method('setClientMessages', function(msgList) {
	this.msgList = msgList;
});

BingoJSBase.method('setTemplates', function(templates) {
	this.templates = templates;
});

BingoJSBase.method('getWSProperty', function(array, key) {
	if(array.hasOwnProperty(key)){
		return array[key];
	}
	return null;
});

BingoJSBase.method('getClientMessages', function(key) {
	return this.getWSProperty(this.msgList, key);
});

BingoJSBase.method('getTemplates', function(key) {
	return this.getWSProperty(this.templates, key);
});

BingoJSBase.method('setGoogleAnalytics', function(gaq) {
	this.gaq = gaq;
});

BingoJSBase.method('showView', function(view) {
	if(this.currentView != null){
		this.previousView = this.currentView;
		$("#" + this.currentView).hide();
	}
	$("#" + view).show();
	this.currentView = view;
	this.moveToTop();
});

BingoJSBase.method('showPreviousView', function() {
	this.showView(this.previousView);
});

BingoJSBase.method('moveToTop', function() {
	
});

BingoJSBase.method('callFunction', function(callback, cbParams, thisParam) {
	if($.isFunction(callback)){
		try{
			if(thisParam == undefined || thisParam == null){
				callback.apply(document, cbParams);
			}else{
				callback.apply(thisParam, cbParams);
			}
		}catch(e){
		}
	}else{
		f = this[callback];
		if($.isFunction(f)){
			try{
				f.apply(this, cbParams);
			}catch(e){
			}
		}
	}
	return;
});


BingoJSBase.method('getTableTopButtonHtml', function() {
	var html = "";
	if(this.getShowAddNew()){
		html = '<button onclick="modJs.renderForm();return false;" class="btn btn-small btn-primary">' + this.getAddNewLabel() + '<i class="fa fa-plus"></i></button>';
	}
	
	if(this.getFilters() != null){
		if(html != null){
			html += '&nbsp;&nbsp;';
		}
		html += '<button onclick="modJs.showFilters();return false;" class="btn btn-small btn-primary">Filter <i class="fa fa-filter"></i></button>';
		html += '&nbsp;&nbsp;';
		if(this.filtersAlreadySet){
			html += '<button id="__id__resetFilters" onclick="modJs.resetFilters();return false;" class="btn btn-small btn-default">__filterString__ <i class="fa fa-times"></i></button>'; 
		}else{
			html += '<button id="__id__resetFilters" onclick="modJs.resetFilters();return false;" class="btn btn-small btn-default" style="display:none;">__filterString__ <i class="fa fa-times"></i></button>';
		}
	}
	
	html = html.replace('__id__/g', this.getTableName());
	
	if(this.getCurrentFilterString != "" && this.currentFilterString != null){
		html = html.replace('__filterString__/g', this.currentFilterString);
	}else{
		html = html.replace('__filterString__/g', 'Reset Filters');
	}
	
	if(html != ""){
		html = '<div class="row"><div class="col-xs-12">' + html + "</div></div>";
	}
	
	return html;
});

/**
 * Create the data table on provided element id
 * @method createTable
 * @param elementId {Boolean}
 */
BingoJSBase.method('createTable', function(elementId) {
	
	if(this.getRemoteTable()){
		this.createTableServer(elementId);
		return;
	}
	
	var headers = this.getHeaders();
	var data = this.getTableData();
	
	if(this.showActionButtons()){
		headers.push({ "sTitle":"", "sClass":"center"});
	}
	
	if(this.showActionButtons()){
		for(var i=0; i<data.length; i++){
			data[i].push(this.getActionButtonsHtml(data[i][0], data[i]));
		}
	}
	
	var html = '';
	html = this.getTableTopButtonHtml() + '<div class="box-body table-responsive"><table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-striped" id="grid"></table></div>';
	
	//find current page
	var activePage = $('#' + elementId + ' .dataTables_paginate .active a').html();
	var start = 0;
	if(activePage != undefined && activePage != null){
		start = parseInt(activePage, 10)*15 - 15;
	}
	
	$('#' + elementId).html(html);
	
	var dataTableParams = {
		"oLanguage" : {
			'sLengthMenu' : '_MENU_ records per page'
		},
		"aaData" : data,
		"aoColumns" : headers,
		"bSort" : false,
		"iDisplayLength" : 15,
		"iDisplayStart" : start
	};
	
	var customTableParams = this.customTableParams();
	
	$.extend(dataTableParams, customTableParams);
	
	$('#' + elementId + ' #grid').dataTable(dataTableParams);
	$('.dataTables_paginate ul').addClass('pagination');
	$('.dataTables_length').hide();
	$('.dataTables_filter input').addClass('form-control');
	$('.dataTables_filter input').attr('placeholder', 'Search');
	$('.dataTables_filter label').contents().filter(function(){
		return (this.nodetype == 3);
	}).remove();
	$('.tableActionButton').tooltip();
});

/**
 * Create a data table on provided element id which loads data page by page
 * @method createTableServer
 * @param val {Boolean}
 */
BingoJSBase.method('createTableServer', function(elementId) {
	var that = this;
	var headers = this.getHeaders();
	
	headers.push({'sTitle': '', 'sClass': 'center'});
	
	var html = "";
	html = this.getTableTopButtonHtml() + '<div class="box-body table-responsive"><table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-striped" id="grid"></table></div>';
	
	//find current page
	var activePage = $('#' + elementId + ' .dataTables_paginate .active a').html();
	var start = 0;
	if(activePage != undefined && activePage != null){
		start = parseInt(activePage, 10)*15 - 15;
	}
	
	$('#' + elementId).html(html);
	
	var dataTableParams = {
		"oLanguage" : {
			'sLengthMenu' : '_MENU_ records per page'
		},
		"bProcessing" : true,
		"bServerSide" : true,
		"sAjaxSource" : that.getDataUrl(that.getDataMapping()),
		"aoColumns" : headers,
		"bSort" : false,
		"parent" : that,
		"iDisplayLength" : 15,
		"iDisplayStart" : start
	};
	
	if(this.showActionButtons()){
		dataTableParams["aoColumnDefs"] = [
			{
				'fnRender': that.getActionButtons(),
				'aTargets': [that.getDataMapping().length] 
			}
		];
	}
	
	var customTableParams = this.getCustomTableParams();
	$.extend(dataTableParams, customTableParams);
	$('#'+elementId+' #grid').dataTable( dataTableParams );
	$(".dataTables_paginate ul").addClass("pagination");
	$(".dataTables_length").hide();
	$(".dataTables_filter input").addClass("form-control");
	$(".dataTables_filter input").attr("placeholder","Search");
	$('.dataTables_filter label').contents().filter(function(){
		return (this.nodetype == 3);
	}).remove();
	$('.tableActionButton').tooltip();
});

/**
 * This should be overridden in module lib.js classes to return module headers which are used to create the data table.
 * @method getHeaders
 * @example
	SettingAdapter.method('getHeaders', function() {
  		return [
			{ "sTitle": "ID" ,"bVisible":false},
			{ "sTitle": "Name" },
			{ "sTitle": "Value"},
			{ "sTitle": "Details"}
		];
		});
 */
BingoJSBase.method('getHeaders', function() {
	
});

/**
 * This should be overridden in module lib.js classes to return module field values which are used to create the data table.
 * @method getDataMapping
 * @example
	SettingAdapter.method('getDataMapping', function() {
	return [
	        "id",
	        "name",
	        "value",
	        "description"
	];
	});
 */
BingoJSBase.method('getDataMapping', function() {
	
});

/**
 * This should be overridden in module lib.js classes to return module form fields which are used to create the add/edit form and also used for initializing select box values in form.
 * @method getFormFields
 * @example
	SettingAdapter.method('getFormFields', function() {
	return [
	        [ "id", {"label":"ID","type":"hidden"}],
	        [ "value", {"label":"Value","type":"text","validation":"none"}]
	];
	});
 */
BingoJSBase.method('getFormFields', function() {
	
});

BingoJSBase.method('getTableData', function() {
	
});

/**
 * This can be overridden in module lib.js classes inorder to show a filter form
 * @method getFilters
 * @example
	EmployeeAdapter.method('getFilters', function() {
		return [
		        [ "job_title", {"label":"Job Title","type":"select2","allow-null":true,"null-label":"All Job Titles","remote-source":["JobTitle","id","name"]}],
		        [ "department", {"label":"Department","type":"select2","allow-null":true,"null-label":"All Departments","remote-source":["CompanyStructure","id","title"]}],
		        [ "supervisor", {"label":"Supervisor","type":"select2","allow-null":true,"null-label":"Anyone","remote-source":["Employee","id","first_name+last_name"]}]
		];
	});
 */
BingoJSBase.method('getFilters', function() {
	return null;
});

/**
 * Show the edit form for an item
 * @method edit
 * @param id {int} id of the item to edit
 */
BingoJSBase.method('edit', function(id) {
	this.currentId = id;
	this.getElement(id, []);
});

BingoJSBase.method('renderModel', function(id, header, body) {
	$('#'+id+'ModelBody').html('');
	
	if(body == undefined || body == null){
		body = '';
	}
	
	$('#'+id+'ModelLabel').html(header);
	$('#'+id+'ModelBody').html(body);
	
});


BingoJSBase.method('renderModelFromDom', function(id, header, element) {
	$('#'+id+'ModelBody').html('');
	
	if(element == undefined || element == null){
		element = '';
	}
	
	$('#'+id+'ModelLabel').html(header);
	$('#'+id+'ModelBody').html('');
	$('#'+id+'ModelBody').append(element);
});

/**
 * Delete an item
 * @method deleteRow
 * @param id {int} id of the item to edit
 */
BingoJSBase.method('deleteRow', function(id) {
	this.deleteParams['id'] = id;
	this.renderModel('delete',"Confirm Deletion","Are you sure you want to delete this item ?");
	$('#deleteModel').modal('show');
});

/**
 * Show a popup with message
 * @method showMessage
 * @param title {String} title of the message box
 * @param message {String} message
 * @param closeCallback {Function} this will be called once the dialog is closed (optional)
 * @param closeCallback {Function} data to pass to close callback (optional)
 * @param isPlain {Boolean} if true buttons are not shown (optional / default = true)
 * @example
 * 	this.showMessage("Error Occured while Applying Leave", callBackData);
 */
BingoJSBase.method('showMessage', function(title, message, closeCallback, closeCallbackData, isPlain) {
	var that = this;
	var modelId = '';
	if(isPlain){
		modelId = "#plainMessageModel";
		this.renderModel('plainMessage', title, message);
	}else{
		modelId = "#messageModel";
		this.renderModel('message',title,message);
	}
	
	$(modelId).unbind('hide');
	if(closeCallback != null && closeCallback != undefined){
		$(modelId).on('hidden.bs.modal',function(){
			closeCallback.apply(that,closeCallbackData);
			$(modelId).unbind('hidden.bs.modal');
		});
	}
	$(modelId).modal({
		  backdrop: 'static'
	});
});