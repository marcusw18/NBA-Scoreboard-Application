
from flask import Flask, jsonify
from flask_cors import CORS
from nba_api.stats.endpoints import scoreboardv2
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/scoreboard/<date>', methods=['GET'])
def get_scoreboard(date):
    """
    Fetch NBA scoreboard for a specific date
    Date format: YYYY-MM-DD
    """
    try:
        # Convert date format from YYYY-MM-DD to MM/DD/YYYY for nba_api
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%m/%d/%Y')

        # Fetch scoreboard data
        scoreboard = scoreboardv2.ScoreboardV2(game_date=formatted_date)
        games = scoreboard.get_dict()

        # Extract relevant game information
        game_header = games['resultSets'][0]['rowSet']
        line_score = games['resultSets'][1]['rowSet']

        # Process the data
        processed_games = []
        for game in game_header:
            game_id = game[2]
            game_status = game[4]

            # Find corresponding team scores
            home_team = None
            away_team = None

            for score in line_score:
                if score[0] == game_id:
                    team_info = {
                        'team_id': score[1],
                        'team_abbreviation': score[2],
                        'team_name': score[4],
                        'pts': score[22]
                    }
                    if home_team is None:
                        away_team = team_info
                    else:
                        home_team = team_info

            processed_games.append({
                'game_id': game_id,
                'game_status': game_status,
                'home_team': home_team,
                'away_team': away_team,
                'game_time': game[6] if game[6] else 'Final'
            })

        return jsonify({
            'success': True,
            'date': date,
            'games': processed_games
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/scoreboard/today', methods=['GET'])
def get_today_scoreboard():
    """Fetch today's NBA scoreboard"""
    today = datetime.now().strftime('%Y-%m-%d')
    return get_scoreboard(today)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
