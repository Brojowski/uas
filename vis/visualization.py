import socket
import sys
import json
import matplotlib.pyplot as plt

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Bind the socket to the port
server_address = ('localhost', 64126)
print('starting up on %s port %s' % server_address)
sock.bind(server_address)

temp = []
time = []
plt.ion()
while True:
    data, address = sock.recvfrom(4096)

    if data != None:
        sample = json.JSONDecoder().decode(data.decode('ascii'))

        if len(temp) > 1:
            temp.pop(0)
            time.pop(0)

        time.append(sample['time'])
        temp.append(sample['temp'])

        plt.plot(time, temp)
        plt.draw()
        plt.pause(0.05)

plt.show()


        

