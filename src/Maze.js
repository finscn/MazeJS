"use strick";

var Maze = function(options) {
    for (var p in options) {
        this[p] = options[p];
    }
    this.init();
};


Maze.prototype = {
    constructor: Maze,

    cols: 0,
    rows: 0,
    grid: null,

    // 是否每走一步, 都尝试回溯.
    alwaysBacktrace: false,

    init: function() {
        this.trace = [];
        var grid = this.grid = [];
        for (var r = 0; r < this.rows; r++) {
            var row = [];
            grid.push(row);
            for (var c = 0; c < this.cols; c++) {
                row.push(0)
            }
        }

        this.onInit();
    },

    onInit: function() {},

    random: function(min, max) {
        return ((max - min + 1) * Math.random() + min) >> 0;
    },
    getCell: function(c, r) {
        return this.grid[r][c];
    },
    setMark: function(c, r, value) {
        return this.grid[r][c] |= value;
    },
    removeMark: function(c, r, value) {
        return this.grid[r][c] &= ~value;
    },
    isMarked: function(c, r, value) {
        return (this.grid[r][c] & value) === value;
    },

    setStart: function(c, r) {
        this.startCol = c;
        this.startRow = r;
        this.setCurrent(c, r);
        this.onStart(c, r);
    },
    onStart: function() {},

    setCurrent: function(c, r) {
        this.currentCol = c;
        this.currentRow = r;
        var value = this.grid[r][c];
        this.neighbors = this.getValidNeighbors(c, r, value);

        if (this.neighbors && value === 0) {
            this.trace.push([c, r, value]);
            this.onTrace(c, r, value);
        }
    },
    onTrace: function(c, r, value) {

    },
    moveTo: function(c, r, dir) {
        var value = this.grid[r][c];
        this.beforeMove(c, r, value);
        this.grid[this.currentRow][this.currentCol] |= dir;
        this.setCurrent(c, r);
        value = this.grid[r][c] = value | Maze.Direction.opposite[dir];
        this.afterMove(c, r, value);
    },
    beforeMove: function(c, r, value) {

    },
    afterMove: function(c, r, value) {

    },

    start: function(col, row) {
        if (arguments.length < 2) {
            row = this.random(0, this.rows - 1);
        }
        if (arguments.length < 1) {
            col = this.random(0, this.cols - 1);
        }

        this.setStart(col, row);
        var step = 0;
        while (this.nextStep()) {
            step++;
            // console.log(step);
        }
        console.log("Steps : " + step);

    },

    nextStep: function() {
        if (!this.neighbors) {
            return this.backtrace();
        }
        var n = this.getNeighbor();
        this.moveTo(n[0], n[1], n[2]);
        this.updateCurrent();
        return true;
    },

    backtrace: function() {
        var len = this.trace.length;
        while (len > 0) {
            var idx = this.getTraceIndex();
            var current = this.trace[idx];
            var n = this.getValidNeighbors(current[0], current[1], current[2]);
            if (n) {
                this.currentCol = current[0];
                this.currentRow = current[1];
                this.neighbors = n;
                return true;
            } else {
                this.trace.splice(idx, 1);
                len--;
            }
        }
        return false;
    },


    /***************************************
      通过重写以下几个方法, 可以实现不同的迷宫效果
    **************************************/

    getValidNeighbors: function(c, r, value) {
        var n = [];
        this.isValid(c, r - 1, value) && n.push([c, r - 1, Maze.Direction.N]);
        this.isValid(c + 1, r, value) && n.push([c + 1, r, Maze.Direction.E]);
        this.isValid(c, r + 1, value) && n.push([c, r + 1, Maze.Direction.S]);
        this.isValid(c - 1, r, value) && n.push([c - 1, r, Maze.Direction.W]);
        return n.length > 0 ? n : null;
    },

    isValid: function(c, r, value) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) {
            return false;
        }
        return this.grid[r][c] === 0;
    },

    updateCurrent: function() {
        if (this.alwaysBacktrace) {
            this.backtrace();
        }
    },

    getNeighbor: function() {
        var n = this.neighbors[this.neighbors.length * Math.random() >> 0];
        return n;
    },

    getTraceIndex: function() {
        // var idx = this.trace.length * Math.random() >> 0;
        var idx = this.trace.length - 1;
        return idx;
    },

};


Maze.Direction = {
    N: 1,
    S: 2,
    E: 4,
    W: 8,
    opposite: {
        1: 2,
        2: 1,
        4: 8,
        8: 4
    }
};
