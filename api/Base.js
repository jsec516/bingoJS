/**
 * The base class for providing core functions to all module classes.
 * @class Base.js
 */
// iceHRMBase renamed to bingoJSBase
function bingoJSBase() {
	this.deleteParams = {};
	this.createRemoteTable = false;
	this.instanceId = "None";
	this.ga = []; // google analytics
	this.showEdit = true; // show edit button
	this.showDelete = true; // show delete button
	this.showSave = true; // show add button
	this.showCancel = true; // show cancel button
	this.showFormOnPopup = false;
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

bingoJSBase.method('init', function(appName, currentView, dataUrl, permissions) {

});

