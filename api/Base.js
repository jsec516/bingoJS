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
	this.filtersAlreadySet = false;
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



