let selected = ''
let getContact = {}
load()

async function load() {
    let count = 10;
    let interval = setInterval(async() => {
    if (!document.querySelector('._3uIPm.WYyr1')) {
        await chrome.storage.sync.set({'contactOpened': JSON.stringify('{}')})
        chrome.storage.sync.get('contactOpened', (obj) => {
            //console.log(JSON.parse(obj.contactOpened))

            count += 10
            console.log(count)
            if(count == 60) return clearInterval(interval)
        })
        } else {
            initApplication()
        }
    }, 10000)
}

function initApplication() {
    document.querySelector('._3uIPm.WYyr1').addEventListener('click', (event) => {
        if (document.querySelector('div[aria-selected="true"]')) {
            selected = document.querySelector('div[aria-selected="true"]').innerText
            document.querySelector('._21nHd > span[dir="auto"]').click()
            setTimeout(() => {
                getContact = {}
                let isGroup = document.querySelector('.AjtLy._1FXE6._1lF7t').outerText
                isGroup = isGroup.split(' ')
                if (isGroup[0] === 'Grupo' || isGroup[0] === 'Group') {
                    let groupName = ''
                    for(let i = 0; i < document.querySelector('._13NKt').childNodes.length; i++){
                        if(document.querySelector('._13NKt').childNodes[i].nodeName === 'IMG'){
                            groupName += document.querySelector('._13NKt').childNodes[i].attributes['alt'].value
                        }else if(document.querySelector('._13NKt').childNodes[i].nodeName === '#text'){
                            groupName += document.querySelector('._13NKt').childNodes[i].textContent
                        }
                    }
                    console.log(groupName)
                    getContact = {
                        contact: groupName,//document.querySelector('._13NKt').innerText,
                        isGroup: true
                    }
                    saveGroup(getContact)
                } else {
                    let phoneNumber = document.querySelector('.AjtLy._1FXE6._1lF7t')
                    .textContent.split('+').join('').split(' ')
                    .join('').split('-').join('')
                    let phoneId = `${phoneNumber}@c.us`
                    getContact = {
                        contact: phoneNumber,
                        isGroup: false,
                        contactId: phoneId
                    }
                    saveContact(getContact)
                }
            }, 2000)
            //document.querySelector('._1XkO3').removeAttribute('class', 'three')
            // document.querySelector('span[data-testid="x"]').click()
        }
    })
}
async function saveContact(data){
    await chrome.storage.sync.set({'contactOpened': JSON.stringify(data)})
}
async function saveGroup(data) {
    let contactId = await getGroupId(data.contact)
    let newData = {...data, ...contactId}
    console.log({newData})
    await chrome.storage.sync.set({'contactOpened': JSON.stringify(newData)})
    /* 
    chrome.storage.sync.get('contactOpened', async (obj) => {
        data = JSON.parse(obj.contactOpened)
        if (data.isGroup && data.groupId === undefined) {
            console.log('salvar')
           let groupId = await getGroupId(data.contact)
           let newData = {...data, ...groupId}
           await chrome.storage.sync.set({'contactOpened': JSON.stringify(newData)})
        }
        console.log(data)
    })*/
}

async function getGroupId(groupName) {
    const url = `http://localhost:3333/groupId/`
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupName: groupName })
    }
    const response = await fetch(url, requestOptions)
    const data = await response.json()
    console.log(data)
    return data
}