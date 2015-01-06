var maze = new Maze({
    width: 60,
    height: 40,

    perfect: true,
    braid: false,
    checkOver: false,

    onInit: function() {
        this.checkOver=$id("checkOver").checked;
        this.checkCount = {};
        // this.traceInfo = {};
        this.foundEndNode = false;
    },

    getValidNeighbors: function(node) {
        var n = [];
        var c = node.x;
        var r = node.y;
        var nearNode, dir;

        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        dir = Maze.Direction.N;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = this.grid[r][c + 1];
        dir = Maze.Direction.E;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
        dir = Maze.Direction.S;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        nearNode = this.grid[r][c - 1];
        dir = Maze.Direction.W;
        this.isValid(nearNode, node, dir) && n.push([nearNode, dir]);

        n = this.updateNeighbors(node, n);

        return n.length > 0 ? n : null;
    },

    isValid: function(nearNode, node, dir) {
        if (!nearNode) {
            return false;
        }
        if (nearNode.value === 0) {
            return true;
        }
        if (this.perfect || this.braid) {
            return false;
        }
        var c = nearNode.x,
            r = nearNode.y;
        // 用于生成一种非Perfect迷宫
        this.checkCount[c + "-" + r] = this.checkCount[c + "-" + r] || 0;
        var count = ++this.checkCount[c + "-" + r];
        return Math.random() < 0.3 && count < 3;
    },

    beforeBacktrace: function() {
        if (!this.braid) {
            return;
        }
        var n = [];
        var node = this.current;
        var c = node.x;
        var r = node.y;
        var nearNode, dir, op;

        var first = null;
        var currentDir = this.currentDir;
        var updateNear = function() {
            op = Maze.Direction.opposite[dir];
            if (nearNode && (nearNode.value & op) !== op) {
                n.push([nearNode, dir]);
                if (dir == currentDir) {
                    first = [nearNode, dir];
                }
            }
        };

        dir = Maze.Direction.N;
        nearNode = r > 0 ? this.grid[r - 1][c] : null;
        updateNear();

        if (!first) {
            dir = Maze.Direction.E;
            nearNode = this.grid[r][c + 1];
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.S;
            nearNode = r < this.height - 1 ? this.grid[r + 1][c] : null;
            updateNear();
        }

        if (!first) {
            dir = Maze.Direction.W;
            nearNode = this.grid[r][c - 1];
            updateNear();
        }

        n = first || n[n.length * Math.random() >> 0];
        this.moveTo(n[0], n[1]);
    },

    updateCurrent: function() {
        // this.traceInfo[this.current.x + "-" + this.current.y] = this.stepCount;
        if (this.braid) {
            return;
        }
        // 每步有 10% 的概率 进行回溯
        if (Math.random() <= 0.10) {
            this.backtrace();
        }
    },

    getTraceIndex: function() {
        var len = this.trace.length;

        if (this.braid) {
            return len - 1;
        }

        // 按一定的概率随机选择回溯策略
        var r = Math.random();
        var idx = 0;
        if (r < 0.5) {
            idx = len - 1;
        } else if (r < 0.7) {
            idx = len >> 1;
        } else if (r < 0.8) {
            idx = len * Math.random() >> 0;
        }
        return idx;
    },

    afterGenrate: function() {
        if (this.braid) {
            this.setCurrent(this.startNode);
            this.nextStep();
        }
    },

    isOver: function() {
        if (!this.checkOver){
            return false;
        }
        if (this.current == this.endNode) {
            this.foundEndNode = true;
        }
        // 当探索到迷宫终点, 且探索了至少一半的区域时,终止迷宫的生成
        if (this.foundEndNode && this.stepCount >= this.size / 2) {
            return true;
        }
        return false;
    }
});



window.onload = function() {
    start();
}

function createPerfectMaze() {
    createMaze(true, false);
}

function createBraidMaze() {
    createMaze(false, true);
}

function createMaze(perfect, braid) {
    maze.perfect = perfect || false;
    maze.braid = braid || false;

    maze.init();
    // maze.setStart(0, 0);
    // maze.setEnd(4, 4);

    maze.startNode = maze.getRandomNode();
    do {
        maze.endNode = maze.getRandomNode();
    } while (maze.startNode == maze.endNode);

    maze.generate();

    renderMaze(context, maze);
}

function $id(id) {
    return document.getElementById(id);
}

var canvas, context;

function start() {
    canvas = $id("canvas");
    context = canvas.getContext("2d");
    createPerfectMaze();
}

function renderMaze(context, maze) {

    // var grid = JSON.parse(JSON.stringify(maze.grid));
    var grid = maze.grid;

    var wallWidth = 2;
    var cellSize = 16;
    // var cellSize = 36;
    var width = cellSize * maze.width;
    var height = cellSize * maze.height;
    var x = 10,
        y = 10;

    canvas.width = width + wallWidth + x * 2;
    canvas.height = height + wallWidth + y * 2;

    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#334466";
    context.strokeStyle = "#334466";
    context.font = "12px Arial";
    context.lineWidth = wallWidth;

    for (var r = 0; r < grid.length; r++) {
        var row = grid[r];
        for (var c = 0; c < row.length; c++) {
            var node = row[c];
            var cx = c * cellSize + x;
            var cy = r * cellSize + y;
            if (!node.value) {
                context.fillRect(cx, cy, cellSize, cellSize);
                continue;
            }

            if (node == maze.startNode) {
                context.fillText("S", cx + cellSize * 1 / 3, cy + cellSize - 2);
            } else if (node == maze.endNode) {
                context.fillText("E", cx + cellSize * 1 / 3, cy + cellSize - 2);
            } else {
                // var text = maze.traceInfo[node.x + "-" + node.y];
                // context.fillText(text, cx + cellSize * 1 / 3, cy + cellSize - 2);
            }
            var left = (node.value & Maze.Direction.W) !== Maze.Direction.W;
            var top = (node.value & Maze.Direction.N) !== Maze.Direction.N;
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
                    w = (grid[r - 1][c].value & Maze.Direction.W) !== Maze.Direction.W;
                }
                if (w && c > 0) {
                    w = (grid[r][c - 1].value & Maze.Direction.N) !== Maze.Direction.N;
                }
                var ltc = w ? 1 : 0;
                if (ltc) {
                    context.fillRect(cx, cy, wallWidth, wallWidth);
                }
            }
        }
    }

    context.fillRect(x, cellSize * maze.height + y, cellSize * maze.width, wallWidth);
    context.fillRect(cellSize * maze.width + x, y, wallWidth, cellSize * maze.height + wallWidth);
}
