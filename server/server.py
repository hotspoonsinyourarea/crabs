

import sqlite3
import threading
from dataclasses import dataclass

from flask import Flask, request, jsonify
from dataclasses_json import dataclass_json


app = Flask(__name__)
local_conn = threading.local()


def get_db():
    if not hasattr(local_conn, 'conn'):
        local_conn.conn = sqlite3.connect('logs.db')
    return local_conn.conn


@dataclass_json
@dataclass
class IncomingLog:
    id: str
    url: str
    date: str


@dataclass_json
@dataclass
class Log(IncomingLog):
    ip: str


def create_table():
    with get_db() as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS logs
                     (id TEXT, ip TEXT, url TEXT, date TEXT)''')
        conn.commit()


@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    incoming_log = IncomingLog.from_dict(data)
    log_data = Log(id=incoming_log.id, url=incoming_log.url, date=incoming_log.date, ip=request.remote_addr)

    with get_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO logs (id, ip, url, date) VALUES (?, ?, ?, ?)",
                 (log_data.id, log_data.ip, log_data.url, log_data.date))
        conn.commit()
        return jsonify({"message": "Log entry saved successfully"}), 201


if __name__ == '__main__':
    create_table()
    #app.run(debug=True)
    app.run(host='127.0.0.1', port=5000, debug=True)

