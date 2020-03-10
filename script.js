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
            // Seems that hackmd modified dictionary keys, as they all say "ping".
            const parser = require('engine.io-parser')
            console.log(parser.decodePacket(data))
          })
        })
      })
  })
