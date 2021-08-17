const fs = require("fs");
const csv = require("csvtojson");
const texturepackerify = require("texturepackerify");
const audiosprite = require('audiosprite');
const filesHelper = require("texturepackerify/src/utils/files-helper");
const {trace, COLOR} = require("texturepackerify/src/utils/log");

const INPUT_PATH = "res/";
const HASH_PATH = "res/";

const getHash = files => {
    return new Promise((resolve, reject) => {
        filesHelper.getHash(Array.isArray(files) ? files : [files], resolve);
    });
};
const loadHash = url => {
    return new Promise((resolve, reject) => {
        filesHelper.loadHash(url, resolve);
    });
};

const saveHash = (url, hash) => {
    return new Promise((resolve, reject) => {
        filesHelper.saveHash(url, hash, resolve);
    });
};

const isForce = () => {
    return process.argv.indexOf("-f") !== -1;
};

const noOutput = (file) => {
    return !fs.existsSync(file);
};

const saveOutput = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, data, resolve);
    });
};

const mergeHash = (path, from, to) => {
    const out = Object.assign({}, to);
    let match = true;
    for (let key in from) {
        if (to[key] === undefined || to[key] !== from[key]) {
            match = false;
            out[key] = from[key];
        }
    }
    for (let key in to) {
        if (key.indexOf(path) !== -1 && from[key] === undefined) {
            out[key] = undefined;
            match = false;
        }
    }
    if (!match) {
        return out;
    }
};

const getFiles = path => {
    if (fs.existsSync(path)) {
        return fs.readdirSync(path).filter(file => !fs.lstatSync(path + "/" + file).isDirectory());
    } else {
        return [];
    }
};

const packAtlases = () => {
    return new Promise((resolve, reject) => {
        texturepackerify.pack({
            url: INPUT_PATH + "atlases/",
            hashUrl: INPUT_PATH,
            force: false,
            scales: [1, 0.5],
            defaultAtlasConfig: {
                spriteExtensions: true,
                animations: true
            }
        }, () => {
            resolve();
        });
    });
};

const createAudioSprites = (files, config) => {
    return new Promise((resolve, reject) => {
        audiosprite(files, config, (err, data) => {
            if (err) {reject;}
            data.src = data.src.map(src => src.substring(src.lastIndexOf("/") + 1));
            resolve(data);
        });
    });
};

const packSounds = async () => {
    const path = INPUT_PATH + "sounds/";
    const src = path + "src/";
    const loopSrc = src + "loop/";
    const outFile = path + "sounds.json";

    const loopFiles = getFiles(loopSrc);
    const files = [
        ...getFiles(src).map(file => src + file),
        ...loopFiles.map(file => loopSrc + file)
    ];

    const newFilesHash = await getHash(files);
    const oldHash = await loadHash(HASH_PATH);

    const mergedHash = mergeHash(path, newFilesHash, oldHash);

    if (isForce() || noOutput(outFile) || mergedHash) {
        trace("Pack", outFile, COLOR.BLUE);
        const audiospriteData = await createAudioSprites(files, {output: path + "sounds", format: "howler2", export: "ogg,mp3", loop: loopFiles.join(",")});
        await saveOutput(outFile, JSON.stringify(audiospriteData, null, 4));
    }
    if (mergedHash) {
        await saveHash(HASH_PATH, mergedHash);
    }
};

const buildLocales = async () => {
    const src = INPUT_PATH + "i18n/";
    const outFile = src + "locales.json";
    const newFile = src + "locales.csv";
    const newFilesHash = await getHash(newFile);

    const oldHash = await loadHash(HASH_PATH);
    const mergedHash = mergeHash(src, newFilesHash, oldHash);

    if (isForce() || noOutput(outFile) || mergedHash) {
        trace("Pack", outFile, COLOR.YELLOW);
        const locales = await csv().fromFile(newFile);
        await saveOutput(outFile, JSON.stringify(locales));
    }
    if (mergedHash) {
        await saveHash(HASH_PATH, mergedHash);
    }
};

const updateHash = async (dir) => {
    const src = INPUT_PATH + dir + "/";
    const files = filesHelper.getFilesRecursive(src);
    const newFilesHash = await getHash(files);
    const oldHash = await loadHash(HASH_PATH);
    const mergedHash = mergeHash(src, newFilesHash, oldHash);
    if (mergedHash) {
        await saveHash(HASH_PATH, mergedHash);
    }
};
const saveAssetsHash = async () => {
    const src = HASH_PATH + "hash.json";
    const hash = await getHash(src);
    const version = hash[src].split('').map(i => i.charCodeAt(0)).join("") % (10 ** 10);
    saveOutput(INPUT_PATH + "version.json", JSON.stringify({version}));
};
const sequence = (arr) => arr.reduce((prev, job) => prev.then(job), Promise.resolve());

const build = async () => {
    await packAtlases();
    await packSounds();
    await buildLocales();
    await sequence([ "fonts", "images", "spine"].map(dir => () => updateHash(dir)));
    await saveAssetsHash();
};
build();
