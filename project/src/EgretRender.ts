// TypeScript file
class EgretRender {
    public static create(options: Object) {
        let defaults = {
            controller: EgretRender,
            engine: null,
            element: null,
            canvas: null,
            mouse: null,
            frameRequestId: null,
            options:
			{
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
        let render = Matter.Common.extend(defaults, options);
        render.mouse = options['mouse'];
        render.engine = options['engine'];
        
        render.container = render.container || egret.MainContext.instance.stage;
        render.bounds = render.bounds ||
		{
			min:
			{
				x: 0,
				y: 0
			},
			max:
			{
				x: render.width,
				y: render.height
			}
		};

		return render;
    }

    public static run(render: Object) {
		egret.startTick((timeStamp: number) => {

			
			EgretRender.world(render);

			return false;
		}, EgretRender);
    }

    public static stop(cb: Function) {
        egret.stopTick((timeStamp: number)=> {
            cb();
            return false;
        }, EgretRender);
    }

    public static world(render: any) {
        let engine = render.engine;
		let world = engine.world;
		let renderer = render.renderer;
		let container = render.container;
		let options = render.options;
		let bodies = Matter.Composite.allBodies(world);
		let allConstraints = Matter.Composite.allConstraints(world);
		let constraints = [];

		if (options.wireframes) {
			// console.log('egret 无法改变容器的背景色，请用一张图片代替。');
		}else {
			// console.log('egret 无法改变容器的背景色，请用一张图片代替。');
		}

		let boundsWidth = render.bounds.max.x - render.bounds.min.x;
		let boundsHeight = render.bounds.max.y - render.bounds.min.y;
		let boundsScaleX = boundsWidth / render.options.width;
		let boundsScaleY = boundsHeight / render.options.height;

		if (options.hasBounds) {
			for (var i=0; i<bodies.length; i++) {
				let body = bodies[i];
				body.render.sprite.visible = Matter.Bounds.overlaps(body.bounds, render.bounds);
			}

			for (var j=0; j<allConstraints.length; j++) {
				let constraint = allConstraints[j];
				let bodyA = constraint.bodyA;
				let bodyB = constraint.bodyB;
				let pointAWorld = constraint.pointA;
				let pointBWorld = constraint.pointB;

				if (bodyA) pointAWorld = Matter.Vector.add(bodyA.position, constraint.pointA, null);
				if (bodyB) pointBWorld = Matter.Vector.add(bodyB.position, constraint.pointB, null);

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
		}else {
			constraints = allConstraints;
		}

		for (i = 0; i < bodies.length; i++) {
			EgretRender.body(render, bodies[i]);
		}
			

		for (i = 0; i < constraints.length; i++) {
			EgretRender.constraint(render, constraints[i]);
		}
			
    }

	public static body(render: any, body: any) {
		let engine = render.engine;
		let bodyRender = body.render;

		if (!bodyRender.visible) return;

		if (bodyRender.sprite && bodyRender.sprite.texture) {
			let spriteId = 'b-' + body.id;
			let sprite = body.egretSprite;
			let container = render.container;

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

		}else {
			let primitiveId = 'b-' + body.id;
			let sprite = body.egretSprite;
			let container = render.container;

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
			sprite.rotation = (body.angle - sprite.initAngle) * 180 / Math.PI ;
			// sprite.rotation = body.angle * 180 / Math.PI;
			
		}
	}

	private static _createBodySprite(render: any, body: any): any {
		let bodyRender = body.render;
		let textureKey = bodyRender.sprite.texture;
		
		let sprite = new egret.Bitmap();
		let texture = RES.getRes(textureKey);
		sprite.texture = texture;

		sprite.anchorOffsetX = body.render.sprite.xOffset;
		sprite.anchorOffsetY = body.render.sprite.yOffset;

		return sprite;

	}

	private static _createBodyPrimitive(render: any, body: any): any {
		let bodyRender = body.render;
		let options = render.options;
		let sprite = new MatterSprite;
		let fillStyle;
		let strokeStyle;
		let lineWidth;
		let part;
		let points = [];

		let primitive = sprite.graphics;
		primitive.clear();

		for (var k=body.parts.length>1?1:0; k<body.parts.length; k++) {
			part = body.parts[k];

			if (!options.wireframes) {
				fillStyle = bodyRender.fillStyle;
				strokeStyle = bodyRender.strokeStyle;
				lineWidth = bodyRender.lineWidth;
			}else {
				fillStyle = null;
				strokeStyle = 0xff0000;
				lineWidth = 1;
			}

			for (var j = 0; j < part.vertices.length; j++)
			{
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
	}

	public static constraint(render: any, constraint: any) {
		let engine = render.engine;
		let bodyA = constraint.bodyA;
		let bodyB = constraint.bodyB;
		let pointA = constraint.pointA;
		let pointB = constraint.pointB;
		let container = render.container;
		let constraintRender = constraint.render;
		let primitiveId = 'c-' + constraint.id;
		let sprite = constraint.egretSprite;

		if (!sprite) {
			sprite = constraint.egretSprite = new MatterSprite();
		}

		let primitive = sprite.graphics;

		// constraint 没有两个终点时不渲染
		if (!constraintRender.visible || !constraint.pointA || !constraint.pointB)
		{
			primitive.clear();
			return;
		}

		// 如果sprite未在显示列表，则添加至显示列表
		if (!container.contains(sprite))
			container.addChild(sprite);

		// 渲染 constraint
		primitive.clear();

		let fromX;
		let fromY;
		let toX;
		let toY;

		if (bodyA)
		{
			fromX = bodyA.position.x + pointA.x;
			fromY = bodyA.position.y + pointA.y;
		}
		else
		{
			fromX = pointA.x;
			fromY = pointA.y;
		}

		if (bodyB)
		{
			toX = bodyB.position.x + pointB.x;
			toY = bodyB.position.y + pointB.y;
		}
		else
		{
			toX = pointB.x;
			toY = pointB.y;
		}

		let strokeStyle = 0x00ff00;
		primitive.lineStyle(1, strokeStyle);
		primitive.moveTo(fromX, fromY);
		primitive.lineTo(toX, toY);
		primitive.endFill();
	}

}
















class MatterSprite extends egret.Sprite {
	public initAngle: number;
	constructor() {
		super();
	}
}