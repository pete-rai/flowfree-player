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

const fs = require('fs');
const Util = require('./util');
const Solver = require('./solver');
const AndroidAutomate = require('android-automate');

// --- exported flowfree class

module.exports = class FlowFree extends AndroidAutomate.Device {

    // --- constants - you can modify using env file - see readme for more info...

    static SCREEN = {
        INFO:  JSON.parse(process.env.SCREEN_INFO ), // the info section - 'Level L WxH'
        BOARD: JSON.parse(process.env.SCREEN_BOARD)  // the play board
    }

    // --- constructor

    constructor(caps) {
        super(caps);
        this.tracing(true);
    }

    // --- reads the info to get the level and board size

    async info(screen) {
        let head = screen.clone('heading').crop(FlowFree.SCREEN.INFO).greyscale().sharpen();
        let text = await head.read(true);
        let bits = text.match(/level\s+(\d+)\s+(\d+)x(\d+).*/);
        let info = bits ? { l: parseInt(bits[1] ?? '0'), w: parseInt(bits[2] ?? '0'), h: parseInt(bits[3] ?? '0') } : null;

        await head.delete();
        return info && info.l && info.w && info.h ? info : null;
    }

    // --- converts a from board coordinates to pixels

    to_pixel(x, y, w, h, dx = 0, dy = 0) {
        let width  = Math.floor(FlowFree.SCREEN.BOARD.w / w);
        let height = Math.floor(FlowFree.SCREEN.BOARD.h / h);

        return { x: Math.floor(x * width  + width  / 2) + dx,
                 y: Math.floor(y * height + height / 2) + dy };
    }

    // --- converts a from board coordinates to screen coordinates

    to_screen(x, y, w, h) {
        return this.to_pixel(x, y, w, h, FlowFree.SCREEN.BOARD.x, FlowFree.SCREEN.BOARD.y)
    }

    // --- converts board swipes to screen coordinates swipes

    moves(swipes, w, h) {
        let moves = {};

        for (let color in swipes) {
            let swipe = swipes[color];
            moves[color] = [];

            for (let i = 0; i < swipe.length - 1; i++) {
                moves[color].push(this.to_screen(swipe[i].x, swipe[i].y, w, h));
            }

            // the code below handles the fact that flowfree autocompletes the path when the last but one move is next to the end cell

            if (Math.abs(swipe[swipe.length - 2].x - swipe[swipe.length - 1].x) > 1 ||
                Math.abs(swipe[swipe.length - 2].y - swipe[swipe.length - 1].y) > 1) {
                moves[color].push(this.to_screen(swipe[swipe.length - 1].x, swipe[swipe.length - 1].y, w, h));
            }
        }

        return moves;
    }

    // --- reads the board and returns it in a format that pyflowsolver.py is expecting

    async board(screen, w, h) {
        const BLACKISH = 50;
        const BLACK = { r: 0, g: 0, b: 0 };

        let board  = [];
        let pixels = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                pixels.push(this.to_pixel(x, y, w, h));
            }
        }

        let grid = screen.clone('board').crop(FlowFree.SCREEN.BOARD);
        let info = await grid.colors(pixels);
        let matches = { '000000': Solver.BLANK };

        for (let i = 0; i < info.colors.length; i++) {
            let color = info.colors[i].c;

            if (color.r < BLACKISH && color.g < BLACKISH && color.b < BLACKISH) { // annoying background animation, means it is not always completely black
                color = BLACK;
            }

            let c = Util.hex(color.r) + Util.hex(color.g) + Util.hex(color.b);
            let x = Math.floor(i / w);

            if (x == 0) {
                board.push(''); // new row
            }

            if (!matches[c]) {
                matches[c] = Solver.COLORS.shift(); // any approved color will do, we do not need to match color-for-color as path will still be right
            }

            board[x] += matches[c];
        }

        await grid.delete();
        return board;
    }

    // --- calls pyflowsolver.py to solve the grid and returns the result

    async solve(board) {
        const FILE = 'board.txt';

        fs.writeFileSync(FILE, board.join("\n"));
        let result = await Util.exec(`${ process.env.PYTHON_PATH } ${ __dirname }/pyflowsolver.py -q ${ FILE }`);
        fs.unlinkSync(FILE);

        return Util.is_json(result) ? JSON.parse(result) : null;
    }

    // --- plays the current board

    async play() {
        let screen = this.screen('flowfree').shoot();
        let info   = await this.info(screen)

        if (info) {
            this.trace(`playing level ${info.l} with a ${info.w}x${info.h} board`);

            let board  = await this.board(screen, info.w, info.h);
            let result = await this.solve(board);

            if (result) {
                let solver = new Solver(board, info.w, info.h, result);
                let paths  = solver.paths();
                let swipes = solver.swipes(paths);
                let moves  = this.moves(swipes, info.w, info.h);

                for (let color in moves) {
                    await this.swipes(moves[color], 0, 0); // plays the actual moves
                }
            } else {

                this.trace('could not solve this board - is it reset and ready?');
            }
        } else {

            this.trace('could not read the flowfree screen');
        }

        await screen.delete();
    }
}
