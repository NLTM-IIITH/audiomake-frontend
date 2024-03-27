import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";

const renderIndex = () => {
  // Your index.js content here
  window.disableReactStrictModeWarnings = true;
  ReactDOM.render(
    <ChakraProvider>
      <App />
    </ChakraProvider>,
    document.getElementById("root")
  );
};

renderIndex();
