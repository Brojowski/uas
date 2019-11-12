import socketio
import json
import socket
from aiohttp import web

sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

@sio.event
def connect(sid, enviorn):
    print('connect', sid)

async def handle(req):
    print(await req.json())
    await sio.emit('dataPoint', await req.json())
    return web.Response(text='ok')

app.add_routes([web.get('/udp', handle)])

if __name__ == '__main__':
    web.run_app(app, port=5000)