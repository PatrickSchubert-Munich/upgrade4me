module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true, // Hinzugefügt falls Sie Frontend-Code haben
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module", // Wichtig für import/export Statements
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": [
      "error",
      "double",
      {
        allowTemplateLiterals: true,
      },
    ],
    "semi": ["warn", "always"], // Besser spezifiziert
    "indent": ["warn", 2], // Einrückungstiefe spezifiziert
    "object-curly-spacing": ["error", "always"], // Für Google Style
    "max-len": [
      "error",
      {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.spec.*", "**/*.test.*"], // Erweitert für Tests
      env: {
        mocha: true,
        jest: true, // Falls Sie Jest verwenden
      },
      rules: {
        "max-len": "off", // Längere Zeilen in Tests erlauben
        "no-unused-expressions": "off", // Für chai assertions
      },
    },
  ],
  globals: {
    // Hier können Sie globale Variablen definieren
    // Beispiel:
    // "firebase": "readonly"
  },
};
