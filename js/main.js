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
     * Gets and displays all project stats of the current username and repository
     */
    getStats() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let repositoryUrl = this.apiRoot + "repos/" + ((_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value) + "/" + ((_b = document.getElementById("repository")) === null || _b === void 0 ? void 0 : _b.value);
            let repositoryResponse = yield fetch(repositoryUrl + "?page=1&per_page=100");
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
                let isLatestRelease = true;
                let totalDownloads = 0;
                let releaseResponse = yield fetch(repositoryUrl + "/releases?page=1&per_page=100");
                let releaseData = yield releaseResponse.json();
                // get the information of each release
                releaseData.forEach((release) => {
                    // get the download information
                    let downloadInfoHtml = "";
                    let downloadHtmlResult = this.getDownloadInfoAsHtml(release.assets);
                    downloadInfoHtml = downloadInfoHtml.concat(downloadHtmlResult[1]);
                    totalDownloads += downloadHtmlResult[0];
                    // get the release label
                    let releaseLabelHtml = this.getReleasesLabelAsHtml(release, isLatestRelease);
                    // get the release info
                    let releaseInfoHtml = this.getReleaseInfoAsHtml(release, downloadHtmlResult[0]);
                    // add the release to the html
                    let releaseClassNames = "node";
                    if (isLatestRelease) {
                        releaseClassNames = releaseClassNames.concat(" latest-release");
                        isLatestRelease = false;
                    }
                    else if (release.prerelease) {
                        releaseClassNames = releaseClassNames.concat(" pre-release");
                    }
                    html = html.concat("<div class='row " + releaseClassNames + "'>");
                    html = html.concat(releaseLabelHtml);
                    html = html.concat(releaseInfoHtml);
                    html = html.concat(downloadInfoHtml);
                    html = html.concat("</div>");
                });
                // get the project stats
                let repositoryInfoHtml = "<div class='row node repository'>";
                repositoryInfoHtml = repositoryInfoHtml.concat(this.getRepositoryInfoAsHtml(repositoryData));
                repositoryInfoHtml = repositoryInfoHtml.concat(this.getRepositoryStatsAsHtml(repositoryData, totalDownloads));
                repositoryInfoHtml = repositoryInfoHtml.concat("</div>");
                // Set all the stats informaton
                html = repositoryInfoHtml.concat(html);
            }
            let result = document.getElementById("stats-result");
            result.innerHTML = html;
        });
    }
    /**
     * Gets the info of a given repository as an HTML element
     * @param repository Repository used to create the info element with
     * Returns a string containing the repository info as an HTML element
     */
    getRepositoryInfoAsHtml(repository) {
        let returnHtml = "<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;" +
            "Repository Info</h4><ul>";
        if (repository.owner != null) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" +
                "Owner: <a href='" + repository.owner.url + "'>@" + repository.owner.login + "</a></li>");
        }
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" +
            "Repository: <a href='" + repository.url + "'>@" + repository.name + "</a></li>");
        if (repository.description != null) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>description</span>&nbsp;&nbsp;" +
                "Description: " + repository.description + "</li></ul>");
        }
        return returnHtml;
    }
    /**
     * Gets the stats info of a given repository as an HTML element
     * @param repository Repository used to create the stats element with
     * @param totalDownloads Total amount of downloads the repository has
     * Returns a string containing the repository stats as an HTML element
     */
    getRepositoryStatsAsHtml(repository, totalDownloads) {
        let returnHtml = "<h4><span class='material-icons md-24'>leaderboard</span>&nbsp;&nbsp;" +
            "Repository Stats</h4><ul>";
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>visibility</span>&nbsp;&nbsp;" +
            "Watchers: " + repository.subscribers_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>star_border</span>&nbsp;&nbsp;" +
            "Stargazers: " + repository.stargazers_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>call_split</span>&nbsp;&nbsp;" +
            "Forks: " + repository.forks_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;" +
            "Total Downloads: " + totalDownloads + "</li></ul>");
        return returnHtml;
    }
    /**
     * Gets a label of a release as a HTML element
     * @param release Release used to create the label with
     * @param isLatestRelease Indication if the release being made is the latest release
     * Returns the release label as a html string
     */
    getReleasesLabelAsHtml(release, isLatestRelease = false) {
        let releaseBadge = "";
        if (isLatestRelease) {
            releaseBadge = "&nbsp;&nbsp;<span class='badge'>Latest-release</span>";
        }
        else if (release.prerelease) {
            releaseBadge = "&nbsp;&nbsp;<span class='badge'>Pre-release</span>";
        }
        let returnHtml = "<h3><span class='material-icons md-24'>local_offer</span>&nbsp;&nbsp;" +
            "<a href='" + release.html_url + "' target='_blank'>" + release.tag_name + "</a>" +
            releaseBadge + "</h3>";
        returnHtml = returnHtml.concat("<hr class='node-hr'>");
        return returnHtml;
    }
    /**
     * Gets the release info of a release as a HTML element
     * @param release Release used to create the release info element
     * @param downloadCount Amount of downloads the release has
     * Returns a string containing the release info as an HTML element
     */
    getReleaseInfoAsHtml(release, downloadCount = 0) {
        let returnHtml = "<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;" +
            "Release Info</h4><ul>";
        if (release.author != null) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" +
                "Author: <a href='" + release.author.html_url + "'>@" + release.author.login + "</a></li>");
        }
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>date_range</span>&nbsp;&nbsp;" +
            "Published: " + release.published_at.split("T")[0] +
            " (" + this.CalculateDays(new Date(release.published_at), new Date()) + " Days)</li>");
        if (downloadCount > 0) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;" +
                "Downloads: " + downloadCount + "</li>");
        }
        returnHtml = returnHtml.concat("</ul>");
        return returnHtml;
    }
    /**
     * Gets the download info of a release as a HTML elemenet
     * @param assets Array containing all releases and asset info
     * Returns an array containing the total amount of downloads and the download info as a html string,
     * an empty string is returned when there is no download info
     */
    getDownloadInfoAsHtml(assets) {
        if (assets.length > 0) {
            let releaseDownloadCount = 0;
            let returnHtml = "<h4><span class='material-icons md-24'>get_app</span>&nbsp;&nbsp;" +
                "Download Info</h4><ul>";
            assets.forEach((asset) => {
                let assetSize = (asset.size / 1048576.0).toFixed(2); // 1048576.0 == 1 mega byte
                let lastUpdate = asset.updated_at.split("T")[0];
                returnHtml = returnHtml.concat("<li><code><a href='" + asset.browser_download_url + "' target='_self'>" +
                    asset.name + "</a></code> (" + assetSize + "&nbsp;MiB) " +
                    "- Downloaded " + asset.download_count + "&nbsp;times " +
                    "- Last updated on " + lastUpdate + "</li>");
                releaseDownloadCount += asset.download_count;
            });
            returnHtml = returnHtml.concat("</ul>");
            return [releaseDownloadCount, returnHtml];
        }
        return [0, ""];
    }
    /**
     * Sets all user repositories as suggestion in the repository field
     */
    setUserRepositories() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let username = (_a = document.getElementById("username")) === null || _a === void 0 ? void 0 : _a.value;
            let repositoryList = document.getElementById("repository-list");
            let response = yield fetch(this.apiRoot + "users/" + username + "/repos?page=1&per_page=100");
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
     * Calculate the amount of days between two dates
     * @param firstDate The first date
     * @param secondDate The second date
     * Returns the amount of days between two dates
     */
    CalculateDays(firstDate, secondDate) {
        let dayInMiliseconds = 24 * 60 * 60 * 1000; // Hours, Minutes, Seconds, Milliseconds
        // Reset the times to midnight
        firstDate.setHours(0, 0, 0, 0);
        secondDate.setHours(0, 0, 0, 0);
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / dayInMiliseconds));
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