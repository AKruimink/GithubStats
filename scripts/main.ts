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
     * 
     */
    public async getStats(): Promise<void> {
        let repositoryUrl: string = this.apiRoot + "repos/" + 
                                    (document.getElementById("username") as HTMLInputElement)?.value + "/" + 
                                    (document.getElementById("repository") as HTMLInputElement)?.value
        let repositoryResponse: Response = await fetch(repositoryUrl);
        
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

            let releaseResponse: Response = await fetch(repositoryUrl + "/releases");
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
                let releaseClassNames: string = "release";
                if(isLatestRelease) {
                    releaseClassNames = releaseClassNames.concat(" latest-release");
                    isLatestRelease = false;
                }
                else if(release.prerelease) {
                    releaseClassNames = releaseClassNames.concat(" pre-release");
                }

                html = html.concat("<div class='output'>"
                                    + "<div class='row " + releaseClassNames + "'>");
                html = html.concat(releaseLabelHtml);
                html = html.concat(releaseInfoHtml);
                html = html.concat(downloadInfoHtml);
                html = html.concat("</div></div>");
            });

            // get the project stats (should be added  before the release html = project stats + html)
        }

        let result: HTMLDivElement = document.getElementById("stats-result") as HTMLDivElement;
        result.innerHTML = html;
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

        let returnHtml: string = "<h3><span class='material-icons md-24'>local_offer</span>&nbsp;&nbsp;"
                                    + "<a href='" + release.html_url + "' target='_blank'>" + release.tag_name + "</a>"
                                    + releaseBadge + "</h3>";
        returnHtml = returnHtml.concat("<hr class='release-hr'>");
        return returnHtml;
    }

    /**
     * Gets the release info of a release as a HTML element
     * @param release Release used to create the release info element
     * @param downloadCount Amount of downloads the release has
     */
    private getReleaseInfoAsHtml(release: any, downloadCount: number = 0): string {
        let returnHtml: string = "<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;"
                                    + "Release Info</h4><ul>";

        if(release.author != null) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;" 
                                            + "Author: <a href='" + release.author.html_url + "'>@" + release.author.login + "</a></li>");
        }
       
        if(downloadCount > 0) {
            returnHtml = returnHtml.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;"
                                             + "Downloads: " + downloadCount + "</li>");
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
            let returnHtml: string = "<h4><span class='material-icons md-24'>get_app</span>&nbsp;&nbsp;" 
                                        + "Download Info</h4><ul>";

            assets.forEach((asset) => {
                let assetSize: string = (asset.size / 1048576.0).toFixed(2); // 1048576.0 == 1 mega byte
                let lastUpdate: Date = asset.updated_at.split("T")[0];

                returnHtml = returnHtml.concat("<li><code>" + asset.name + "</code> (" + assetSize + "&nbsp;MiB) " 
                                                + "- Downloaded " + asset.download_count + "&nbsp;times "
                                                + "- Last updated on " + lastUpdate + "</li>");
                releaseDownloadCount += asset.download_count;
            });

            returnHtml = returnHtml.concat("</ul>");
            return [releaseDownloadCount, returnHtml];
        }
        return [0, ""];
    }

    // /**
    //  * 
    //  * @param watchers 
    //  * @param starsgazers 
    //  * @param forks 
    //  * @param totalDownloads 
    //  */
    // private getProjectStatsAsHtml(watchers: number, starsgazers: number, forks: number, totalDownloads: number): string {
    //     let returnHtml: string = "<div id='project-stats'>";
    //     returnHtml = returnHtml.concat("<h4><span class='material-icons md-18'>visibility</span>&nbsp;&nbsp;" 
    //                                     + "Watchers: " + watchers + "" )
    // }

    //     // Get project stats
            //     let projectStats: string = "";
            //     projectStats = projectStats.concat("<div id='project-stats'>");
            //     projectStats = projectStats.concat("<h4><span class='material-icons md-18'>visibility</span>&nbsp;&nbsp;");
            //     projectStats = projectStats.concat("Watchers: " + watchers + "&nbsp;&nbsp;&nbsp;");

            //     projectStats = projectStats.concat("<span class='material-icons md-18'>star_border</span>&nbsp;&nbsp;")
            //     projectStats = projectStats.concat("Startgazers: " + startgazers + "&nbsp;&nbsp;&nbsp;");

            //     projectStats = projectStats.concat("<span class='material-icons md-18'>call_split</span>&nbsp;&nbsp;")
            //     projectStats = projectStats.concat("Forks: " + forks + "&nbsp;&nbsp;");

            //     projectStats = projectStats.concat("<span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;")
            //     projectStats = projectStats.concat("Downloads: " + totalDownloadCount);

            //     projectStats = projectStats.concat("</div></h4>")
            
            // let repositoryData: any[] = await repositoryResponse.json();
            // let watchers: number = repositoryData["subscribers_count"];
            // let startgazers: number = repositoryData["stargazers_count"];
            // let forks: number = repositoryData["forks_count"];

            // let releaseResponse: Response = await fetch(repositoryUrl + "/releases");
            // let releaseData: any[] = await releaseResponse.json();

            // let isLatestRelease: boolean = true;
            // let totalDownloadCount: number = 0;

            // releaseData.forEach((element) => {
            //     let releaseTag: string = element.tag_name;
            //     let releaseBadge: string = "";
            //     let releaseClassNames: string = "release";
            //     let releaseUrl: string = element.html_url;
            //     let isPreRelease: boolean = element.prerelease;
            //     let releaseAssets: any[] = element.assets;
            //     let releaseDownloadCount: number = 0;
            //     let releaseAuthor: any = element.author;
            //     let releaseDate: Date = element.published_at.split("T")[0];

            //     if(isPreRelease) {
            //         releaseBadge = "&nbsp;&nbsp;<span class='badge'>Pre-release</span>"
            //         releaseClassNames = releaseClassNames.concat(" pre-release");
            //     }
            //     else if(isLatestRelease) {
            //         releaseBadge = "&nbsp;&nbsp;<span class='badge'>latest release</span>"
            //         releaseClassNames = releaseClassNames.concat(" latest-release");
            //         isLatestRelease = false;
            //     }
                
            //     // get version info
            //     let versionInfo: string = "";
            //     versionInfo = versionInfo.concat("<h3><span class='material-icons md-24'>local_offer</span>&nbsp;&nbsp;"
            //                                    + "<a href='" + releaseUrl + "' target='_blank'>" + releaseTag + "</a>"
            //                                    + releaseBadge + "</h3>");
            //     versionInfo = versionInfo.concat("<hr class='release-hr'>");

            //     // get release info
            //     let releaseInfo: string = "";
            //     releaseInfo = releaseInfo.concat("<h4><span class='material-icons md-24'>info</span>&nbsp;&nbsp;"
            //                                    + "Release Info</h4>");
            //     releaseInfo = releaseInfo.concat("<ul>");

            //     if(releaseAuthor != null) {
            //         releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>person</span>&nbsp;&nbsp;"
            //                                        + "Author: <a href='" + releaseAuthor.html_url + "'>@" + releaseAuthor.login + "</a></li>");
            //     }

            //     if(releaseDownloadCount > 0) {
            //         releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>get_app</span>&nbsp;&nbsp;"
            //                                        + "Downloads: " + releaseDownloadCount + "</li>");
            //     }

            //     releaseInfo = releaseInfo.concat("<li><span class='material-icons md-18'>calendar_today</span>&nbsp;&nbsp;"
            //                                    + "Published: " + releaseDate + "</li>");
               
            //     releaseInfo = releaseInfo.concat("</ul>");

            //     // Setup inner html
            //     html = html.concat("<div class='output'>");
            //     html = html.concat("<div class='row " + releaseClassNames + "'>");
            //     html = html.concat(versionInfo);
            //     html = html.concat(releaseInfo);
            //     html = html.concat(downloadInfoHtml);
            //     html = html.concat("</div> </div>");
            // });

            

            //     // Add to the main html object
            //     html = projectStats.concat(html);
    //     }

    //     let result: HTMLDivElement = document.getElementById("stats-result") as HTMLDivElement;
    //     result.innerHTML = html;
    // }

    /**
     * Sets all user repositories as suggestion in the repository field
     */
    private async setUserRepositories(): Promise<void> {
        let username: string = (document.getElementById("username") as HTMLInputElement)?.value;
        let repositoryList: HTMLDataListElement = document.getElementById("repository-list") as HTMLDataListElement;
        let response: Response = await fetch(this.apiRoot + "users/" + username + "/repos");

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