/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, event, CustomEvent, localStorage */

var PhoneGapBuild = function () {
    'use strict';
	var URL_BASE = "https://build.phonegap.com",
        URL_TOKEN = URL_BASE + "/token",
        URL_LIST = URL_BASE + "/api/v1/apps",
        URL_REBUILD = URL_BASE + "/api/v1/apps/",
        self = this;

    function addListener(type, listener) {
        if (typeof self._listeners[type] === "undefined") {
            self._listeners[type] = [];
        }
        self._listeners[type].push(listener);
    }

    function fire(event) {
        var i = 0;
        if (typeof event === "string") {
            event = { type: event };
        }
        if (!event.target) {
            event.target = self;
        }

        if (!event.type) {  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (self._listeners[event.type] instanceof Array) {
            var listeners = self._listeners[event.type];

            for (i = 0; i < listeners.length; i++) {
                listeners[i].call(self, event);
            }
        }
    }

    function removeListener(type, listener) {
        var i = 0;
        if (self._listeners[type] instanceof Array) {
            var listeners = self._listeners[type];
            for (i = 0; i < listeners.length; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }

    function errorHandler(error) {
        console.log("Call Error");
        console.log(error.status);
        console.log(error.statusText);
        console.log(error.responseText);
    }

    function setToken(token) {
        self.token = token;
        localStorage.setItem('token', token);
        console.log("Token set to: " + token);
    }

    function initialize() {
        var token = localStorage.getItem("token");
        var tokenDefined = false;

        if (token !== "") {
            tokenDefined = true;
            setToken(token);
            self.initialized = true;
        }

        var myEvent = new CustomEvent("initialized", {detail: {tokenDefined: tokenDefined}});
        fire(myEvent);

    }

    function handlerUploadtToProject(response, status, jqXHR) {
        console.log(response);
    }

    function uploadFileToProject(id, FileEntry) {


        var urlToCall = URL_REBUILD + id + "?auth_token=" + self.token;
        var xhr = new XMLHttpRequest();
        xhr.open('put', urlToCall, true);        
        console.log(FileEntry);

        xhr.send(FileEntry);
        



    }



	function setList(list) {
		self.list = list;
	}

    function handleLoginSuccess(response, status, jqXHR) {
        console.log("Token Retreived");
        console.log(response);
        setToken(response.token);

        var myEvent = new CustomEvent("login", {});
        fire(myEvent);
    }

	function login(username, password) {
		$.ajax({
            url: URL_TOKEN,
            type: "post",
            error: errorHandler,
            context: PhoneGapBuild,
            success: handleLoginSuccess,
            username: username,
            password: password,
            cache: false,
            crossDomain: true
        });
	}

    function handleRebuildSuccess(response, status, jqXHR) {
        console.log('Rebuild Requested');
        var myEvent = new CustomEvent("rebuildRequested", {});
        fire(myEvent);
    }

    function rebuild(id) {
        $.ajax({
            url: URL_REBUILD + "/" + id + "?auth_token=" + self.token,
            type: "put",
            error: errorHandler,
            context: PhoneGapBuild,
            success: handleRebuildSuccess,
            cache: false,
            crossDomain: true
        });
    }



    function logout() {
        console.log("Logout");
        setToken("");
        self.tokenDefined = false;
        self.initialized = false;
        self.list = [];

        var myEvent = new CustomEvent("logout", {});
        fire(myEvent);
    }

    function handleListSuccess(response, status, jqXHR) {
        console.log("List Retreived");
        console.log(response.apps);
        setList(response.apps);

        var myEvent = new CustomEvent("listloaded", {detail: {list: response.apps}});
        fire(myEvent);
    }

    function getList() {
        $.ajax({
            url: URL_LIST + "?auth_token=" + self.token,
            success: handleListSuccess,
            dataType: 'jsonp',
            type: "get",
            error: errorHandler,
            cache: false,
            crossDomain: true
        });
    }

    this._listeners = {};

    this.token = "";
    this.list = "List of PhoneGap Build projects.";
    this.initialized = false;
    this.login = login;
    this.getList = getList;
    this.addListener = addListener;
    this.initialize = initialize;
    this.logout = logout;
    this.rebuild = rebuild;
    this.uploadFileToProject = uploadFileToProject;

};