import http.server
import re
from urllib.parse import urlparse, parse_qs

from logic.games_service import *
from logic.reviews_service import *
from logic.analytics_service import *
from logic.sessions_service import *

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
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path
        query_params = parse_qs(parsed_url.query)

        # -------------- GET ALL GAMES --------------
        if re.fullmatch(r"/api/games/?", clean_path):
            games = get_all_games()
            self._send_json(games)
            return

        # -------------- GET GAME BY ID --------------
        elif match_game := re.fullmatch(r"/api/games/(?P<id>\d+)/?", clean_path):
            game_id = int(match_game.group("id"))
            game = get_game_by_id(game_id)

            if game:
                self._send_json(game)
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
            return

        # -------------- GET ALL REVIEWS --------------
        elif re.fullmatch(r"/api/games/reviews/?", clean_path):
            reviews = get_all_reviews()
            self._send_json(reviews)
            return

        # -------------- GET REVIEW BY GAME ID --------------
        elif match_review := re.fullmatch(r"/api/games/(?P<id>\d+)/review/?", clean_path):
            game_id = int(match_review.group("id"))
            game = get_game_by_id(game_id)

            if not game:
                self._send_json({"error": "Game Not Found"}, status=404)
                return

            review = get_review_for_game(game_id)

            if review:
                self._send_json(review, status=200)
            else:
                self._send_json({"message": "You haven't reviewed this game yet."}, status=404)
            return

        # -------------- GET LEADERBOARD --------------
        elif re.fullmatch(r"/api/leaderboard/?", clean_path):
            platform_val = query_params.get("platform", [None])[0]
            sort_val = query_params.get("sort", ["desc"])[0]

            leaderboard_data = get_leaderboard(platform_val, sort_val)

            if leaderboard_data:
                self._send_json(leaderboard_data, status=200)
            else:
                self._send_json({"error": "You haven't added games to your library or specified criteria doesn't match."}, status=404)
            return

        # -------------- GET STATISTICS --------------
        elif re.fullmatch(r"/api/statistics/?", clean_path):
            statistics_data = get_statistics()

            if statistics_data:
                self._send_json(statistics_data, status=200)
            else:
                self._send_json({"error": "No data available for statistics."}, status=404)
            return

        # -------------- GET SESSIONS FOR GAME ----------------
        elif match_sess := re.fullmatch(r"/api/games/(?P<id>\d+)/sessions/?", clean_path):
            game_id = int(match_sess.group("id"))
            sessions = get_sessions_for_game(game_id)

            if sessions:
                self._send_json(sessions, status=200)
            else:
                self._send_json({"error": "No sessions for this game"}, status=404)
            return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not found"}, status=404)
            return

    def do_POST(self):
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path

        # -------------- ADD A NEW GAME --------------
        if re.fullmatch(r"/api/games/?", clean_path):
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
            return

        # -------------- METHOD NOT ALLOWED --------------
        elif re.fullmatch(r"/api/games/(?P<id>\d+)/?", clean_path):
            self._send_json({"error": "Method Not Allowed"}, status=405)

        # -------------- ADD A NEW REVIEW --------------
        elif match_game := re.fullmatch(r"/api/games/(?P<id>\d+)/review/?", clean_path):
            game_id = int(match_game.group("id"))

            if not get_game_by_id(game_id):
                self._send_json({"error": "Game Not Found"}, status=404)
                return

            review_data = self._read_json()
            is_valid, error_message = validate_review_data(review_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            if is_duplicate_review(game_id):
                self._send_json({"error": "Review already exists for this game."}, status=409)
                return

            new_review = create_review(game_id, review_data)
            self._send_json(new_review, status=201)
            return

        # -------------- LOG A GAME SESSION --------------
        elif match_sess := re.fullmatch(r"/api/games/(?P<id>\d+)/sessions/?", clean_path):
            game_id = int(match_sess.group("id"))

            if not get_game_by_id(game_id):
                self._send_json({"error": "Game Not Found"}, status=404)
                return

            session_data = self._read_json()
            is_valid, error_message = validate_session_data(session_data)

            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            new_sess = create_session(game_id, session_data)
            self._send_json(new_sess, status=201)
            return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not found"}, status=404)
            return

    def do_PUT(self):
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path

        # -------------- UPDATE A GAME --------------
        if match_game := re.fullmatch(r"/api/games/(?P<id>\d+)/?", clean_path):
            game_id = int(match_game.group("id"))
            game_data = self._read_json()

            is_valid, error_message = validate_game_data(game_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            updated_game = update_game(game_id, game_data)

            if updated_game:
                self._send_json(updated_game, status=200)
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
            return

        # -------------- UPDATE A GAME REVIEW --------------
        elif match_review := re.fullmatch(r"/api/games/(?P<id>\d+)/review/?", clean_path):
            game_id = int(match_review.group("id"))

            if not get_game_by_id(game_id):
                self._send_json({"error": "Game Not Found"}, status=404)
                return

            review_data = self._read_json()
            is_valid, error_message = validate_review_data(review_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            updated_review = update_review(game_id, review_data)

            if updated_review:
                self._send_json(updated_review, status=200)
            else:
                self._send_json({"error": "Review not found for this game."}, status=404)
            return

        # -------------- UPDATE A GAME SESSION --------------
        elif match_sess := re.fullmatch(r"/api/sessions/(?P<id>\d+)/?", clean_path):
            sess_id = int(match_sess.group("id"))
            session_data = self._read_json()

            is_valid, error_message = validate_session_data(session_data)
            if not is_valid:
                self._send_json({"error": error_message}, status=400)
                return

            updated = update_session(sess_id, session_data)
            if updated:
                self._send_json(updated)
            else:
                self._send_json({"error": "Session Not Found"}, status=404)
            return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not Found"}, status=404)
            return

    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        clean_path = parsed_url.path

        # -------------- DELETE GAME BY ID --------------
        if match_game := re.fullmatch(r"/api/games/(?P<id>\d+)/?", clean_path):
            game_id = int(match_game.group("id"))
            is_deleted = delete_game(game_id)

            if is_deleted:
                self._send_json({"message": "Game Deleted Successfully"}, status=200)
            else:
                self._send_json({"error": "Game Not Found"}, status=404)
            return

        # -------------- DELETE REVIEW BY ID --------------
        elif match_review := re.fullmatch(r"/api/games/(?P<id>\d+)/review/?", clean_path):
            game_id = int(match_review.group("id"))

            if not get_game_by_id(game_id):
                self._send_json({"error": "Game Not Found"}, status=404)
                return

            is_deleted = delete_review(game_id)

            if is_deleted:
                self._send_json({"message": "Review Deleted Successfully"}, status=200)
            else:
                self._send_json({"error": "Review Not Found for this game"}, status=404)
            return

        # -------------- DELETE A GAME SESSION --------------
        elif match_sess := re.fullmatch(r"/api/sessions/(?P<id>\d+)/?", clean_path):
            if delete_session(int(match_sess.group("id"))):
                self._send_json({"message": "Session deleted"})
            else:
                self._send_json({"error": "Not Found"}, status=404)
            return

        # -------------- UNKNOWN ENDPOINT --------------
        else:
            self._send_json({"error": "Not Found"}, status=404)
            return

if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), CustomHandler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()