import socketio

sio = socketio.Client()

@sio.on('dataPoint')
def dataPoint(data):
    print(data['time'])


sio.connect('http://localhost:5000')