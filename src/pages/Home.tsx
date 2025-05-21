import services from "@/services";
import React from "react";

export default function Home() {
  const getData = async () => {
    try {
      const response = await services.categoryServices.getAll({
        limit: 10,
        page: 1,
      });
      const data = response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
    </div>
  );
}
