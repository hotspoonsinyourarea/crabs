FLASK_SERVER_URL="http://localhost:5000/log"

curl -X POST -H "Content-Type: application/json" -d @test_data1.json $FLASK_SERVER_URL
curl -X POST -H "Content-Type: application/json" -d @test_data2.json $FLASK_SERVER_URL
curl -X POST -H "Content-Type: application/json" -d @test_data3.json $FLASK_SERVER_URL