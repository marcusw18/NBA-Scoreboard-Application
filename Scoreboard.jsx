
import React, { useState, useEffect } from 'react';
import './Scoreboard.css';

const Scoreboard = () => {
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScoreboard();
  }, [selectedDate]);

  const fetchScoreboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/scoreboard/${selectedDate}`
      );
      const data = await response.json();

      if (data.success) {
        setGames(data.games);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch scoreboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getGameStatus = (game) => {
    const status = game.game_status;
    if (status === 3) return 'Final';
    if (status === 2) return 'Live';
    return game.game_time;
  };

  return (
    <div className="scoreboard-container">
      <header className="scoreboard-header">
        <h1>NBA Scoreboard</h1>
        <div className="date-selector">
          <label htmlFor="date">Select Date: </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </header>

      {loading && <div className="loading">Loading games...</div>}

      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && games.length === 0 && (
        <div className="no-games">No games scheduled for this date</div>
      )}

      <div className="games-container">
        {games.map((game) => (
          <div key={game.game_id} className="game-card">
            <div className="game-status">
              {getGameStatus(game)}
            </div>

            <div className="team away-team">
              <div className="team-abbr">{game.away_team?.team_abbreviation}</div>
              <div className="team-name">{game.away_team?.team_name}</div>
              <div className="team-score">{game.away_team?.pts || '-'}</div>
            </div>

            <div className="vs-divider">@</div>

            <div className="team home-team">
              <div className="team-abbr">{game.home_team?.team_abbreviation}</div>
              <div className="team-name">{game.home_team?.team_name}</div>
              <div className="team-score">{game.home_team?.pts || '-'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;
