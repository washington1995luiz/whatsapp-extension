
const selectSection = document.getElementsByClassName('buttonsShowTypeList')[0]
const btnPanelControl = document.getElementById('panelControl')
btnPanelControl.addEventListener('click', () => {
   chrome.tabs.create({ url: chrome.runtime.getURL('./src/panelControl.html') })//chrome.extension.getURL('./src/panelControl.html') })
})

let section = document.getElementsByClassName('content')
let buttonsShowTypeList = document.getElementsByClassName('buttonsShowTypeList')
section[0].children[0].setAttribute('class', 'active')
buttonsShowTypeList[0].children[0].setAttribute('class', 'linkActivate')
getMessages()
selectSection.addEventListener('click', (event) => {
    let link = event.target.hash.toString().split('#').join('')
    if (link === 'messagesList') {
        getMessages()
    }
    for (let i = 0; i < section[0].childElementCount; i++) {
        if (link === section[0].children[i].id) {
            section[0].children[i].setAttribute('class', 'active')
            buttonsShowTypeList[0].children[i].setAttribute('class', 'linkActivate')

        } else {
            section[0].children[i].removeAttribute('class', 'active')
            buttonsShowTypeList[0].children[i].removeAttribute('class', 'linkActivate')

        }
    }
})
async function getMessages() {
    let response = await fetch('./src/message/messages.text')
    let messages = await response.json()
    let messagesList = ''
    messagesList = document.getElementsByClassName('messagesList')[0].children[0]
    messagesList.innerHTML = ''
    for (let i = 0; i < messages.length; i++) {
        messagesList.innerHTML +=
            ` <li index="${i}" style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s; border-radius: 5px; border: 1px solid black; margin-bottom: 5px;">
            <div style="
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid;
            padding: 5px;
            border-radius: 5px;">
            <strong>${messages[i].title}</strong>
            <div style="display: flex; justify-content: space-around;">
            <button id="btnSendMessage${i}"><img src="./src/icons/right-arrow.png"></button>
            <button style="margin-left: 3px;" messageId="msg${i}" show="false" id="btnShowMessage${i}">
                            <img src="./src/icons/arrow-down.png">
                        </button>
            </div>
            </div>
            <div style="padding: 5px; display: none;" id="msg${i}">
                    <p id="messageToSend${i}">${messages[i].message}</p>
                </div>
        </li>`
    }
    for (let i = 0; i < messages.length; i++) {
        let btnShowMessage = document.getElementById(`btnShowMessage${i}`)
        btnShowMessage.addEventListener('click', (event) => {
            if (btnShowMessage.getAttribute('show') === 'false') {
                document.getElementById(`msg${i}`).style.display = 'block'
                btnShowMessage.setAttribute('show', 'true')
                btnShowMessage.children[0].setAttribute('src', './src/icons/arrow-up.png')
            } else {
                document.getElementById(`msg${i}`).style.display = 'none'
                btnShowMessage.setAttribute('show', 'false')
                btnShowMessage.children[0].setAttribute('src', './src/icons/arrow-down.png')
            }
        })

        document.getElementById(`btnSendMessage${i}`).addEventListener('click', (event) => {
            sendMessage(document.getElementById(`messageToSend${i}`).innerText)
        })
    }
}

; (async function getAudioList() {
    let response = await fetch('./src/audios/audiosList.text')
    let data = await response.json()
    let createList = document.getElementById('listarAudios')
    createList.innerHTML = ''
    console.log(data.length)
    for (let i = 0; i < data.length; i++) {
        createList.innerHTML +=

            ` <li index="${i}" style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s; border-radius: 5px; border: 1px solid black; margin-bottom: 5px;">
            <div style="
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid;
            padding: 5px;
            border-radius: 5px;">
            <strong>${data[i].title}</strong>
            <div style="display: flex; justify-content: space-around;">
            <button id="btnSendAudio${i}"><img src="./src/icons/right-arrow.png"></button>
            <audio id="audioTag${i}" src="./src/audios/${data[i].name}"></audio>
            <button style="margin-left: 3px;" playing="false" id="btnAudioPlay${i}" index="${i}">
                <img src="./src/icons/play.png">
            </button>
            </div>
        </li>`
    } for (let i = 0; i < data.length; i++) {
        document.getElementById(`btnSendAudio${i}`).addEventListener('click', (event) => {
            sendAudio(data[i].name)
        })
        document.getElementById(`btnAudioPlay${i}`).addEventListener('click', (event) => {
            let audio = document.getElementById(`audioTag${i}`)
            console.log(event)
            if (document.getElementById(`btnAudioPlay${i}`).getAttribute('playing') === 'false') {
                audio.play()
                document.getElementById(`btnAudioPlay${i}`).setAttribute('playing', 'true')
                document.getElementById(`btnAudioPlay${i}`).children[0].setAttribute('src', './src/icons/pause.png')

            } else {
                audio.pause()
                document.getElementById(`btnAudioPlay${i}`).children[0].setAttribute('src', './src/icons/play.png')
                document.getElementById(`btnAudioPlay${i}`).setAttribute('playing', 'false')

            }
        })
    }
    console.log({ data, response })
})()

function sendAudio(name) {
    console.log(name)
    document.querySelector('.content').setAttribute('class', 'content contentOpacity')
    document.querySelector('.load').setAttribute('style', 'display: absolute')
    chrome.storage.sync.get('contactOpened', async (obj) => {
        let chatId = JSON.parse(obj.contactOpened)
        console.log(chatId)
        const url = 'http://localhost:3333/sendAudio'
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, chatId: chatId.contactId })
        }
        const response = await fetch(url, requestOptions)
        const data = await response.json()
        document.querySelector('.content').setAttribute('class', 'content')
        document.querySelector('.load').setAttribute('style', 'display: none')


    })
}

