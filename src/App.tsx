import { useState } from "react";
import type { FormEvent } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
Amplify.configure(outputs);
const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});
function App() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult("");
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const rawIngredients = formData.get("ingredients")?.toString() || "";
      const ingredients = rawIngredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (ingredients.length === 0) {
        setError("Add at least one ingredient before generating.");
        return;
      }

      const { data, errors } = await amplifyClient.queries.askBedrock({
        ingredients,
      });

      if (errors?.length) {
        setError(errors.map((item) => item.message).join("\n"));
      } else if (data?.error) {
        setError(data.error);
      } else {
        setResult(data?.body || "No data returned");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`An error occurred: ${message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new 
recipe on
          demand...
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          <>
            {error && <p className="error-message">{error}</p>}
            {result && <p className="result">{result}</p>}
          </>
        )}
      </div>
    </div>
  );
}
export default App;
