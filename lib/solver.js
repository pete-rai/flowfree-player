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

// --- internal solver class

module.exports = class Solver {

    // --- constants - you should not change these

    static COLORS = 'RBYGOCMPAWgmTbcp'.split(''); // these colors are as expected by pyflowsolver.py
    static BLANK  = '.'; // blank cells
    static MOVE   = {
        UP:    [-1, 12, 9, 10], // these direction lists are as expected by pyflowsolver.py - see below
        LEFT:  [-1,  3, 6, 10],
        DOWN:  [-1, 12, 5,  6],
        RIGHT: [-1,  3, 5,  9]
    }

    /*

      note: the MOVE.* arrays above, use the following values as expected by pyflowsolver.py

         3 = LR : '─'
         5 = TL : '┘'
         6 = TR : '└'
         9 = BL : '┐'
        10 = BR : '┌'
        12 = TB : '│'

    */

    // --- constructor

    constructor(board, width, height, result) {
        this.width  = width;
        this.height = height;
        this.board  = board;
        this.result = result;
    }

    // --- finds the end points for each color

    ends() {
        let ends = {};

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {

                let pos = { x: x, y: y };
                let col = this.cell(pos);

                if (col != Solver.BLANK) {
                    if (!ends[col]) {
                        ends[col] = [];
                    }

                    ends[col].push(pos);
                }
            }
        }

        return ends;
    }

    // --- whether the position inside the board

    inside(pos) {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }

    // --- the value of the given board cell

    cell(pos) {
        return this.inside(pos) ? this.board[pos.y][pos.x] : null;
    }

    // --- the color of the given solution position

    color(pos) {
        return this.inside(pos) ? this.result[pos.y][pos.x][0] : null;
    }

    // --- the direction of the given solution position

    direction(pos) {
        return this.inside(pos) ? this.result[pos.y][pos.x][1] : null;
    }

    // --- marks that we have stepped into a solution position

    stepped(pos) {
        this.result[pos.y][pos.x][1] = null;
    }

    // --- recursively works out the solution path for a given color

    path(curr, end, path) {
        let next = null;

        this.stepped(curr);

        if (curr.x == end.x && curr.y == end.y) {
            next = path;
        } else {

            let above = { x: curr.x,     y: curr.y - 1 };
            let left  = { x: curr.x - 1, y: curr.y     };
            let below = { x: curr.x,     y: curr.y + 1 };
            let right = { x: curr.x + 1, y: curr.y     };
            let color = this.color(end);

            if (this.color(above) == color && Solver.MOVE.UP.includes(this.direction(above))) {
                path.push(above);
                next = this.path(above, end, path);

            } else if (this.color(left) == color && Solver.MOVE.LEFT.includes(this.direction(left))) {
                path.push(left);
                next = this.path(left, end, path);

            } else if (this.color(below) == color && Solver.MOVE.DOWN.includes(this.direction(below))) {
                path.push(below);
                next = this.path(below, end, path);

            } else if (this.color(right) == color && Solver.MOVE.RIGHT.includes(this.direction(right))) {
                path.push(right);
                next = this.path(right, end, path);
            }
        }

        return next;
    }

    // --- works out the solution path for each color

    paths() {
        let paths = {};
        let ends  = this.ends();

        for (let color in ends) {
            let start = ends[color][0];
            let end   = ends[color][1];

            paths[color] = this.path(start, end, [start]);
        }

        return paths;
    }

    // --- converts the color paths into swipes - coalesces runs along the same direction

    swipes(paths) {
        let swipes = {};

        for (let color in paths) {
            let path  = paths[color];
            let dir   = path[0].x == path[1].x;
            let swipe = [path[0]];

            for (let i = 1; i < path.length; i++) {
                let horz = path[i].x == path[i - 1].x;

                if (horz != dir) { // change of direction
                    swipe.push(path[i - 1]);
                    dir = !dir;
                }

                swipes[color] = swipe;
            }

            swipe.push(path[path.length - 1]);
        }

        return swipes;
    }
}
