/**
 * Defines a class that handles everything related to the main page
 */
class Main {
    /**
     * Intializes a new instance of Main
     */
    constructor() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        /**
         * Root address to the github api
         */
        this.apiRoot = "https://api.github.com/";
        this.validateUserInput();
        // Setup form event handlers
        (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.addEventListener("keyup", this.validateUserInput);
        (_b = document.getElementById("username")) === null || _b === void 0 ? void 0 : _b.addEventListener("keyup", (e) => {
            if (e.keyCode == 13) {
                this.onEnterPressed();
            }
        });
        (_c = document.getElementById("repository")) === null || _c === void 0 ? void 0 : _c.addEventListener("keyup", this.validateUserInput);
        (_d = document.getElementById("repository")) === null || _d === void 0 ? void 0 : _d.addEventListener("keyup", (e) => {
            if (e.keyCode == 13) {
                this.onEnterPressed();
            }
        });
        // Setup search event handler
        (_e = document.getElementById("get-stats-button")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", event => this.onGetStatsButtonClicked(event));
        // Setup page view
        let username = this.getQueryParameter("username");
        let repository = this.getQueryParameter("repository");
        if (username != "" && repository != "") {
            (_f = document.getElementById("username")) === null || _f === void 0 ? void 0 : _f.setAttribute("value", username);
            (_g = document.getElementById("repository")) === null || _g === void 0 ? void 0 : _g.setAttribute("value", repository);
            this.validateUserInput();
            // Get user repo's
            // GetStats
        }
        else {
            (_h = document.getElementById("username")) === null || _h === void 0 ? void 0 : _h.focus();
        }
    }
    /**
     * Validates the user input
     * If the user input is valid the get-stats-button will be enabled, if not it will be disabled
     */
    validateUserInput() {
        var _a, _b;
        let username = (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value;
        let repository = (_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.value;
        let getStatsButton = document.getElementById("get-stats-button");
        if (getStatsButton != null) {
            if (username != null && repository != null) {
                if (username.length > 0 && repository.length > 0) {
                    getStatsButton.disabled = false;
                }
                else {
                    getStatsButton.disabled = true;
                }
            }
            else {
                getStatsButton.disabled = true;
            }
        }
    }
    /**
     * Gets the value of a query parameter
     * @param parameterName Name of the query parameter to get the value of
     */
    getQueryParameter(parameterName) {
        let query = window.location.search.substring(1);
        let variables = query.split("&");
        for (var i = 0; i < variables.length; i++) {
            let pair = variables[i].split("=");
            if (pair[0] == parameterName) {
                return pair[1];
            }
        }
        return "";
    }
    /**
     * Sets new query parameters, or replaces the value of existing once
     * @param parameterNames  Names of the parameters to set
     * @param parameterValues  Values of the parameters to set
     */
    setQueryParameters(parameterNames, parameterValues) {
        if (parameterNames.length != parameterValues.length) {
            return;
        }
        let newQuery = "";
        for (let i = 0; i < parameterNames.length; i++) {
            if (newQuery.length <= 0) {
                newQuery = newQuery.concat("?");
            }
            else {
                newQuery = newQuery.concat("&");
            }
            newQuery = newQuery.concat(parameterNames[i] + "=" + parameterValues[i]);
        }
        window.location.href = newQuery;
    }
    /**
     * Invoked when the Get Stats Button is clicked and  gets all information of a repository
     */
    onGetStatsButtonClicked(eventArgs) {
        var _a, _b;
        let username = (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value;
        let repository = (_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.value;
        if (username != null && repository != null) {
            this.setQueryParameters(["username", "repository"], [username, repository]);
        }
    }
    /**
     * Invoked when the enter key is pressed and sets the focus to the next item
     */
    onEnterPressed() {
        var _a;
        let username = document.getElementById("username");
        let repository = document.getElementById("repository");
        if (!(username === null || username === void 0 ? void 0 : username.value)) {
            username === null || username === void 0 ? void 0 : username.focus();
        }
        else if (!(repository === null || repository === void 0 ? void 0 : repository.value)) {
            repository === null || repository === void 0 ? void 0 : repository.focus();
        }
        else {
            (_a = document.getElementById("get-stats-button")) === null || _a === void 0 ? void 0 : _a.click();
        }
    }
}
/**
 * Creates the entrypoint of the Main class
 */
let main = new Main();
//# sourceMappingURL=main.js.map