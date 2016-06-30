'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const runReporters = require('./runReporters');

module.exports = () => {

    const compareConfig = {
        reporters: [],
        stats: []
    };

    const {files, chunks, names} = require('yargs')
        .alias({
            c: 'chunks',
            n: 'names',
            f: 'files'
        })
        .describe({
            c: 'Output chunk diff',
            m: 'Chunk/module name list',
            f: 'Specify paths to stats files'
        })
        .demand('files')
        .help()
        .array(['files', 'names'])
        .boolean('chunks')
        .argv;

    const statsFilesToCompare = files.map(fileName => {
        const filePath = path.join(process.cwd(), fileName);
        return fs.readFileAsync(filePath, 'utf8');
    });

    if (chunks) {
        compareConfig.reporters.push({
            reporter: 'chunks',
            options: {names}
        });
    }

    Promise.all(statsFilesToCompare)
        .then(result => result.map(stats => JSON.parse(stats)))
        .then(parsedStatsFiles => {
            compareConfig.stats = parsedStatsFiles;
            runReporters(compareConfig);
        });
};