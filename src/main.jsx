import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "dayjs/locale/de";
import App from "./App.jsx";
import "./index.css";
import "./lib/dayjs";

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#1f4f46",
		},
		secondary: {
			main: "#a34c35",
		},
		background: {
			default: "#ebe8e1",
			paper: "#fffdf8",
		},
	},
	shape: {
		borderRadius: 10,
	},
	typography: {
		fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
		h3: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
	},
	components: {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: { root: { fontWeight: 800, textTransform: "none" } },
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</StrictMode>,
);
