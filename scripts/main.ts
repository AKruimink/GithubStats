/**
 * Defines a class that handles everything related to the main page
 */
class Main {
    /**
     * Root address to the github api
     */
    private readonly apiRoot: string = "https://api.github.com/";

    /**
     * Intializes a new instance of Main
     */
    constructor() {
        this.validateUserInput();

        // Setup form event handlers
        (document.getElementById("username") as HTMLInputElement)?.addEventListener("keyup", this.validateUserInput);
        (document.getElementById("username") as HTMLInputElement)?.addEventListener("change", this.setUserRepositories.bind(this));
        (document.getElementById("username") as HTMLInputElement)?.addEventListener("keyup", (e: KeyboardEvent) => {
            if(e.keyCode == 13) {
                this.onEnterPressed();
            }
        });
        (document.getElementById("repository") as HTMLInputElement)?.addEventListener("keyup", this.validateUserInput);
        (document.getElementById("repository") as HTMLInputElement)?.addEventListener("input", this.validateUserInput);
        (document.getElementById("repository") as HTMLInputElement)?.addEventListener("keyup", (e: KeyboardEvent) => {
            if(e.keyCode == 13) {
                this.onEnterPressed();
            }
        });

        // Setup search event handler
        (document.getElementById("get-stats-button") as HTMLButtonElement)?.addEventListener("click", event => this.onGetStatsButtonClicked(event));

        // Setup page view
        let username: string = this.getQueryParameter("username");
        let repository: string = this.getQueryParameter("repository");
        
        if(username != "" && repository != "") {
            (document.getElementById("username") as HTMLInputElement)?.setAttribute("value", username);
            (document.getElementById("repository") as HTMLInputElement)?.setAttribute("value", repository);
            this.validateUserInput();
            this.setUserRepositories();
            this.getStats();
        }
        else {
            (document.getElementById("username") as HTMLInputElement)?.focus();
        }
    }

