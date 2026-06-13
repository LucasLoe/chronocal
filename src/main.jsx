import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import "dayjs/locale/de";
import App from "./App.jsx";
import "./index.css";
import "./lib/dayjs";

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#111342",
		},
		secondary: {
			main: "#2373cf",
		},
		background: {
			default: "#e6e6e6",
			paper: "#ffffff",
		},
	},
	shape: {
		borderRadius: 14,
	},
	typography: {
		fontFamily: '"Manrope", "Inter", "Segoe UI", sans-serif',
		h3: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ThemeProvider>
	</StrictMode>,
);
