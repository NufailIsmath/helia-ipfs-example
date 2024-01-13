const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer()

app.use(express.json())

let hashMap = new Map();




const createNode = async () => {
    const { createHelia } = await
        import('helia');
    const { unixfs } = await
        import('@helia/unixfs')
    const helia = await createHelia();
    const fs = unixfs(helia);
    return fs;
}

const run = async () => {


    const fs = await createNode();
    app.post('/upload', upload.single('file'), async (req, res) => {

        const data = req.file.buffer;
        const cid = await fs.addBytes(data);
        hashMap.set(req.file.originalname, cid);
        res.status(200).send({ message: "File uploaded successfully: ", cid })
    })

    app.get('/fetch', async (req, res) => {
        const cid = req.query.cid;
        console.log(cid);
        console.log(hashMap);

        let text;
        const decoder = new TextDecoder();
        for await (const chunks of fs.cat(cid)) {
            text = decoder.decode(chunks, { stream: true })
        }

        console.log(text);
        res.status(200).send(text)
    });

    app.listen(3000, () => {
        console.log("Listening on port 3000");
    })
}

run()