import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Provider } from "./theme/provider.js";
import "./assets/scss/main.scss"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ChakraProvider value={defaultSystem}>
            <App />
        </ChakraProvider>
    </StrictMode>
);
