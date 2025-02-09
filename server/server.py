
from flask import Flask, request, jsonify
from sqlmodel import SQLModel, Field, create_engine, Session


app = Flask(__name__)
engine = create_engine('sqlite:///logs.db', echo=False)


class Log(SQLModel, table=True):
    id: str = Field(primary_key=True)
    ip: str
    url: str
    date: str

@app.route('/log', methods=['POST'])
def log():
    data = request.get_json()
    
    if not data or not request.remote_addr:
        return jsonify({"error": "invalid format"}), 400

    with Session(engine) as session:
        try:
            incoming_log = Log(
                id=data['id'],
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
    app.run(host='127.0.0.1', port=5000, debug=True)