    /**
     * Validates the user input
     * If the user input is valid the get-stats-button will be enabled, if not it will be disabled
     */
    public validateUserInput(): void {
        let username: string = (document.getElementById("username") as HTMLInputElement)?.value;
        let repository: string = (document.getElementById("repository") as HTMLInputElement)?.value;
        let getStatsButton: HTMLButtonElement = (document.getElementById("get-stats-button") as HTMLButtonElement);

        if(getStatsButton != null)
        {
            if(username != null && repository != null) {
                if(username.length > 0 && repository.length > 0) {
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
    public getQueryParameter(parameterName: string): string{
        let query: string = window.location.search.substring(1);
        let variables: string[] = query.split("&");

        for(var i = 0; i < variables.length; i++) {
            let pair: string[] = variables[i].split("=");

            if(pair[0] == parameterName) {
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
    private setQueryParameters(parameterNames: string[], parameterValues: string[]): void {
        if(parameterNames.length != parameterValues.length) {
            return;
        }

        let newQuery: string = "";

        for(let i = 0; i < parameterNames.length; i++) {
            if(newQuery.length <= 0) {
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
    public async getStats(): Promise<void> {
        let repositoryUrl: string = this.apiRoot + "repos/" + 
                                    (document.getElementById("username") as HTMLInputElement)?.value + "/" + 
                                    (document.getElementById("repository") as HTMLInputElement)?.value;
        let repositoryResponse: Response = await fetch(repositoryUrl + "?page=1&per_page=100");
        
        let error: boolean = false;
        let errorMessage: string = "";

        if(repositoryResponse.status == 404) {
            error = true;
            errorMessage = "This account or project does not exist!";
        }
        
        if(repositoryResponse.status == 403) {
            error = true;
            errorMessage = "You've exeeded Github's rate limit. <br/> Please try again later."
        }

        let html: string = "";

        if(error) {
            html = html.concat("<div class='alert alert-danger output'>" + errorMessage + "</div>");
        }
        else {   
            let repositoryData: any[] = await repositoryResponse.json();
            let isLatestRelease: boolean = true;
            let totalDownloads: number = 0;

            let releaseResponse: Response = await fetch(repositoryUrl + "/releases?page=1&per_page=100");
            let releaseData: any[] = await releaseResponse.json();

            // get the information of each release
            releaseData.forEach((release) => {

                // get the download information
                let downloadInfoHtml: string = "";
                let downloadHtmlResult: any[] = this.getDownloadInfoAsHtml(release.assets);

                downloadInfoHtml = downloadInfoHtml.concat(downloadHtmlResult[1]);
                totalDownloads += downloadHtmlResult[0];

                // get the release label
                let releaseLabelHtml: string = this.getReleasesLabelAsHtml(release, isLatestRelease);

                // get the release info
                let releaseInfoHtml: string = this.getReleaseInfoAsHtml(release, downloadHtmlResult[0]);

                // add the release to the html
                let releaseClassNames: string = "node";
                if(isLatestRelease) {
                    releaseClassNames = releaseClassNames.concat(" latest-release");
                    isLatestRelease = false;
                }
                else if(release.prerelease) {
                    releaseClassNames = releaseClassNames.concat(" pre-release");
                }

                html = html.concat("<div class='row " + releaseClassNames + "'>");
                html = html.concat(releaseLabelHtml);
                html = html.concat(releaseInfoHtml);
                html = html.concat(downloadInfoHtml);
                html = html.concat("</div>");
            });

            // get the project stats
            let repositoryInfoHtml: string =  "<div class='row node repository'>";
            repositoryInfoHtml = repositoryInfoHtml.concat(this.getRepositoryInfoAsHtml(repositoryData));
            repositoryInfoHtml = repositoryInfoHtml.concat(this.getRepositoryStatsAsHtml(repositoryData, totalDownloads));
            repositoryInfoHtml = repositoryInfoHtml.concat("</div>");

            // Set all the stats informaton
            html = repositoryInfoHtml.concat(html);
        }

        let result: HTMLDivElement = document.getElementById("stats-result") as HTMLDivElement;
        result.innerHTML = html;
    }

    /**
     * Gets the info of a given repository as an HTML element
     * @param repository Repository used to create the info element with
     * Returns a string containing the repository info as an HTML element
     */
    private getRepositoryInfoAsHtml(repository: any): string {
        let returnHtml: string = "<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;" +
                                    "Repository Info</h4><ul>";
        
        if(repository.owner != null) {
           returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" +
                                            "Owner: <a href='" + repository.owner.url + "'>@" + repository.owner.login + "</a></li>");
        }

        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" +
                                        "Repository: <a href='" + repository.url + "'>@" + repository.name + "</a></li>");
        
        if(repository.description != null) {
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
    private getRepositoryStatsAsHtml(repository: any, totalDownloads: number): string {
        let returnHtml: string = "<h4><span class='material-icons md-24'>leaderboard</span>&nbsp;&nbsp;" + 
                                    "Repository Stats</h4><ul>";
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>visibility</span>&nbsp;&nbsp;" + 
                                        "Watchers: " + repository.subscribers_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>star_border</span>&nbsp;&nbsp;" + 
                                        "Stargazers: " + repository.stargazers_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>call_split</span>&nbsp;&nbsp;" +
                                        "Forks: " + repository.forks_count + "</li>");
        returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;" + 
                                        "Total Downloads: " + totalDownloads +"</li></ul>");

        return returnHtml;
    }

    /**
     * Gets a label of a release as a HTML element
     * @param release Release used to create the label with
     * @param isLatestRelease Indication if the release being made is the latest release
     * Returns the release label as a html string
     */
    private getReleasesLabelAsHtml(release: any, isLatestRelease: boolean = false): string {
        let releaseBadge: string = "";
        
        if(isLatestRelease) {
            releaseBadge = "&nbsp;&nbsp;<span class='badge'>Latest-release</span>";
        }
        else if(release.prerelease) {
            releaseBadge = "&nbsp;&nbsp;<span class='badge'>Pre-release</span>";
        }

        let returnHtml: string = "<h3><span class='material-icons md-24'>local_offer</span>&nbsp;&nbsp;" + 
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
    private getReleaseInfoAsHtml(release: any, downloadCount: number = 0): string {
        let returnHtml: string = "<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;" + 
                                    "Release Info</h4><ul>";

        if(release.author != null) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" + 
                                            "Author: <a href='" + release.author.html_url + "'>@" + release.author.login + "</a></li>");
        }
       
        if(downloadCount > 0) {
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
    private getDownloadInfoAsHtml(assets: any[]): any[] {
        if(assets.length > 0) {
            let releaseDownloadCount: number = 0;
            let returnHtml: string = "<h4><span class='material-icons md-24'>get_app</span>&nbsp;&nbsp;" +
                                        "Download Info</h4><ul>";

            assets.forEach((asset) => {
                let assetSize: string = (asset.size / 1048576.0).toFixed(2); // 1048576.0 == 1 mega byte
                let lastUpdate: Date = asset.updated_at.split("T")[0];

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
    private async setUserRepositories(): Promise<void> {
        let username: string = (document.getElementById("username") as HTMLInputElement)?.value;
        let repositoryList: HTMLDataListElement = document.getElementById("repository-list") as HTMLDataListElement;
        let response: Response = await fetch(this.apiRoot + "users/" + username + "/repos?page=1&per_page=100");

        if(response.ok == true) {
            let data: any[] = await response.json();

            repositoryList.innerHTML = "";
            data.forEach((element: { name: string; }) => {
               let option: HTMLOptionElement = document.createElement('option');
               option.value = element.name;
               repositoryList.appendChild(option);
            });
        }
    }

    /**
     * Calculate the amount of days between two dates
     * @param firstDate The first date
     * @param secondDate The second date
     * Returns the amount of days between two dates
     */
    private CalculateDays(firstDate: Date, secondDate: Date): number {
        let dayInMiliseconds: number = 24 * 60 * 60 * 1000; // Hours, Minutes, Seconds, Milliseconds

        // Reset the times to midnight
        firstDate.setHours(0, 0, 0, 0);
        secondDate.setHours(0, 0, 0, 0);

        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / dayInMiliseconds));
    }

    /**
     * Invoked when the Get Stats Button is clicked and  gets all information of a repository
     */
    private onGetStatsButtonClicked(eventArgs: Event): void{
        let username: string = (document.getElementById("username") as HTMLInputElement)?.value;
        let repository: string = (document.getElementById("repository") as HTMLInputElement)?.value;

        if(username != null && repository != null) {
            this.setQueryParameters(["username", "repository"],[username, repository]);
        }
    }

    /**
     * Invoked when the enter key is pressed and sets the focus to the next item
     */
    private onEnterPressed(): void {
        let username: HTMLInputElement = (document.getElementById("username") as HTMLInputElement);
        let repository: HTMLInputElement = (document.getElementById("repository") as HTMLInputElement);

        if(!username?.value) {
            username?.focus();
        }
        else if(!repository?.value) {
            repository?.focus();
        }
        else {
            (document.getElementById("get-stats-button") as HTMLButtonElement)?.click();
        }
    }
}

/**
 * Creates the entrypoint of the Main class
 */
let main =  new Main();