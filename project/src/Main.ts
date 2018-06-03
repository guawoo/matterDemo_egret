//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    private index: number = 0;


    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        //创建engine
        let engine = Matter.Engine.create(null, null);
        //创建runner
        let runner = Matter.Runner.create(null);
        //设置runner以固定帧率计算
        runner.isFixed = true; 

        //创建render，使用egret的渲染方法替代matter自己的pixi渲染方法
        let render = EgretRender.create({
            element: document.body,
            engine: engine,
            options: {
                width: this.stage.width,
                height: this.stage.height,
                container: this,
                wireframes: true
            }
        });

        Matter.Runner.run(runner, engine);
        EgretRender.run(render);


        //添加墙壁
        Matter.World.add(engine.world, [
            Matter.Bodies.rectangle(400, 0, 800, 50, { isStatic: true, friction: 0 }),
            Matter.Bodies.rectangle(400, 600, 800, 50, { isStatic: true, friction: 0 }),
            Matter.Bodies.rectangle(650, 300, 50, 600, { isStatic: true, friction: 0 }),
            Matter.Bodies.rectangle(0, 300, 50, 600, { isStatic: true, friction: 0 })
        ]);

        //添加一个盒子
        Matter.World.add(engine.world, 
            Matter.Bodies.rectangle(100,100, 50, 50, {angle: Math.PI/6})
        );

        //添加stage的事件侦听
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TouchEvent) => {
            //获得点击坐标
            let x = event.stageX;
            let y = event.stageY;

            if (this.index == 0) {
                //创建一个带图片的盒子
                let box = Matter.Bodies.rectangle(x, y, 52, 52, {
                    render: {
                        sprite: {
                            texture: 'rect_png', xOffset: 52 / 2, yOffset: 52 / 2
                        }
                    }
                });

                Matter.World.add(engine.world, box);
            }

            if (this.index == 1) {
                //创建一个带图片的圆
                let circle = Matter.Bodies.circle(x, y, 40, {
                    render: {
                        sprite: {
                            texture: 'circle_png', xOffset: 40, yOffset: 40
                        }
                    }
                }, null);
                Matter.World.add(engine.world, circle);

            }

            if (this.index == 2) {
                //创建一个多边形
                let arrow = Matter.Vertices.fromPath('40 0 40 20 100 20 100 80 40 80 40 100 0 50', null);
                let arrowBody = Matter.Bodies.fromVertices(x, y, [arrow], null, true, null, null);
   
                Matter.World.add(engine.world, arrowBody);
            }

            if (this.index == 3) {
                //创建一个带图片的多边形
                let polys = Matter.Vertices.fromPath('0 0 96 0 96 32 32 32 32 64 0 64', null);
                console.log(polys);

                //把polys里的顶点集合转换成[[x,y],[x,y],...]形式
                let vertices = [];
                for (var i=0; i<polys.length; i++) {
                    let x = polys[i].x;
                    let y = polys[i].y;
                    vertices.push([x,y]);
                }
                console.log(vertices);

                //计算多边形的重心
                let centroid = PhyscisHelp.getPolygonCentroid(vertices);
                console.log(centroid);

                let polyBody = Matter.Bodies.fromVertices(x, y, [polys], {
                     render: {
                        sprite: {
                            texture: '4_png', xOffset: centroid[0], yOffset: centroid[1]
                        }
                    }
                }, true, null, null);
                Matter.World.add(engine.world, polyBody);
            }


            this.index++;
            if (this.index > 3) this.index = 0;
        }, this);

        
    }


    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

   
}
