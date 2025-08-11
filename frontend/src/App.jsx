import React from "react";
import Navigation from "./routes/Navigation";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Navigation />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
