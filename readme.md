# Egret Matter.js库集成教程 #

----------
###吐槽p2
egret支持的p2虽然方便，但是坑太多，刚体碰撞出错，刚体穿透时常发生，社区也不活跃，资料少，还因为物理效果欠佳，搞得本人的单子凉了，煮熟的鸭子飞了。实在是气不过，不过不去寻求新的物理引擎，那么matter.js成了最好的选择。可惜没有现成的egret支付库使用。论坛里早有大神转投matter.js了，但都没有放出代码，只是偶有提及matter.js真NM好用。没办法，只好亲自动手了。


##教程开始
###1.生成matter.d.ts
egret是typscript一路直到底，没有d.ts文件，很多js库都用不了。在网上早了一圈也没有找到完整的matter.js的d.ts文件，唯一一个比较好的matter.d.ts文件里少了一些给新人用的模块定义，github上论坛区有人问了这个问题，大神的回答是，这些模块基本是给菜鸟用的，但一般人都不会去用，所以没有添加。#！@#%……&%……&，无语，没办法，只好用工具自动生成了。

先安装 dts-gen, 这是微软提供的给js文件自动生成d.ts文件的工具，它的好处是可以很方便的得到d.ts，坏处是生成的d.ts文件里的所有类型都是any，所以不要指望它能给你什么很多有用的代码提示。

> npm install -g dts-gen

再通过npm安装matter.js
    
> npm install -g matter-js

生成d.ts文件
    
> dts-gen -m matter-js


###2.生成egret第三方库

先创建一个库

    egret create_lib matterlib

然后打开matterlib文件夹，保证目录结构是这样的
![](/doc/QQ截图20180531114048.png)

把matter.js , matter.d.ts , decomp.js三个文件放入src文件夹里，如果有些文件夹没有，自己创建好就行了。

decmop.js文件下载地址是
[https://github.com/schteppe/poly-decomp.js/tree/master/build](https://github.com/schteppe/poly-decomp.js/tree/master/build)

修改package.json和tsconfig.json文件，保证内容是这样的



package.json
> 
{
	"name": "matterlib",
	"typings": "src/matter.d.ts",
	"dependencies": {}
}

tsconfig.json
>
{
	"compilerOptions": {
        "target": "es5",
        "outFile": "bin/matter.js",
        "allowJs": true
    },
    "files": [
    	"src/decomp.js",
        "src/matter.js"
        
    ]
}