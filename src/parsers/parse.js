import { parseJSON, isJSON } from "./json.js";
import { parseYAML, isYAML } from "./yaml.js";

export default (filepath) => {
  if (isJSON(filepath)) {
    return parseJSON(filepath);
  } else if (isYAML(filepath)) {
    return parseYAML(filepath);
  }

  return null;
};
