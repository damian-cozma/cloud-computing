import requests
from google.cloud import storage

BUCKET_NAME = "game-tracker-media-491805"


def upload_image_to_gcs(image_url, rawg_id):
    if not image_url or "storage.googleapis.com" in image_url:
        return image_url

    try:
        res = requests.get(image_url, timeout=5)
        if res.status_code != 200:
            return image_url

        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)

        blob = bucket.blob(f"covers/{rawg_id}.jpg")

        blob.upload_from_string(res.content, content_type="image/jpeg")

        return f"https://storage.googleapis.com/{BUCKET_NAME}/covers/{rawg_id}.jpg"
    except Exception as e:
        print(f"EROARE STORAGE: {e}")
        return image_url