let btnShowMessage = document.getElementsByClassName('btnShowMessage')
function getButtons() {
    for (let i = 0; i < btnShowMessage.length; i++) {
        btnShowMessage[i].addEventListener('click', (event) => {
            if (btnShowMessage[i].innerHTML === '+') {
                showMessage(event.target.attributes.messageId.value, true)
                btnShowMessage[i].innerHTML = 'x'
            } else {
                showMessage(event.target.attributes.messageId.value, false)
                btnShowMessage[i].innerHTML = '+'
            }
        })
    }

    for (let i = 0; i < sendMessageButton.length; i++) {
        let sendMessageButton = document.getElementsByClassName('btnsTitle')
        sendMessageButton[i].addEventListener('click', (event) => {
            if (event.target.id === 'sendMessageButton') {
                sendMessage(event.target.attributes.message.textContent)
            }
        })
    }
}


async function sendMessage(message) {
    chrome.storage.sync.get('contactOpened', async (obj) => {
        document.querySelector('.content').setAttribute('class', 'content contentOpacity')
        document.querySelector('.load').setAttribute('style', 'display: absolute')
        let phoneNumber = JSON.parse(obj.contactOpened)
        const url = 'http://localhost:3333/sendMessage';
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber: phoneNumber.contactId, message })
        }
        const response = await fetch(url, requestOptions)
        const data = await response.json()
        document.querySelector('.content').setAttribute('class', 'content')
        document.querySelector('.load').setAttribute('style', 'display: none')
        console.log(data)
    })
}

; (async function showMedia() {
    const response = await fetch('./src/media/mediaList.text')
    const data = await response.json()
    let createList = document.getElementById('showMediaList')
    createList.innerHTML = ''
    for (let i = 0; i < data.length; i++) {
        createList.innerHTML +=

            `<li style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s; border-radius: 5px; border: 1px solid black; margin-bottom: 5px;">
            <div style="
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid;
            padding: 5px;
            border-radius: 5px;">
            <strong>${data[i].title}</strong>
            <div style="display: flex; justify-content: space-around;">
            <button id="sendMedia${i}"><img src="./src/icons/right-arrow.png"></button>
            ${type({ type: data[i].type.split('/', 2)[0], name: data[i].name, id: i })}
        </li>
        `

    }
    function type({ type, name, id }) {
        const path = `./src/media/${name}`
        if (type === 'video') {
            return `
            <button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./src/icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <video width="75%" height="100" controls><source src="${path}"></video>
            </div>`
        } else if (type === 'image') {
            return `<button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./src/icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <img width="75%" height="100" src="${path}">
            </div>
            `
        } else if (type === 'application') {
            return `
            <button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./src/icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <span>${path}</span>
            </div>
            `
        } else if (type === 'audio') {
            return `
            <audio id="mediaAudio${id}" src="${path}"></audio>
            <button style="margin-left: 3px;" playing="false" id="btnMediaAudio${id}">
                <img src="./src/icons/play.png">
            </button>
            <button id="btnShowFile${id}" style="display: none"></button>
            </div>
            `
        }
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].type.split('/', 2)[0] === 'audio') {
            document.getElementById(`btnMediaAudio${i}`).addEventListener('click', (event) => {
                if (document.getElementById(`btnMediaAudio${i}`).getAttribute('playing') === 'false') {
                    document.getElementById(`mediaAudio${i}`).play()
                    document.getElementById(`btnMediaAudio${i}`).setAttribute('playing', 'true')
                    document.getElementById(`btnMediaAudio${i}`).children[0].setAttribute('src', './src/icons/pause.png')
                } else {
                    document.getElementById(`mediaAudio${i}`).pause()
                    document.getElementById(`btnMediaAudio${i}`).setAttribute('playing', 'false')
                    document.getElementById(`btnMediaAudio${i}`).children[0].setAttribute('src', './src/icons/play.png')

                }
            })
        }
        document.getElementById(`sendMedia${i}`).addEventListener('click', (event) => {
            sendMedia({ file: data[i].name, type: data[i].type })
        })

        document.getElementById(`btnShowFile${i}`).addEventListener('click', () => {
            if (document.getElementById(`viewFileContent${i}`).getAttribute('show') === 'false') {
                document.getElementById(`viewFileContent${i}`).style.display = 'flex'
                document.getElementById(`viewFileContent${i}`).setAttribute('show', 'true')
                document.getElementById(`btnShowFile${i}`).children[0].setAttribute('src', './src/icons/arrow-up.png')
            } else {
                document.getElementById(`viewFileContent${i}`).style.display = 'none'
                document.getElementById(`viewFileContent${i}`).setAttribute('show', 'false')
                document.getElementById(`btnShowFile${i}`).children[0].setAttribute('src', './src/icons/arrow-down.png')
            }
        })
    }
})()

function sendMedia({ file, type }) {
    console.log(file, type)
    chrome.storage.sync.get('contactOpened', async (obj) => {
        document.querySelector('.content').setAttribute('class', 'content contentOpacity')
        document.querySelector('.load').setAttribute('style', 'display: absolute')
        const storage = JSON.parse(obj.contactOpened)
        const chatId = storage.contactId
        const url = 'http://localhost:3333/sendMedia'
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chatId, file, type })
        }
        console.log(chatId, file, type)
        const response = await fetch(url, requestOptions)
        const data = await response.json()
        document.querySelector('.content').setAttribute('class', 'content')
        document.querySelector('.load').setAttribute('style', 'display: none')
        if(data.error) return alert('Error trying send the file.')
    })

}