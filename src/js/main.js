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
        let username = this.getQueryVariable("username");
        let repository = this.getQueryVariable("repository");
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
     * Gets the value of a query variable
     * @param variableName Name of the query variable to get
     */
    getQueryVariable(variableName) {
        let query = window.location.search.substring(1);
        let variables = query.split("&");
        for (var i = 0; i < variables.length; i++) {
            let pair = variables[i].split("=");
            if (pair[0] == variableName) {
                return pair[1];
            }
        }
        return "";
    }
    /**
     * Sets a new query variable
     * @param variableName Name of the variable to set
     * @param variableValue Value to assign to the new variable
     */
    setQueryVariable(variableNames, variableValues) {
        if (variableNames.length != variableValues.length) {
            return;
        }
        let query = window.location.search.substring(1);
        for (let i = 0; i < variableNames.length; i++) {
            if (query.length <= 0) {
                query = query.concat("?");
            }
            else {
                query = query.concat("&");
            }
            query = query.concat(variableNames[i] + "=" + variableValues[i]);
        }
        window.location.href = query;
        // if(query.length <= 0) {
        //     query = query.concat("?");
        // }
        // else {
        //     query = query.concat("&");
        // }
        // query = query.concat(variableName + "=" + variableValue);
        // window.location.href = query;
    }
    /**
     * Invoked when the Get Stats Button is clicked and  gets all information of a repository
     */
    onGetStatsButtonClicked(eventArgs) {
        var _a, _b;
        let username = (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value;
        let repository = (_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.value;
        if (username != null && repository != null) {
            this.setQueryVariable(["username", "repository"], [username, repository]);
        }
    }
}
/**
 * Creates the entrypoint of the Main class
 */
let main = new Main();
//# sourceMappingURL=main.js.map