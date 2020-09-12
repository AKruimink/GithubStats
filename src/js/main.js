/**
 * Defines a class that handles everything related to the main page
 */
class Main {
    /**
     * Intializes a new instance of Main
     */
    constructor() {
        var _a, _b, _c;
        /**
         * Root address to the github api
         */
        this.apiRoot = "https://api.github.com/";
        this.validateUserInput();
        // Setup form event handlers
        (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.addEventListener("keyup", this.validateUserInput);
        (_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.addEventListener("keyup", this.validateUserInput);
        // Setup search event handler
        (_c = document.getElementById("get-stats-button")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", event => this.onGetStatsButtonClicked(event));
        // Setup page view
        let username = this.getQueryParameter("username");
        let repository = this.getQueryParameter("repository");
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
}
/**
 * Creates the entrypoint of the Main class
 */
let main = new Main();
//# sourceMappingURL=main.js.map