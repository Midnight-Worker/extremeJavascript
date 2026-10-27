export class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.init();
    }

    init() {
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = 1800;
        this.canvas.height = 1080;
    }
}
