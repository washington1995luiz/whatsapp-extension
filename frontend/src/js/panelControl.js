const btnCreateMessage = document.getElementById('createMessage')
const importAudio = document.getElementById('importAudio')
const importMedia = document.getElementById('importMedia')

//teste

const btnTeste = document.getElementById('importAudio')

btnTeste.addEventListener('click', async (event) => {
    document.querySelector('.container').setAttribute('class', 'container contentOpacity')
    document.querySelector('.load').setAttribute('style', 'display: flex')

    let title = document.getElementById('audioTitle')
    if (title.value === '') {
        alert('Campo titulo não pode ficar vazio')
        event.stopPropagation()
        return
    }
    let audio = document.getElementById('audio').files[0]
    let formData = new FormData()
    formData.append('audio', audio)
    formData.append('title', title.value)
    formData.append('name', audio.name)

    let url = 'http://localhost:3333/saveAudio'
    let requestOptions = {
        method: 'POST',
        body: formData
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json()
    document.querySelector('.container').setAttribute('class', 'container')
    document.querySelector('.load').setAttribute('style', 'display: none')
    if (data.success){ 
        document.getElementById('audioTitle').value = ''
        document.getElementById('audio').value = ''
        getAudioList()
    }
    if (data.error) return alert(data.error)
})
//fim do teste

importMedia.addEventListener('click', async (event) => {

    const media = document.querySelector('#media').files[0]
    let title = document.getElementById('mediaTitle')
    if (title.value === '') {
        alert('Campo titulo não pode ficar vazio')
        event.stopPropagation()
        return
    }
    let type = media.type.split('/', 2)
    if (type[0] === 'video' && type[1] !== 'mp4') {
        document.getElementsByClassName('load')[0].children[0].innerHTML = 'Converting video to mp4 and saving'
    } else {
        document.getElementsByClassName('load')[0].children[0].innerHTML = type[0] == 'application' ? 'Saving file' : `Saving ${type[0]}`
    }
    document.querySelector('.container').setAttribute('class', 'container contentOpacity')
    document.querySelector('.load').setAttribute('style', 'display: flex')
    const formData = new FormData()
    formData.append('file', media)
    formData.append('title', title.value)
    formData.append('name', media.name)
    formData.append('type', media.type)

    const url = 'http://localhost:3333/saveMedia'
    const requestOptions = {
        method: 'POST',
        body: formData
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json()

    document.querySelector('.container').setAttribute('class', 'container')
    document.querySelector('.load').setAttribute('style', 'display: none')
    if (data.success) {
        document.querySelector('#media').value = ''
        document.getElementById('mediaTitle').value = ''
        showMedia()
    }   
    if (data.error) return alert(data.error)

})


btnCreateMessage.addEventListener('click', () => saveMessage())
async function saveMessage() {
    let title = document.getElementById('titleMessage').value
    let message = document.getElementById('message').value
    document.getElementsByClassName('load')[0].children[0].innerHTML = 'Saving message'
    document.querySelector('.container').setAttribute('class', 'container contentOpacity')
    document.querySelector('.load').setAttribute('style', 'display: flex')
    const url = 'http://localhost:3333/saveMessage/'
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title, message
        })
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json()

    document.querySelector('.container').setAttribute('class', 'container')
    document.querySelector('.load').setAttribute('style', 'display: none')
    if (data.success) {
        document.getElementById('titleMessage').value = ''
        document.getElementById('message').value = ''
        readMessagesSaved()
    } else {
        console.log(data.description)
        alert(data.error)
    }
}
showMedia()
async function showMedia() {
    const response = await fetch('./media/mediaList.text')
    const data = await response.json()
    let createList = document.getElementById('showMediaList')
    createList.innerHTML = ''
    for (let i = 0; i < data.length; i++) {
        createList.innerHTML += `
        <li style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s; border-radius: 5px; border: 1px solid black; margin-bottom: 5px;">
            <div style="
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid;
            padding: 5px;
            border-radius: 5px;">
            <strong>${data[i].title}</strong>
            <div style="display: flex; justify-content: space-around;">
            <button id="btnRemoveMedia${i}">Delete</button>
            ${type({ type: data[i].type.split('/', 2)[0], name: data[i].name, id: i })}
            
        </li>
        `
    }
    function type({ type, name, id }) {
        if (type === 'video') {
            return `
            <button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <video width="75%" height="100" controls><source src="./media/${name}"></video>
            </div>`
        } else if (type === 'image') {
            return `<button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <img width="75%" height="100" src="./media/${name}">
            </div>
            `
        } else if (type === 'application') {
            return `
            <button style="margin-left: 3px;" id="btnShowFile${id}"><img src="./icons/arrow-down.png"></button>
            </div>
            </div>
            <div id="viewFileContent${id}" show="false" style="display: none; justify-content: center;">
            <span>${name}</span>
            </div>
            `
        } else if (type === 'audio') {
            return `
            <audio id="mediaAudio${id}" src="./media/${name}"></audio>
            <button style="margin-left: 3px;" playing="false" id="btnMediaAudio${id}">
                <img src="./icons/play.png">
            </button>
            <button id="btnShowFile${id}" style="display: none"></button>
            `
        }
    }

    for (let i = 0; i < data.length; i++) {
        document.getElementById(`btnShowFile${i}`).addEventListener('click', () => {
            if(document.getElementById(`viewFileContent${i}`).getAttribute('show') === 'false'){
                document.getElementById(`viewFileContent${i}`).style.display = 'flex'
                document.getElementById(`viewFileContent${i}`).setAttribute('show', 'true')
                document.getElementById(`btnShowFile${i}`).children[0].setAttribute('src', './icons/arrow-up.png')
            }else {
                document.getElementById(`viewFileContent${i}`).style.display = 'none'
                document.getElementById(`viewFileContent${i}`).setAttribute('show', 'false')
                document.getElementById(`btnShowFile${i}`).children[0].setAttribute('src', './icons/arrow-down.png')
            }
        })
        document.getElementById(`btnRemoveMedia${i}`).addEventListener('click', () => {
            removeMedia({ fileName: data[i].name, index: i })
        })

        if (data[i].type.split('/', 2)[0] === 'audio') {
            document.getElementById(`btnMediaAudio${i}`).addEventListener('click', (event) => {
                if (document.getElementById(`btnMediaAudio${i}`).getAttribute('playing') === 'false') {
                    document.getElementById(`mediaAudio${i}`).play()
                    document.getElementById(`btnMediaAudio${i}`).setAttribute('playing', 'true')
                    document.getElementById(`btnMediaAudio${i}`).children[0].setAttribute('src', './icons/pause.png')
                } else {
                    document.getElementById(`mediaAudio${i}`).pause()
                    document.getElementById(`btnMediaAudio${i}`).setAttribute('playing', 'false')
                    document.getElementById(`btnMediaAudio${i}`).children[0].setAttribute('src', './icons/play.png')

                }
            })
        }
    }
}
async function removeMedia({ fileName, index }) {
    const url = 'http://localhost:3333/removeMedia/'
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName, index
        })
    }
    let response = await fetch(url, requestOptions)
    let data = await response.json()
    if (data.error) return alert('Error trying remove file')
    if (data.success) {
        showMedia()
        alert('File removed with success')
    }

}

