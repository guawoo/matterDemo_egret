class PhyscisHelp {
    /**
     * 计算多边形的重心（注：非多边形中心点）
     * https://en.wikipedia.org/wiki/Centroid
     * @param path 多边形顶点数组 example: [[x1,y1], [x2, y2]]
     *
     */
    static getPolygonCentroid(path: Array<Array<number>>):Array<number> {
        let polygonArea = 0;
        let points = PhyscisHelp.deepcopy(path);
        
        points.push(points[0]);

        // console.log(points);

        let sum = 0;
        for (var i=0; i<points.length-1; i++) {
            sum += (points[i][0] * points[i+1][1] - points[i+1][0] * points[i][1])
        }
        polygonArea = sum / 2;

        // console.log(polygonArea);

        let cx = 0;
        let cy = 0;
    


        for (var i=0; i<points.length-1; i++) {
            // let factor1 = points[i][0] + points[i+1][0];
            let factor2 = points[i][0] * points[i+1][1] - points[i+1][0] * points[i][1];

            cx += (points[i][0] + points[i+1][0]) * factor2;
            cy += (points[i][1] + points[i+1][1]) * factor2;
        }

        // console.log(cx);

        cx = cx / 6 / polygonArea;
        cy = cy / 6 / polygonArea;

        if (cx < 0) {
            cx *= -1;
            cy *= -1;
            console.log("顶点坐标组是顺时针方向围绕。")
        }
        
        return [cx, cy];
    }

    static getVerticesWhenRotate(vertices: Array<Array<number>>, rad, centerX, centerY): Array<Array<number>> {
        // let rad = deg * Math.PI / 180;
        let _rad = rad;
        // if (_rad < 0) _rad =  Math.PI / 2 + _rad;

        let newVertices = [];

        vertices.forEach(point=>{
            // let newPoint = [];
            let x = (point[0] - centerX) * Math.cos(_rad) - (point[1] - centerY) * Math.sin(_rad) + centerX;
            let y = (point[0] - centerX) * Math.sin(_rad) + (point[1] - centerY) * Math.cos(_rad) + centerY;
            newVertices.push([parseInt(x.toFixed(2)),parseInt(y.toFixed(2))]);
        });

        return newVertices;
    } 

     /**
     * 多维数组克隆
     */
    static deepcopy(obj) {
        var out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
            if (obj[i] instanceof Array) {
                out[i] = PhyscisHelp.deepcopy(obj[i]);
            }
            else out[i] = obj[i];
        }
        return out;
    }
}