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
        this.validateInput();

        (document.getElementById("username") as HTMLInputElement)?.addEventListener("keyup", this.validateInput);
        (document.getElementById("repository") as HTMLInputElement)?.addEventListener("keyup", this.validateInput);;
    }

    /**
     * Validates the user input
     * If the user input is valid the get-stats-button will be enabled, if not it will be disabled
     */
    public validateInput(): void {
        let username = (document.getElementById("username") as HTMLInputElement)?.value;
        let repository = (document.getElementById("repository") as HTMLInputElement)?.value;
        let getStatsButton = (document.getElementById("get-stats-button") as HTMLButtonElement);

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
}

/**
 * Creates the entrypoint of the Main class
 */
let main =  new Main();