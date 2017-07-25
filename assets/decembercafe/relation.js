function relation() {
    // a: nodes
    // b: edges
    // l: node circle line width
    var a, b, c, d, e, f = "id", g = 15, h = 600, i = 600, j = -30, k = 20, l = 1, el=true;
    this.init = function () {
        c = d3.forceSimulation().force(
            "charge",
            d3.forceManyBody().strength(j)
        ).force(
            "center",
            d3.forceCenter(h / 2, i / 2) // control the position of the center node
            ).force(
            "collide",
            d3.forceCollide(1.2 * g)
            ),

            c.nodes(a).on("tick", this.render),

            c.force(
                "link",
                d3.forceLink().links(b).id(function (a) { return a[f] }).distance(k + 200)  // control the length of the edge
            ),

            this.initDrag(),

            e = d.getContext("2d"),

            this.restart(),

            this.pause()
    },

        this.render = function () {
            // draw edge
            e.clearRect(0, 0, h, i),
                e.lineWidth = l,
                e.strokeStyle = "black",
                e.beginPath(),
                b.forEach(
                    function (a) {
                        e.moveTo(a.source.x, a.source.y),
                            e.lineTo(a.target.x, a.target.y);
                        if (el) e.fillText(a.label, (a.source.x + a.target.x) / 2, (a.source.y + a.target.y) / 2);
                    }
                ),
                e.stroke(),
                
                // draw node
                e.lineWidth = 1.5,
                e.strokeStyle = "black",
                a.forEach(function (a) {
                    e.fillStyle = a.color,
                        e.beginPath(),
                        e.arc(a.x, a.y, a.radius, 0, 2 * Math.PI),
                        e.fill(),
                        e.stroke()
                }),

                // draw node labels
                e.font = "14px Comic Sans MS",
                e.fillStyle = "black",
                e.textAlign = "center",
                a.forEach(function (a) { e.fillText(a.name, a.x, a.y + 2.5 * a.radius) })
        },

        this.initDrag = function () {
            function a() {
                return c.find(d3.event.x, d3.event.y)
            }

            function b() {
                d3.event.active || c.alphaTarget(.3).restart(),
                    d3.event.subject.fx = d3.event.subject.x,
                    d3.event.subject.fy = d3.event.subject.y
            }

            function e() {
                d3.event.subject.fx = d3.event.x,
                    d3.event.subject.fy = d3.event.y
            }

            function f() {
                d3.event.active || c.alphaTarget(0),
                    d3.event.subject.fx = null,
                    d3.event.subject.fy = null
            }

            d3.select(d).call(d3.drag().container(d).subject(a).on("start", b).on("drag", e).on("end", f))
        },

        this.pause = function () {
            c.stop()
        },

        this.run = function () {
            c.restart()
        },

        this.restart = function () {
            c.alpha(1),
                this.run()
        },

        this.setNodes = function (b) { a = b },

        this.setLinks = function (a) { b = a },

        this.setId = function (a) { f = a },

        this.setRadius = function (a) { g = a },

        this.setCanvas = function (a) { d = a },

        this.setSize = function (a, b) { h = a, i = b },

        this.setCharge = function (a) { j = a },

        this.setShowEdgeLabel = function(a) { el = a },

        this.setLinkLength = function (a) { k = a }
}