getAudioList()
async function getAudioList() {
    let response = await fetch('./audios/audiosList.text')
    let data = await response.json()
    let createList = document.getElementById('audiosList')
    createList.innerHTML = ''
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
            <button id="removeAudio${i}">Delete</button>
            <audio id="audioTag${i}" src="./audios/${data[i].name}"></audio>
            <button style="margin-left: 3px;" playing="false" id="btnAudioPlay${i}" index="${i}">
                <img src="./icons/play.png">
            </button>
            </div>
        </li>`
    }
    for (let i = 0; i < data.length; i++) {
        let btnAudioPlay = document.getElementById(`btnAudioPlay${i}`)
        btnAudioPlay.addEventListener('click', (event) => {
            let audio = document.getElementById(`audioTag${i}`)
            console.log(event)
            if (document.getElementById(`btnAudioPlay${i}`).getAttribute('playing') === 'false') {
                audio.play()
                document.getElementById(`btnAudioPlay${i}`).setAttribute('playing', 'true')
                document.getElementById(`btnAudioPlay${i}`).children[0].setAttribute('src', './icons/pause.png')

            } else {
                audio.pause()
                document.getElementById(`btnAudioPlay${i}`).children[0].setAttribute('src', './icons/play.png')
                document.getElementById(`btnAudioPlay${i}`).setAttribute('playing', 'false')

            }
        })
        document.getElementById(`removeAudio${i}`).addEventListener('click', () => {
            removeAudio({ index: i, fileName: data[i].name })
        })
    }
}

async function removeAudio({ index, fileName }){
    const url = 'http://localhost:3333/removeAudio'
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ index, fileName })
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json();
    if(data.success) {
        getAudioList()
    } 
    if(data.error) return alert(data.error)
}

readMessagesSaved()
async function readMessagesSaved() {
    let response = await fetch('./message/messages.text')
    let messages = await response.json()
    const messagesList = document.getElementById('messagesList')
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
            <button id="removeMessage${i}">Delete</button>
            <button style="margin-left: 3px;" messageId="msg${i}" show="false" id="btnShowMessage${i}">
                            <img src="./icons/arrow-down.png">
                        </button>
            </div>
            </div>
            <div id="msg${i}" style="display: none;">
                    <p>${messages[i].message}</p>
                </div>
        </li>`
    }

    for (let i = 0; i < messages.length; i++) {
       let btnShowMessage = document.getElementById(`btnShowMessage${i}`)
       btnShowMessage.addEventListener('click', (event) => {
            if (btnShowMessage.getAttribute('show') === 'false') {
                document.getElementById(`msg${i}`).style.display = 'block'
                btnShowMessage.setAttribute('show', 'true')
                btnShowMessage.children[0].setAttribute('src', './icons/arrow-up.png')
            } else {
                document.getElementById(`msg${i}`).style.display = 'none'
                btnShowMessage.setAttribute('show', 'false')
                btnShowMessage.children[0].setAttribute('src', './icons/arrow-down.png')
            }
        })
        document.getElementById(`removeMessage${i}`).addEventListener('click', () => {
            removeMessage({ index: i })
        })
    }
}


async function removeMessage({ index }) {
    const url = 'http://localhost:3333/removeMessage'
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({index})
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json();
    if(data.success){
        readMessagesSaved()
    }
    if(data.error) return alert(data.error)
}