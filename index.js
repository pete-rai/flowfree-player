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

require('dotenv').config();
const FlowFree = require('./lib/flowfree.js');
new FlowFree().play();
