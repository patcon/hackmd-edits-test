const axios = require('axios')
const WebSocket = require('ws')
const io = require('socket.io-client')
const eio = require('engine.io-client')

const noteId = '23ELFLijTiSDjoZ1VPwvBQ'
const noteUrl = `https://hackmd.io/${noteId}`

axios.get(noteUrl)
  .then( (res) => {
    const authCookie = res.headers['set-cookie'][2]
    const cookieString = authCookie.split(';')[0]
    console.log(cookieString)
    const options = {headers: {Cookie: cookieString}}
    axios.get(`https://hackmd.io/realtime-reg/realtime?noteId=${noteId}`, options)
      .then( (res) => {
        const nextBaseUrl = res.data.url
        console.log(nextBaseUrl)
        // Couldn't get socket.io client working, just raw engine.io
        const socket = eio(nextBaseUrl, {
          path: '/realtime-4/socket.io/',
          query: { noteId: noteId },
          transportOptions: {
            polling: {
              extraHeaders: {
                Cookie: cookieString,
              },
            },
          },
          timeout: 5000,
          reconnectionAttempts: 20,
        })
        socket.on('open', () => {
          socket.on('message', (data) => {
            var parser = require('socket.io-parser')
            const decoder = new parser.Decoder()
            decoder.on('decoded', (decodedPacket) => {
              console.log(decodedPacket)
              if (decodedPacket.data) {
                console.log(decodedPacket.data[0])
                if (decodedPacket.data[0] == "doc") {
                  var encoder = new parser.Encoder()
                  // Construct a packet for deleting the whole doc
                  packet = {
                    type: 2,
                    data: ['operation', 0, [-decodedPacket.data[1].str.length], {"ranges": [{"anchor": 0, "head": 0}]}]
                  }
                  encoder.encode(packet, function(encodedPacket) {
                    socket.send(encodedPacket)
                    const newTemplate = 'dasdadadasda\n\nasdasdadas'
                    // Contruct packet with template override
                    packet = {
                      type: 2,
                      data: ['operation', 1, [newTemplate], {"ranges": [{"anchor": 0, "head": 0}]}]
                    }
                    encoder.encode(packet, function(encodedPacket) {
                      socket.send(encodedPacket)
                    })
                  })
                } else {
                  console.log(decodedPacket.data[1])
                }
              }
            })
            decoder.add(data)
          })
        })
      })
  })
