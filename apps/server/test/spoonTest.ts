import { configDotenv } from "dotenv";
import { keyof, record } from "zod";
import * as spoonacular from "/Users/fontezbrooks/src/repos/spoonacular-api-clients/typescript";
import logger from "../src/lib/logger";

configDotenv({ path: ".env" });

const apiKey = process.env.api_key;

export type RecipesData = {
	includeNutrition: false;
	// string | A comma-separated list of tags that the random recipe(s) must adhere to. (optional)
	includeTags: "meat,dairy";
	// string | A comma-separated list of tags that the random recipe(s) must not adhere to. (optional)
	excludeTags: "vegetarian,gluten";
	// number | The maximum number of items to return (between 1 and 100). Defaults to 10. (optional)
	number: 10;
};

const configuration = spoonacular.createConfiguration({
	authMethods: {
		apiKeyScheme: apiKey,
	},
});
const apiInstance = new spoonacular.RecipesApi(configuration);

const body: RecipesData = {
	includeNutrition: false,
	includeTags: "meat,dairy",
	excludeTags: "vegetarian,gluten",
	number: 10,
};

apiInstance
	.getRandomRecipes(false, body.includeTags, body.excludeTags, body.number)
	.then((data: any) => {
		logger.log("API called successfully. Returned data: " + data);
	})
	.catch((error: any) => logger.error(error));
