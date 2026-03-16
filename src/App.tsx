import { AppProvider } from "./app/provider";
import { AppRoutes } from "./routes";

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
