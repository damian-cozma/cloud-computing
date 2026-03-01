import http.server
import json
import socketserver
from logic.games_service import read_games, read_game_by_id

PORT = 9002

class CustomHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(json.dumps(data), "utf-8"))

    def do_GET(self):
        game_id = None
        # -------------- GET ALL GAMES --------------
        if self.path == "/api/games":
            games = read_games()
            self._send_json(games)

        # -------------- GET GAME BY ID --------------
        elif self.path.startswith("/api/games/"):
            try:
                game_id = int(self.path.split("/")[3])
            except (IndexError, ValueError):
                self._send_json({"error": "Invalid game id"}, status=400)
                return

            game = read_game_by_id(game_id)
            if game is not None:
                self._send_json(game)
            else:
                self._send_json({"error": "game not found"}, status=404)

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not found"}, status=404)

with http.server.HTTPServer(("", PORT), CustomHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()