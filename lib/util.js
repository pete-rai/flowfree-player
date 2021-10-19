/*
 * flowfree-player v1.0.0
 * https://github.com/pete-rai/flowfree-player
 *
 * Copyright 2021 Pete Rai
 * Released under the MIT license
 * https://github.com/pete-rai/flowfree-player/blob/main/LICENSE
 *
 * Released with the karmaware tag
 * https://pete-rai.github.io/karmaware
 *
 * Website  : http://www.rai.org.uk
 * GitHub   : https://github.com/pete-rai
 * LinkedIn : https://uk.linkedin.com/in/raipete
 * NPM      : https://www.npmjs.com/~peterai
 *
 */

'use strict';

// --- dependencies

const exec = require('child_process').exec;

// --- internal util class

module.exports = class Util {

    // --- makes a hex color from an int

    static hex(n) {
        return ('0' + n.toString(16)).substr(-2);
    }

    // --- executes an external command as a promise

    static async exec(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                error ? reject(error) : resolve(stdout);
            });
        });
    }

    // --- tests if a string is valid json

    static is_json(text) {
        let isjson = true;

        try {
            JSON.parse(text);
        }

        catch {
            isjson = false;
        }

        return isjson;
    }
}
