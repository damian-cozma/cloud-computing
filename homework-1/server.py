import http.server
import re

from logic.games_service import *

PORT = 9002

class CustomHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(bytes(json.dumps(data), "utf-8"))

    def _read_json(self):
        try:
            bytes_length = int(self.headers.get("Content-Length"))
            if bytes_length == 0:
                return None

            body_string = self.rfile.read(bytes_length).decode("utf-8")
            body_dict = json.loads(body_string)
            return body_dict
        except json.JSONDecodeError:
            return None

    def do_GET(self):
        # -------------- GET ALL GAMES --------------
        if re.fullmatch(r"/api/games/?", self.path):
            games = get_all_games()
            self._send_json(games)
            return

        # -------------- GET GAME BY ID --------------
        match_game = re.fullmatch(r"/api/games/(?P<id>\d+)/?", self.path)
        if match_game:
            game_id = int(match_game.group("id"))
            game = get_game_by_id(game_id)

            if game:
                self._send_json(game)
                return
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
                return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not found"}, status=404)
            return

    def do_POST(self):
        # -------------- ADD A NEW GAME --------------
        if re.fullmatch(r"/api/games/?", self.path):
            game_data = self._read_json()

            is_valid, error_message = validate_game_data(game_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            if is_duplicate_game(game_data["title"], game_data["platform"]):
                self._send_json({"error": "Game already exists on this platform."}, status=409)
                return

            new_game = create_game(game_data)
            self._send_json(new_game, status=201)

        # -------------- METHOD NOT ALLOWED --------------
        elif re.fullmatch(r"/api/games/(?P<id>\d+)/?", self.path):
            self._send_json({"error": "Method Not Allowed"}, status=405)

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not found"}, status=404)

    def do_PUT(self):
        # -------------- UPDATE A GAME --------------
        match_game = re.fullmatch(r"/api/games/(?P<id>\d+)/?", self.path)
        if match_game:
            game_id = int(match_game.group("id"))
            game_data = self._read_json()

            is_valid, error_message = validate_game_data(game_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            if is_duplicate_game(game_data["title"], game_data["platform"]):
                self._send_json({"error": "Game already exists on this platform."}, status=409)
                return

            updated_game = update_game(game_id, game_data)

            if updated_game:
                self._send_json(updated_game, status=200)
                return
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
                return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not Found"}, status=404)
            return

    def do_DELETE(self):
        # -------------- DELETE GAME BY ID --------------
        match_game = re.fullmatch(r"/api/games/(?P<id>\d+)/?", self.path)
        if match_game:
            game_id = int(match_game.group("id"))
            is_deleted = delete_game(game_id)

            if is_deleted:
                self._send_json({"message": "Game Deleted Successfully"}, status=200)
                return
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
                return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not Found"}, status=404)
            return

if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), CustomHandler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()