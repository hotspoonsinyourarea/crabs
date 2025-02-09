

USE_DEBUG_BOT = True


import os
import telebot
from flask import Flask, request, jsonify
from sqlmodel import SQLModel, Field, create_engine, Session


app = Flask(__name__)
engine = create_engine('sqlite:///logs.db', echo=False)

if USE_DEBUG_BOT:
    TG_TOKEN = os.environ['CRABS_TG_TOKEN']
    bot = telebot.TeleBot(token=TG_TOKEN)
else:
    TG_TOKEN = bot = None

class Log(SQLModel, table=True):
    log_id: int | None = Field(primary_key=True, default=None)
    user_id: str
    ip: str
    url: str
    date: str

class TGDebugUser(SQLModel, table=True):
    user_id: str = Field(primary_key=True)

def sendTgUserMessage(message: str, user: TGDebugUser):
    try:
        assert bot
        bot.send_message(
            chat_id=user.user_id,
            text=message
        )
    except:
        pass

def sendAllUsers(message: str):
    with Session(engine) as sess:
        for user in sess.query(TGDebugUser):
            sendTgUserMessage(message, user)

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    
    if USE_DEBUG_BOT:
        sendAllUsers(str(request.remote_addr) + '\n' + str(request.get_data()))

    if not data or not request.remote_addr:
        return jsonify({"error": "invalid format"}), 400

    with Session(engine) as session:
        try:
            incoming_log = Log(
                user_id=data['id'],
                url=data['url'],
                date=data['date'],
                ip=request.remote_addr
            )
            session.add(incoming_log)
            session.commit()
            
            return jsonify({"message": "Log entry saved successfully"}), 201
            
        except Exception as e:
            session.rollback()
            return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    SQLModel.metadata.create_all(engine)
    app.run(host='176.119.159.118', port=5000, debug=True)