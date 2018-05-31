var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
// TypeScript file
var EgretRender = (function () {
    function EgretRender() {
    }
    EgretRender.create = function (options) {
        var defaults = {
            controller: EgretRender,
            engine: null,
            element: null,
            canvas: null,
            mouse: null,
            frameRequestId: null,
            options: {
                width: 800,
                height: 600,
                pixelRatio: 1,
                background: '#fafafa',
                wireframeBackground: '#222222',
                hasBounds: !!options['bounds'],
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showSeparations: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false,
                showVertexNumbers: false,
                showConvexHulls: false,
                showInternalEdges: false,
                showMousePosition: false
            }
        };
        var render = Matter.Common.extend(defaults, options);
        render.mouse = options['mouse'];
        render.engine = options['engine'];
        render.container = render.container || egret.MainContext.instance.stage;
        render.bounds = render.bounds ||
            {
                min: {
                    x: 0,
                    y: 0
                },
                max: {
                    x: render.width,
                    y: render.height
                }
            };
        return render;
    };
    EgretRender.run = function (render) {
        egret.startTick(function (timeStamp) {
            EgretRender.world(render);
            return false;
        }, EgretRender);
    };
    EgretRender.stop = function (cb) {
        egret.stopTick(function (timeStamp) {
            cb();
            return false;
        }, EgretRender);
    };
    EgretRender.world = function (render) {
        var engine = render.engine;
        var world = engine.world;
        var renderer = render.renderer;
        var container = render.container;
        var options = render.options;
        var bodies = Matter.Composite.allBodies(world);
        var allConstraints = Matter.Composite.allConstraints(world);
        var constraints = [];
        if (options.wireframes) {
            // console.log('egret 无法改变容器的背景色，请用一张图片代替。');
        }
        else {
            // console.log('egret 无法改变容器的背景色，请用一张图片代替。');
        }
        var boundsWidth = render.bounds.max.x - render.bounds.min.x;
        var boundsHeight = render.bounds.max.y - render.bounds.min.y;
        var boundsScaleX = boundsWidth / render.options.width;
        var boundsScaleY = boundsHeight / render.options.height;
        if (options.hasBounds) {
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                body.render.sprite.visible = Matter.Bounds.overlaps(body.bounds, render.bounds);
            }
            for (var j = 0; j < allConstraints.length; j++) {
                var constraint = allConstraints[j];
                var bodyA = constraint.bodyA;
                var bodyB = constraint.bodyB;
                var pointAWorld = constraint.pointA;
                var pointBWorld = constraint.pointB;
                if (bodyA)
                    pointAWorld = Matter.Vector.add(bodyA.position, constraint.pointA, null);
                if (bodyB)
                    pointBWorld = Matter.Vector.add(bodyB.position, constraint.pointB, null);
                if (!pointAWorld || !pointBWorld) {
                    continue;
                }
                if (Matter.Bounds.contains(render.bounds, pointAWorld) || Matter.Bounds.contains(render.bounds, pointBWorld))
                    constraints.push(constraint);
            }
            container.scaleX = 1 / boundsScaleX;
            container.scaleY = 1 / boundsScaleY;
            container.x = -render.bounds.min.x * (1 / boundsScaleX);
            container.y = -render.bounds.min.y * (1 / boundsScaleY);
        }
        else {
            constraints = allConstraints;
        }
        for (i = 0; i < bodies.length; i++) {
            EgretRender.body(render, bodies[i]);
        }
        for (i = 0; i < constraints.length; i++) {
            EgretRender.constraint(render, constraints[i]);
        }
    };
    EgretRender.body = function (render, body) {
        var engine = render.engine;
        var bodyRender = body.render;
        if (!bodyRender.visible)
            return;
        if (bodyRender.sprite && bodyRender.sprite.texture) {
            var spriteId = 'b-' + body.id;
            var sprite = body.egretSprite;
            var container = render.container;
            if (!sprite) {
                sprite = body.egretSprite = EgretRender._createBodySprite(render, body);
            }
            if (!container.contains(sprite)) {
                container.addChild(sprite);
            }
            sprite.x = body.position.x;
            sprite.y = body.position.y;
            sprite.rotation = body.angle * 180 / Math.PI;
            // console.log(body.angle);
            sprite.scaleX = bodyRender.sprite.xScale || 1;
            sprite.scaleY = bodyRender.sprite.yScale || 1;
        }
        else {
            var primitiveId = 'b-' + body.id;
            var sprite = body.egretSprite;
            var container = render.container;
            if (!sprite) {
                sprite = body.egretSprite = EgretRender._createBodyPrimitive(render, body);
                sprite.initAngle = body.angle;
            }
            if (!container.contains(sprite)) {
                container.addChild(sprite);
            }
            sprite.x = body.position.x;
            sprite.y = body.position.y;
            // console.log(sprite.ini);
            sprite.rotation = (body.angle - sprite.initAngle) * 180 / Math.PI;
            // sprite.rotation = body.angle * 180 / Math.PI;
        }
    };
    EgretRender._createBodySprite = function (render, body) {
        var bodyRender = body.render;
        var textureKey = bodyRender.sprite.texture;
        var sprite = new egret.Bitmap();
        var texture = RES.getRes(textureKey);
        sprite.texture = texture;
        sprite.anchorOffsetX = body.render.sprite.xOffset;
        sprite.anchorOffsetY = body.render.sprite.yOffset;
        return sprite;
    };
    EgretRender._createBodyPrimitive = function (render, body) {
        var bodyRender = body.render;
        var options = render.options;
        var sprite = new MatterSprite;
        var fillStyle;
        var strokeStyle;
        var lineWidth;
        var part;
        var points = [];
        var primitive = sprite.graphics;
        primitive.clear();
        for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
            part = body.parts[k];
            if (!options.wireframes) {
                fillStyle = bodyRender.fillStyle;
                strokeStyle = bodyRender.strokeStyle;
                lineWidth = bodyRender.lineWidth;
            }
            else {
                fillStyle = null;
                strokeStyle = 0xff0000;
                lineWidth = 1;
            }
            for (var j = 0; j < part.vertices.length; j++) {
                points.push([part.vertices[j].x - body.position.x, part.vertices[j].y - body.position.y]);
            }
            primitive.lineStyle(1, strokeStyle);
            primitive.moveTo(points[0][0], points[0][1]);
            for (var m = 1; m < points.length; m++) {
                primitive.lineTo(points[m][0], points[m][1]);
            }
            primitive.lineTo(points[0][0], points[0][1]);
            primitive.endFill();
        }
        return sprite;
    };
    EgretRender.constraint = function (render, constraint) {
        var engine = render.engine;
        var bodyA = constraint.bodyA;
        var bodyB = constraint.bodyB;
        var pointA = constraint.pointA;
        var pointB = constraint.pointB;
        var container = render.container;
        var constraintRender = constraint.render;
        var primitiveId = 'c-' + constraint.id;
        var sprite = constraint.egretSprite;
        if (!sprite) {
            sprite = constraint.egretSprite = new MatterSprite();
        }
        var primitive = sprite.graphics;
        // constraint 没有两个终点时不渲染
        if (!constraintRender.visible || !constraint.pointA || !constraint.pointB) {
            primitive.clear();
            return;
        }
        // 如果sprite未在显示列表，则添加至显示列表
        if (!container.contains(sprite))
            container.addChild(sprite);
        // 渲染 constraint
        primitive.clear();
        var fromX;
        var fromY;
        var toX;
        var toY;
        if (bodyA) {
            fromX = bodyA.position.x + pointA.x;
            fromY = bodyA.position.y + pointA.y;
        }
        else {
            fromX = pointA.x;
            fromY = pointA.y;
        }
        if (bodyB) {
            toX = bodyB.position.x + pointB.x;
            toY = bodyB.position.y + pointB.y;
        }
        else {
            toX = pointB.x;
            toY = pointB.y;
        }
        var strokeStyle = 0x00ff00;
        primitive.lineStyle(1, strokeStyle);
        primitive.moveTo(fromX, fromY);
        primitive.lineTo(toX, toY);
        primitive.endFill();
    };
    return EgretRender;
}());
__reflect(EgretRender.prototype, "EgretRender");
var MatterSprite = (function (_super) {
    __extends(MatterSprite, _super);
    function MatterSprite() {
        return _super.call(this) || this;
    }
    return MatterSprite;
}(egret.Sprite));
__reflect(MatterSprite.prototype, "MatterSprite");
//# sourceMappingURL=EgretRender.js.map