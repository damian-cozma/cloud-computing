import { useEffect, useState } from "react";

function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/api/games")
      .then((response) => response.json())
      .then((data) => setGames(data))
      .catch((error) => console.error("Error fetching games:", error));
  }, []);

  return (
    <div>
      <h1>Games</h1>

      {games.map((game) => (
        <div key={game.id}>
          <h3>{game.title}</h3>
          <p>Platform: {game.platform}</p>
          <p>Progress: {game.progress}</p>
        </div>
      ))}
    </div>
  );
}

export default App;