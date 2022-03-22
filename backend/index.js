const { Client, MessageMedia, NoAuth, Buttons } = require('whatsapp-web.js');
const puppeteer = require('puppeteer-core')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const qrcode = require('qrcode-terminal');
const multer = require('multer')
const fs = require('fs')
const converter = require("convert-video-to-mp4");

async function convertVideoToMp4(video) {
    const pathFile = `../frontend/src/media/${video}`
    try {
        converter.convertVideoFileToMp4(pathFile);
        fs.unlinkSync(pathFile)
    } catch (error) {
        console.log(error)
    }
};

let titleItem;
console
const PORT = 3333

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const storageAudios = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/src/audios/');
    },
    filename: function (req, file, cb) {
        cb(null, `${rename()}-${file.originalname}`)
    }
});

const storageMedia = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../frontend/src/media/');
    },
    filename: function (req, file, cb) {
        cb(null, `${rename()}-${file.originalname}`)
    }
});
const uploadAudio = multer({ storage: storageAudios })
const uploadMedia = multer({ storage: storageMedia })

    ; (async function connection() {
        const browserURL = 'http://127.0.0.1:21222';

        const browser = await puppeteer.connect({
            browserURL,
            headless: true, //defaults to true 
            defaultViewport: null, //Defaults to an 800x600 viewport
            executablePath: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`, //'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            //by default puppeteer runs Chromium buddled with puppeteer 
            args: ['--start-maximized']
        });
        
        const client = new Client({
            puppeteer: {
                //browserWSEndpoint: browser.wsEndpoint(),
                executablePath: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
            }
            /*  puppeteer: await puppeteer.connect({
                 browserURL,
                 headless: true, 
                 devtools: true, 
                 args: ['--disable-web-security', '--disable-features=IsolateOrigins', ' --disable-site-isolation-trials'],
                 waitForInitialPage: true,
                 product: 'chrome',
                 ignoreHTTPSErrors: true,
                 //headless: true,
                 browserWSEndpoint: browser.wsEndpoint(),
                 executablePath: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
                 userDataDir: `C:\\Users\\Washington Luiz\\AppData\\Local\\Google\\Chrome\\User Data`,
 
             })*/
        });
        
        client.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });
    

        client.on('disconnected', (msg) => {
            console.log('disconnected')
        })


        client.on('ready', () => {
            console.log('ready')
        })

        app.post('/sendMessage', async (req, res) => {
            const { phoneNumber, message } = req.body;
        
            try {
                await client.sendMessage(phoneNumber, message)
                return res.status(200).json({ success: 'Message was send with success' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'Error trying send the message' })
            }
        })

        app.post('/sendAudio', async (req, res) => {
            try {
                const { name, chatId } = req.body
                const file = MessageMedia.fromFilePath(`../frontend/src/audios/${name}`);
                await client.sendMessage(chatId, file, { sendAudioAsVoice: true })
                return res.status(200).json({ success: 'Audio was send' })
            } catch (error) {
                return res.status(400).json({ error: 'Error trying send audio' })
            }
        })

        app.post('/groupId/', async (req, res) => {
            const { groupName } = req.body
        
            const groups = await client.getChats();
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].isGroup && groups[i].name === groupName) {
                    return res.json({ contactId: groups[i].id._serialized })
                }
            }
            return res.json({ error: `error` })
        })

        app.post('/saveAudio', uploadAudio.single('audio'), (req, res) => {
            try {
                const { title, name } = req.body
                titleItem += `-${name}`
                let audiosList = []
                const fileAudiosList = '../frontend/src/audios/audiosList.text'
                if (fs.existsSync(fileAudiosList)) {
                    let text = fs.readFileSync(fileAudiosList, 'utf-8')
                    if (text != '') {
                        let newText = JSON.parse(fs.readFileSync(fileAudiosList, 'utf-8'))
                        if (newText.length > 0) {
                            for (let i = 0; i < newText.length; i++) {
                                audiosList.push({
                                    title: newText[i].title,
                                    name: newText[i].name
                                })
                            }
                        }
                    }

                    audiosList.push({ title, name: titleItem })
                    fs.writeFileSync(fileAudiosList, '[]')
                    fs.writeFileSync(fileAudiosList, JSON.stringify(audiosList))

                } else {
                    audiosList.push({ title, name: titleItem })
                    fs.writeFileSync(fileAudiosList, JSON.stringify(audiosList))
                }

                return res.status(200).json({ success: 'Audio was save with success' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'Error trying save audio' })
            }
        })

        app.post('/saveMedia', uploadMedia.single('file'), async (req, res) => {

            try {
                let { name, type, title, file } = req.body;
                titleItem += `-${name}`
                if (type.split('/', 2)[0] === 'video' && type !== 'video/mp4') {
                    await convertVideoToMp4(titleItem)
                    type = 'video/mp4'
                    titleItem = `${titleItem.split('.', 2)[0]}.mp4`

                }
                let mediaList = []
                const fileMedia = '../frontend/src/media/mediaList.text'
                if (fs.existsSync(fileMedia)) {
                    let text = fs.readFileSync(fileMedia, 'utf-8')
                    if (text != '') {
                        let newText = JSON.parse(fs.readFileSync(fileMedia, 'utf-8'))
                        if (newText.length > 0) {
                            for (let i = 0; i < newText.length; i++) {
                                mediaList.push({
                                    title: newText[i].title,
                                    name: newText[i].name,
                                    type: newText[i].type
                                })
                            }
                        }
                    }

                    mediaList.push({ title, name: titleItem, type })
                    fs.writeFileSync(fileMedia, '[]')
                    fs.writeFileSync(fileMedia, JSON.stringify(mediaList))

                } else {
                    mediaList.push({ title, name: titleItem, type })
                    fs.writeFileSync(fileMedia, JSON.stringify(mediaList))
                }

                return res.status(200).json({ success: 'Media was save' })
            } catch (error) {
                return res.status(400).json({ error: 'Error trying save media' })
            }
        })

        app.post('/saveMessage', async (req, res) => {
            try {
                const { title, message } = req.body;
                let messages = []
                const fileMessage = '../frontend/src/message/messages.text'
                if (fs.existsSync(fileMessage)) {
                    let text = fs.readFileSync(fileMessage, 'utf-8')
                    if (text != '') {
                        let newText = JSON.parse(fs.readFileSync(fileMessage, 'utf-8'))
                        if (newText.length > 0) {
                            for (let i = 0; i < newText.length; i++) {
                                messages.push({
                                    title: newText[i].title,
                                    message: newText[i].message
                                })
                            }
                        }
                    }

                    messages.push({ title, message })
                    fs.writeFileSync(fileMessage, '[]')
                    fs.writeFileSync(fileMessage, JSON.stringify(messages))

                } else {
                    messages.push({ title, message })
                    fs.writeFileSync(fileMessage, JSON.stringify(messages))
                }
                return res.status(200).json({ success: 'Message saved with success' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'error', description: error })
            }
        })

        app.post('/sendMedia', async (req, res) => {
            try {
                const { chatId, file, type } = req.body

                if (type.split('/', 2)[0] === 'image' || type.split('/', 2)[0] === 'application') {
                    const base64 = fs.readFileSync(`../frontend/src/media/${file}`, { encoding: 'base64' }) //MessageMedia.fromFilePath(`../frontend/src/media/${file}`)
                    const fileMedia = new MessageMedia(type, base64, file)
                    await client.sendMessage(chatId, fileMedia)
                } else if (type.split('/', 2)[0] === 'video') {

                    const getFile = MessageMedia.fromFilePath(`../frontend/src/media/${file}`)

                    await client.sendMessage(chatId, getFile)
                } else {
                    const fileMessage = MessageMedia.fromFilePath(`../frontend/src/media/${file}`)
                    await client.sendMessage(chatId, fileMessage)
                }

                return res.status(200).json({ success: 'Success' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'Error' })
            }
        })

        app.delete('/removeMedia', (req, res) => {
            try {
                const { fileName, index } = req.body
                const pathFile = `../frontend/src/media/${fileName}`
                const list = `../frontend/src/media/mediaList.text`
                fs.unlinkSync(pathFile)
                const listFiles = JSON.parse(fs.readFileSync(list, 'utf-8'))
                const newListFiles = listFiles.filter((obj, i) => {
                    return i !== index
                })
                if(listFiles.length === 1){
                    fs.writeFileSync(list, '[]')
                }else {
                    fs.writeFileSync(list, JSON.stringify(newListFiles))
                }
                return res.status(200).json({ success: 'File removed' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'Error trying remove file' })
            }
        })

        app.delete('/removeAudio', (req, res) => {
            try {
                const { fileName, index } = req.body
                const pathFile = `../frontend/src/audios/${fileName}`
                const list = `../frontend/src/audios/audiosList.text`
                fs.unlinkSync(pathFile)
                const listFiles = JSON.parse(fs.readFileSync(list, 'utf-8'))
                const newListFiles = listFiles.filter((obj, i) => {
                    return i !== index
                })
                if(listFiles.length === 1){
                    fs.writeFileSync(list, '[]')
                }else {
                    fs.writeFileSync(list, JSON.stringify(newListFiles))
                }
                return res.status(200).json({ success: 'Audio removed' })
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: 'Error trying remove audio' })
            }
        })

        app.delete('/removeMessage', ( req, res ) => {
            try{
                const { index } = req.body;
                const list = `../frontend/src/message/messages.text`
                const listFiles = JSON.parse(fs.readFileSync(list, 'utf-8'))
                const newListFiles = listFiles.filter((obj, i) => {
                    return i !== index
                })
                if(listFiles.length === 1){
                    fs.writeFileSync(list, '[]')
                }else {
                    fs.writeFileSync(list, JSON.stringify(newListFiles))
                }
                return res.status(200).json({ success: 'Message removed' })
            }catch(error) {
                return res.status(400).json({ error: 'Error trying remove this message' })
            }
        })

        client.initialize()
    })()

function rename() {
    const date = new Date()
    titleItem = date.getTime()
    return date.getTime()
}

app.listen(PORT, () => {
    console.log('Running on port: ', PORT)
})