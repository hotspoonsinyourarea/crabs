
import os
from time import sleep
import telebot
from sqlmodel import create_engine, Session, col, SQLModel
from server import TGDebugUser


engine = create_engine('sqlite:///logs.db', echo=False)
TG_TOKEN = os.environ['CRABS_TG_TOKEN']
bot = telebot.TeleBot(token=TG_TOKEN)


@bot.message_handler(func=lambda message: True)
def handler(message: telebot.types.Message):
    with Session(engine) as sess:
        new_user_id = str(message.chat.id)
        if sess.query(TGDebugUser).filter(col(TGDebugUser.user_id) == new_user_id).all():
            return
        else:
            sess.add(TGDebugUser(user_id=new_user_id))
            sess.commit()
            print(f'Добавлен user_id={new_user_id}')

if __name__ == '__main__':
    SQLModel.metadata.create_all(engine)
    print('Бот запущен')
    while True:
        try:
            bot.infinity_polling()
            break
        except:
            sleep(15)
            continue
