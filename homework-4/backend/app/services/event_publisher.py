import os
import json
from azure.servicebus import ServiceBusClient, ServiceBusMessage
from dotenv import load_dotenv

load_dotenv()

CONNECTION_STR = os.getenv("SERVICE_BUS_CONNECTION_STRING")
QUEUE_NAME = os.getenv("SERVICE_BUS_QUEUE_NAME")


def publish_event(event_type: str, payload: dict):
    if not CONNECTION_STR or not QUEUE_NAME:
        print("Service Bus not configured, skipping event.")
        return

    try:
        with ServiceBusClient.from_connection_string(CONNECTION_STR) as client:
            sender = client.get_queue_sender(queue_name=QUEUE_NAME)

            message_body = {
                "event_type": event_type,
                "payload": payload
            }

            with sender:
                sender.send_messages(
                    ServiceBusMessage(json.dumps(message_body))
                )

        print(f"Event sent: {event_type}")

    except Exception as e:
        print(f"Failed to send event: {e}")