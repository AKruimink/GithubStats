var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Defines a class that handles everything related to the main page
 */
class Main {
    /**
     * Intializes a new instance of Main
     */
    constructor() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        /**
         * Root address to the github api
         */
        this.apiRoot = "https://api.github.com/";
        this.validateUserInput();
        // Setup form event handlers
        (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.addEventListener("keyup", this.validateUserInput);
        (_b = document.getElementById("username")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", this.setUserRepositories.bind(this));
        (_c = document.getElementById("username")) === null || _c === void 0 ? void 0 : _c.addEventListener("keyup", (e) => {
            if (e.keyCode == 13) {
                this.onEnterPressed();
            }
        });
        (_d = document.getElementById("repository")) === null || _d === void 0 ? void 0 : _d.addEventListener("keyup", this.validateUserInput);
        (_e = document.getElementById("repository")) === null || _e === void 0 ? void 0 : _e.addEventListener("input", this.validateUserInput);
        (_f = document.getElementById("repository")) === null || _f === void 0 ? void 0 : _f.addEventListener("keyup", (e) => {
            if (e.keyCode == 13) {
                this.onEnterPressed();
            }
        });
        // Setup search event handler
        (_g = document.getElementById("get-stats-button")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", event => this.onGetStatsButtonClicked(event));
        // Setup page view
        let username = this.getQueryParameter("username");
        let repository = this.getQueryParameter("repository");
        if (username != "" && repository != "") {
            (_h = document.getElementById("username")) === null || _h === void 0 ? void 0 : _h.setAttribute("value", username);
            (_j = document.getElementById("repository")) === null || _j === void 0 ? void 0 : _j.setAttribute("value", repository);
            this.validateUserInput();
            this.setUserRepositories();
            this.getStats();
        }
        else {
            (_k = document.getElementById("username")) === null || _k === void 0 ? void 0 : _k.focus();
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
     *
     */
    getStats() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let repositoryUrl = this.apiRoot + "repos/" + ((_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value) + "/" + ((_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.value);
            let repositoryResponse = yield fetch(repositoryUrl);
            let error = false;
            let errorMessage = "";
            if (repositoryResponse.status == 404) {
                error = true;
                errorMessage = "This account or project does not exist!";
            }
            if (repositoryResponse.status == 403) {
                error = true;
                errorMessage = "You've exeeded Github's rate limit. <br/> Please try again later.";
            }
            let html = "";
            if (error) {
                html = html.concat("<div class='alert alert-danger output'>" + errorMessage + "</div>");
            }
            else {
                let repositoryData = yield repositoryResponse.json();
                let subscribers = repositoryData["subscribers_count"];
                let startgazers = repositoryData["stargazers_count"];
                let forks = repositoryData["forks_count"];
                let releaseResponse = yield fetch(repositoryUrl + "/releases");
                let releaseData = yield releaseResponse.json();
                let isLatestRelease = true;
                let totalDownloadCount = 0;
                releaseData.forEach((element) => {
                    let releaseTag = element.tag_name;
                    let releaseBadge = "";
                    let releaseClassNames = "release";
                    let releaseUrl = element.html_url;
                    let isPreRelease = element.prerelease;
                    let releaseAssets = element.assets;
                    let releaseDownloadCount = 0;
                    let releaseAuthor = element.author;
                    let releaseDate = element.published_at.split("T")[0];
                    if (isPreRelease) {
                        releaseBadge = "&nbsp;&nbsp;<span class='badge'>Pre-release</span>";
                        releaseClassNames = releaseClassNames.concat(" pre-release");
                    }
                    else if (isLatestRelease) {
                        releaseBadge = "&nbsp;&nbsp;<span class='badge'>latest release</span>";
                        releaseClassNames = releaseClassNames.concat(" latest-release");
                        isLatestRelease = false;
                    }
                    // Get download info
                    // We get the download content first, even tho it's the last item displayed, just so we can grab the downloads used by the release info
                    let downloadInfoHtml = "";
                    if (releaseAssets.length > 0) {
                        downloadInfoHtml = downloadInfoHtml.concat("<h4><span class='material-icons md-24'>get_app</span>&nbsp;&nbsp;Download Info</h4>");
                        downloadInfoHtml = downloadInfoHtml.concat("<ul>");
                        releaseAssets.forEach((asset) => {
                            let assetSize = (asset.size / 1048576.0).toFixed(2); // 1048576.0 == 1 mega byte
                            let lastUpdate = asset.updated_at.split("T")[0];
                            downloadInfoHtml = downloadInfoHtml.concat("<li><code>" + asset.name + "</code> (" + assetSize + "&nbsp;MiB) - "
                                + "downloaded " + asset.download_count + "&nbsp;times - "
                                + "Last updated on " + lastUpdate + "</li>");
                            totalDownloadCount += asset.download_count;
                            releaseDownloadCount += asset.download_count;
                        });
                        downloadInfoHtml = downloadInfoHtml.concat("</ul>");
                    }
                    // get version info
                    let versionInfo = "";
                    versionInfo = versionInfo.concat("<h3><span class='material-icons md-24'>local_offer</span>&nbsp;&nbsp;"
                        + "<a href='" + releaseUrl + "' target='_blank'>" + releaseTag + "</a>"
                        + releaseBadge + "</h3>");
                    versionInfo = versionInfo.concat("<hr class='release-hr'>");
                    // get release info
                    let releaseInfo = "";
                    releaseInfo = releaseInfo.concat("<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;"
                        + "Release Info</h4>");
                    releaseInfo = releaseInfo.concat("<ul>");
                    if (releaseAuthor != null) {
                        releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;"
                            + "Author: <a href='" + releaseAuthor.html_url + "'>@" + releaseAuthor.login + "</a></li>");
                    }
                    if (releaseDownloadCount > 0) {
                        releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;"
                            + "Downloads: " + releaseDownloadCount + "</li>");
                    }
                    releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>calendar_today</span>&nbsp;&nbsp;"
                        + "Published: " + releaseDate + "</li>");
                    releaseInfo = releaseInfo.concat("</ul>");
                    // Setup inner html
                    html = html.concat("<div class='output'>");
                    html = html.concat("<div class='row " + releaseClassNames + "'>");
                    html = html.concat(versionInfo);
                    html = html.concat(releaseInfo);
                    html = html.concat(downloadInfoHtml);
                    html = html.concat("</div> </div>");
                });
            }
            let result = document.getElementById("stats-result");
            result.innerHTML = html;
        });
    }
    /**
     * Sets all user repositories as suggestion in the repository field
     */
    setUserRepositories() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let username = (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value;
            let repositoryList = document.getElementById("repository-list");
            let response = yield fetch(this.apiRoot + "users/" + username + "/repos");
            if (response.ok == true) {
                let data = yield response.json();
                repositoryList.innerHTML = "";
                data.forEach((element) => {
                    let option = document.createElement('option');
                    option.value = element.name;
                    repositoryList.appendChild(option);
                });
            }
        });
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