from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
	return 'Hello, Guest! Welcome to JobStore Application'

if __name__ == '__main__':
	app.run(debug=True)