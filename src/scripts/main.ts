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
        (document.getElementById("repository") as HTMLInputElement)?.addEventListener("keyup", this.validateUserInput);

        // Setup search event handler
        (document.getElementById("get-stats-button") as HTMLButtonElement)?.addEventListener("click", event => this.onGetStatsButtonClicked(event));

        // Setup page view
        let username: string = this.getQueryVariable("username");
        let repository: string = this.getQueryVariable("repository");
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
     * Gets the value of a query variable
     * @param variableName Name of the query variable to get
     */
    private getQueryVariable(variableName: string): string{
        let query: string = window.location.search.substring(1);
        let variables: string[] = query.split("&");

        for(var i = 0; i < variables.length; i++) {
            let pair: string[] = variables[i].split("=");

            if(pair[0] == variableName) {
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
    private setQueryVariable(variableNames: string[], variableValues: string[]): void {
        if(variableNames.length != variableValues.length) {
            return;
        }
        
        let query: string = window.location.search.substring(1);

        for(let i = 0; i < variableNames.length; i++) {
            if(query.length <= 0) {
                query = query.concat("?");
            }
            else {
                query = query.concat("&");
            }

            query = query.concat(variableNames[i] + "=" + variableValues[i]);
        }
        window.location.href = query;
    }

    /**
     * Invoked when the Get Stats Button is clicked and  gets all information of a repository
     */
    private onGetStatsButtonClicked(eventArgs: Event): void{
        let username: string = (document.getElementById("username") as HTMLInputElement)?.value;
        let repository: string = (document.getElementById("repository") as HTMLInputElement)?.value;

        if(username != null && repository != null) {
            this.setQueryVariable(["username", "repository"],[username, repository]);
        }
    }
}

/**
 * Creates the entrypoint of the Main class
 */
let main =  new Main();