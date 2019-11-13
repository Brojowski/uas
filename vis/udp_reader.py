import socket
import requests
import json

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Bind the socket to the port
server_address = ('localhost', 64126)
print('starting up on %s port %s' % server_address)
sock.bind(server_address)

url = "http://localhost:5000/udp"
data = 'test'
headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

while True:
    data, address = sock.recvfrom(4096)

    if data != None:
        print(data)
        try:
            requests.get(url="http://localhost:5000/udp", data=data, timeout=0.0000000001)
        except requests.exceptions.ReadTimeout: 
            pass
