const axios = require('axios')

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
        axios.get(`${nextBaseUrl}/socket.io/?noteId=${noteId}&EIO=3&transport=polling`, options)
          .then( (res) => {
            const sid = JSON.parse(res.data.slice(4)).sid
            console.log(sid)
            axios.get(`${nextBaseUrl}/socket.io/?noteId=${noteId}&EIO=3&transport=polling&sid=${sid}`, options)
              .then( (res) => {
                console.log(res)
              })
          })
        console.log(nextBaseUrl)
      })
  })
