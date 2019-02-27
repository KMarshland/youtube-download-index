const fs = require('fs');
const process = require('process');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const youtubedl = require('youtube-dl');

async function downloadFromIndex(indexFile, outputDir='data') {
    const index = JSON.parse(await promisify(fs.readFile)(indexFile));

    const sectionDownloads = Object.entries(index).map(([name, config]) => {
        return downloadSection(config, path.join(outputDir, sanitizeName(name)));
    });

    await Promise.all(sectionDownloads);
}

async function downloadSection(configArray, outputDir) {
    await mkdirp(outputDir);

    for (const { url, name } of configArray) {
        console.log(`\tDownloading ${name}`);
        await downloadVideo(url, path.join(outputDir, sanitizeName(name) + '.mp4'));
    }
}

function sanitizeName(name) {
    return name.replace(':', ' -').replace(/[^\w-_ ]/g, '-').replace(/-+/g, '-');
}

function downloadVideo(url, output) {
    return new Promise((resolve) => {
        const video = youtubedl(url);
        video.pipe(fs.createWriteStream(output));

        video.on('end', resolve);
    });
}

downloadFromIndex(process.argv[2]);