var maze = new Maze({
    cols: 24,
    rows: 16,

    perfect: true,

    onInit: function() {
        this.checkCount = {};
    },

    isValid: function(c, r) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) {
            return false;
        }
        if (this.grid[r][c] === 0) {
            return true;
        }
        if (this.perfect){
            return false;
        }

        // 用于生成一种非Perfect迷宫).
        this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
        var count = ++this.checkCount[c + "-" + r];
        return Math.random() < 0.3 && count < 3;
    },

    updateCurrent: function() {
        // 每步有 70% 的概率 进行回溯
        if (Math.random() <= 0.70) {
            this.backtrace();
        }
    },

    getTraceIndex: function() {
        // 按一定的概率随机选择回溯策略
        var r = Math.random();
        var len = this.trace.length;
        var idx = 0;
        if (r < 0.1) {
            idx = len * Math.random() >> 0;
        } else if (r < 0.3) {
            idx = len - 1;
        } else if (r < 0.6) {
            idx = len >> 1;
        }
        return idx;
    },

});

// maze.start();
maze.start(0, 0);


window.onload = function() {
    start();
}

function $id(id) {
    return document.getElementById(id);
}

var canvas,context;
function start() {
    canvas = $id("canvas");
    context = canvas.getContext("2d");

    renderMaze(context, maze);

}

function renderMaze(context, maze) {

    var grid = JSON.parse(JSON.stringify(maze.grid));

    var wallWidth = 4;
    var cellSize = 35;
    var width = cellSize * maze.cols;
    var height = cellSize * maze.rows;
    var x = 10,
        y = 10;

    canvas.width = width+wallWidth+x*2;
    canvas.height = height+wallWidth+y*2;

    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#334466";
    context.strokeStyle = "#334466";
    context.font = "12px Arial";
    context.lineWidth = wallWidth;

    for (var r = 0; r < grid.length; r++) {
        var row = grid[r];
        for (var c = 0; c < row.length; c++) {
            var left = (row[c] & Maze.Direction.W) !== Maze.Direction.W;
            var top = (row[c] & Maze.Direction.N) !== Maze.Direction.N;
            var cx = c * cellSize + x;
            var cy = r * cellSize + y;
            if (left && top) {
                context.fillRect(cx, cy, wallWidth, cellSize);
                context.fillRect(cx, cy, cellSize, wallWidth);
            } else if (left) {
                context.fillRect(cx, cy, wallWidth, cellSize);
            } else if (top) {
                context.fillRect(cx, cy, cellSize, wallWidth);
            } else {
                var w = false;
                if (r > 0) {
                    w = (grid[r - 1][c] & Maze.Direction.W) !== Maze.Direction.W;
                }
                if (w && c > 0) {
                    w = (grid[r][c - 1] & Maze.Direction.N) !== Maze.Direction.N;
                }
                var ltc = w ? 1 : 0;
                if (ltc) {
                    context.fillRect(cx, cy, wallWidth, wallWidth);
                }
            }
        }
    }

    context.fillRect(x, cellSize * maze.rows + y, cellSize * maze.cols, wallWidth);
    context.fillRect(cellSize * maze.cols + x, y, wallWidth, cellSize * maze.rows + wallWidth);
}
