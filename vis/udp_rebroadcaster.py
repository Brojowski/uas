import socketio
import json
import socket
from aiohttp import web

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

b4Window = list()
WAIT_TIME = 2 * 60 # 2 samples per second for 1 minute

@sio.event
def connect(sid, enviorn):
    print('connect', sid)

async def handle(req):
    dataPt = await req.json()

    if len(b4Window) > 1 and dataPt['time'] > b4Window[-1][0]:
        b4Window.clear()

    b4Window.append( (dataPt['time'], dataPt['temp']) )
    if len(b4Window) > WAIT_TIME:
        pt = b4Window.pop(0)
        dataPt['windowStartTime'] = pt[0]
        dataPt['windowStartTemp'] = pt[1]
    else:
        dataPt['windowStartTemp'] = 0
        dataPt['windowStartTime'] = 0

    await sio.emit('dataPoint', dataPt)
    return web.Response(text='ok')

app.add_routes([web.get('/udp', handle)])

if __name__ == '__main__':
    web.run_app(app, port=5000)