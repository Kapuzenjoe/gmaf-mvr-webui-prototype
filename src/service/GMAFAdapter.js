import config from "../config/config";

class GMAFAdapter {

    basePath = `${config.baseUrl}/`;
    getCollectionPath = "gmaf/getCollection/";
    queryPath1 = "gmaf/"
    apiToken = "";
    static GMAFInstance = false;

    constructor(apiToken = "") {
        this.apiToken = apiToken;
    }

    static async getInstance() {
        if (!this.GMAFInstance) {
            try {
                var gmaf = new GMAFAdapter();
                var token = await gmaf.getToken(config.appKey);

                if (typeof (token) !== "string" || token === "") {

                    throw new Error("The Token received was not a string or empty, Token: " + token);
                }

            } catch (error) {
                console.error("GMAF was not instanciated: " + error);
                return false;
            }
            gmaf.setToken(token);
            this.GMAFInstance = gmaf;
        }

        return this.GMAFInstance;
    }

    setToken(token = "") {
        this.apiToken = token;
    }

    async getToken(password = "") {
        return await this.get("gmaf/getToken/" + password, "", true);
    }

    async processAllAssets(updateStatus) {
        const results = await this.getCollectionIds(false);

        const collectionIds = results.allresults;
        console.log("CollectionIds: ", collectionIds);
        if (typeof collectionIds === 'object') {

            //Filter
            const cmmcocollectionIds = [];
            for (let index = 0; index < collectionIds.length; index++) {
                const collectionId = collectionIds[index];
                //if has No origin cmmco == cmmco else tcmmco
                if (!collectionId.cmmco) {
                    const cmmcocollectionId = collectionIds[index].id;
                    cmmcocollectionIds.push(cmmcocollectionId);
                }

            }

            updateStatus(0, cmmcocollectionIds.length);

            for (let index = 0; index < cmmcocollectionIds.length; index++) {
                let collectionId = cmmcocollectionIds[index];

                const processResult = await this.processAssetById(collectionId);

                updateStatus(index + 1, cmmcocollectionIds.length);
            }
        }
    }


    async processAssetById(itemid = "") {

        return await this.post("gmaf/processAssetById/" + this.apiToken + "/" + itemid, "json");
    }

    async getQueryIds(query = {}) {
        const keywords = query?.cmmcoQuery?.md?.keywords || "";

        return this.post("gmaf/query/" + this.apiToken + "/" + keywords, "json");
    }

    async query(query = {}, updateStatus) {
        //First get QueryIds
        const result = await this.getQueryIds(query);
        console.log("IDS Result: ", result);
        if (!result) {
            console.log("No response received from Query");
            return { "results": [] };
        }

        if (result.size == 0) {
            console.log("No results received from Query");
            return { "results": [] };
        }

        const queryIds = result;

        updateStatus(0, queryIds.length);
        const queryResults = [];
        if (typeof queryIds === 'object') {
            for (let index = 0; index < queryIds.length; index++) {
                const cmmco = await this.getCMMCO(queryIds[index]);
                queryResults.push(cmmco);
                updateStatus(index + 1, queryIds.length);
            }
        }


        return { "results": queryResults };
    }

    async getPage(page = 1, resultsPerPage = 8, updateStatus) {

        //First get QueryIds
        const result = await this.post(`gmaf/getPage/${this.apiToken}/${page}/${resultsPerPage}/`, "json");

        if (!result.results) {
            console.log("No results received from Query");
            return;
        }

        const queryIds = result.results;

        updateStatus(0, queryIds.length);
        const queryResults = [];
        if (typeof queryIds === 'object') {
            for (let index = 0; index < queryIds.length; index++) {
                const cmmco = await this.getCMMCO(queryIds[index]);
                queryResults.push(cmmco);
                updateStatus(index + 1, queryIds.length);
            }
        }

        return { "results": queryResults, "page": result.currentPage, "numberOfPages": result.totalPages, "numOfAllResults": result.allresults.length };

    }

    async getCollectionPage(page = 1, resultsPerPage = 8, updateStatus) {

        //First get QueryIds
        const result = await this.post(`gmaf/getCollectionPage/${this.apiToken}/${page}/${resultsPerPage}/`, "json");

        if (!result.results) {
            console.log("No results received from Query");
            return;
        }

        const queryIds = result.results;

        updateStatus(0, queryIds.length);
        const queryResults = [];
        if (typeof queryIds === 'object') {
            for (let index = 0; index < queryIds.length; index++) {
                const cmmco = await this.getCMMCO(queryIds[index]);
                queryResults.push(cmmco.data);
                updateStatus(index + 1, queryIds.length);
            }
        }

        return { "results": queryResults, "page": result.currentPage, "numberOfPages": result.totalPages };

    }


    async getCMMCO(queryId) {

        if (!queryId) {
            console.log("No queryId received from getCMMCO");
        }

        if (queryId) {
            const collectionElement = await this.post(`gmaf/getmmfg/${this.apiToken}/${queryId}`, "json");
            return collectionElement;
        }
    }


    async getCollection(updateStatus) {
        const result = await this.getCollectionIds(false);
        if (!result.results) {
            console.log("No results received from Query");
            return;
        }
        console.log("CollectionIds: ", result.results);
        const queryIds = result.results;
        updateStatus(0, queryIds.length);
        const queryResults = [];
        if (typeof queryIds === 'object') {

            for (let index = 0; index < queryIds.length; index++) {

                const cmmco = await this.getCMMCO(queryIds[index]);
                queryResults.push(cmmco);
                updateStatus(index + 1, queryIds.length);
            }
        }

        return { "results": queryResults };

    }

    async getCollectionIds(withtcmmcos = false) {
        return await this.post(`gmaf/get-collection-ids/${this.apiToken}/${withtcmmcos}`, "json");
    }

    async addItemToCollection(filename = "", base64file = "", inputoverwrite = false) {

        return await this.post("gmaf/addItem/" + this.apiToken, false, { name: filename, file: base64file, overwrite: inputoverwrite });
    }

    async deleteItemFromCollection(itemid = "") {

        return await this.post(`gmaf/deleteItem/${this.apiToken}/${itemid}`);
    }

    async get(path = "", type = "", initial = false) {
        if (!this.apiToken && !initial) {
            throw new Error("GMAF Token not set");
        }
        try {

            const response = await fetch(this.basePath + path);

            if (type === "blob") {
                return await response.blob();
            }

            if (type === "json") {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            if (error.message === "Failed to fetch") {
                // alert("GMAF Service not reachable")
                console.error("GMAF Service not reachable");
            }
            console.error(error);
        }

    }

    async post(path = "", jsonResponse = false, body = {}) {
        if (!this.apiToken) {
            throw new Error("GMAF Token not set");
        }
        try {
            const response = await fetch(this.basePath + path, {
                method: 'POST',
                headers: {},
                body: JSON.stringify(body)
            }
            );

            // Check if response was successful based on status code
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            if (jsonResponse) {
                var result = await response.json();
            }

            return await result;

        } catch (error) {

            if (error.message === "Failed to fetch") {
                console.error("GMAF Service not reachable");
            }
            console.error(error);
        }
    }

}

export default GMAFAdapter;