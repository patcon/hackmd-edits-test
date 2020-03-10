const axios = require('axios')
const WebSocket = require('ws')

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
        axios.get(`${nextBaseUrl}/socket.io/?noteId=${noteId}&EIO=3&transport=polling`, options)
          .then( (res) => {
            const wsData = JSON.parse(res.data.slice(4))
            const sid = wsData.sid
            const pingInterval = wsData.pingInterval
            console.log(sid)
            axios.get(`${nextBaseUrl}/socket.io/?noteId=${noteId}&EIO=3&transport=polling&sid=${sid}`, options)
              .then( (res) => {
                // Slice https from nextBaseUrl
                const ws = new WebSocket(`wss://${nextBaseUrl.slice(8)}/socket.io/?noteId=${noteId}&EIO=3&transport=websocket&sid=${sid}`, options)
                ws.on('open', function open() {
                  console.log('connected')
                  ws.send('2probe');
                });
                ws.on('close', function close() {
                  console.log('disconnected')
                })
                ws.on('message', function incoming(data) {
                  console.log(data);
                });
              })
          })
      })
  })
