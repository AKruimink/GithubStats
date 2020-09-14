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
        let repositoryData: Response = await fetch(repositoryUrl);
        

        let error: boolean = false;
        let errorMessage: string = "";

        if(repositoryData.status == 404) {
            error = true;
            errorMessage = "This account or project does not exist!";
        }
        
        if(repositoryData.status == 403) {
            error = true;
            errorMessage = "You've exeeded Github's rate limit. <br/> Please try again later."
        }

        let html: string = "";

        if(error) {
            html += "<div class='alert alert-danger'>" + errorMessage + "</div>";
        }
        else {
            // Do other stuff
        }

        let result: HTMLDivElement = document.getElementById("stats-result") as HTMLDivElement;
        result.innerHTML = html;

        //let releaseData: Response = await fetch(repositoryUrl + "/releases") ;
        // let html: string = "<div class='col-md-6 col-md-offset-3 alert alert-danger output'>Printed Error</div>";
        // 
        // result.innerHTML = html;
    }

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