import React, {Dispatch, FC,  SetStateAction,  useRef, useState} from 'react';
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import {useWindowSize} from "../hooks/useWindowSize";
import congestionDataSample from "../../public/data/congestionDataSample.json";
import CongestionType from "../type/CongestionType";
import StorePaneInfoType from "../type/StorePaneInfoType";

/*最初に形を会わないのは開発者モードのときのみ*/
//TODO:画面がリサイズされたらリセットされるようにする
//TODO:画面が横→縦になるとバグるエラーを解決

/*ここの横幅を1000として考える。この1000と比べて何倍になっているかで計算*/
// 横幅のbaseを100として考える。

const points = [
    {areaNum: 1, x: 500, y: 500},
    {areaNum: 2, x: 600, y: 600},
    {areaNum: 3, x: 700, y: 700},
];

type Borders = {
    leftXBoarder: number;
    rightXBoarder: number;
    topYBoarder: number;
    bottomYBoarder: number;
}

type Props = {
    storePaneInfoSetter: Dispatch<SetStateAction<StorePaneInfoType | null>>
};


const PanZoomComponent: FC<Props> = ({storePaneInfoSetter}: Props) => {
    const [screenHookWidth, screenHookHeight] = useWindowSize();

    const [scale, setScale] = useState<number>(1);

    const congestionsInfo: CongestionType[] = congestionDataSample;

    const movableRef = useRef<any>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);

    const handleImgClicked = (index: number, congestionLevel: 0 | 1 | 2 | 3) => {
        const value: StorePaneInfoType = {
            focusedNum: index,
            congestionLevel: congestionLevel
        };

        storePaneInfoSetter(value);
    }

    const getBoarders = (scale: number): Borders => {
        const innerWidthSize = window.innerWidth;
        const innerHeightSize = window.innerHeight;

        /*
        console.log("image-width:" + imgRef.current!.clientWidth + " / image-height:" + imgRef.current!.clientHeight);
        console.log("screen-width:" + innerWidthSize + " / screen-height:" + innerHeightSize);
         */

        let leftXBoarder;
        let rightXBoarder;
        let topYBoarder;
        let bottomYBoarder;

        if (innerWidthSize > imgRef.current!.clientWidth) {
            //  フルスクリーンで表示されるとき
            leftXBoarder = 0;
            rightXBoarder = -(imgRef.current!.clientWidth * scale - divRef.current!.clientWidth);
            topYBoarder = 0;
            bottomYBoarder = innerHeightSize - imgRef.current!.clientHeight * scale;

        } else {
            //　スマホなどで小さく表示されるとき
            leftXBoarder = ((imgRef.current!.clientWidth - innerWidthSize) / 2);
            rightXBoarder = -(imgRef.current!.clientWidth * scale - (leftXBoarder + innerWidthSize));
            topYBoarder = 0;
            bottomYBoarder = innerHeightSize - imgRef.current!.clientHeight * scale;
        }
        //console.log("leftXBoarder:" + leftXBoarder + " / rightXBoarder:" + rightXBoarder + " / topYBoarder:" + topYBoarder + " / bottomYBoarder:" + bottomYBoarder);

        return {leftXBoarder, rightXBoarder, topYBoarder, bottomYBoarder};

    };

    const handleStop = (e: any) => {

        let {positionX, positionY, scale} = e.state;

        const {leftXBoarder, rightXBoarder, topYBoarder, bottomYBoarder} = getBoarders(scale);
        //alert(`x:${positionX}, y:${positionY}, scale: ${scale}, screenHeight: ${innerHeightSize},screenWidth: ${innerWidthSize}`);
        if (scale < 1) {
            setScale(1);
            //デフォルトの機能で戻ってくれる
        } else {
            setScale(scale);
            if (positionX > leftXBoarder && positionY > topYBoarder) {
                //console.log("should move 左上");
                movableRef.current.setTransform(leftXBoarder, topYBoarder, scale);
            } else if (positionX < rightXBoarder && positionY > topYBoarder) {
                //console.log("should mov2　右上");
                movableRef.current.setTransform(rightXBoarder, topYBoarder, scale);
            } else if (positionX > leftXBoarder && positionY < bottomYBoarder) {
                //console.log("should mov3　左下");
                movableRef.current.setTransform(leftXBoarder, bottomYBoarder, scale);
            } else if (positionX < rightXBoarder && positionY < bottomYBoarder) {
                //console.log("should move右下");
                movableRef.current.setTransform(rightXBoarder, bottomYBoarder, scale);


            } else if (positionX > leftXBoarder) {
                //console.log("should move5　左");
                movableRef.current.setTransform(leftXBoarder, positionY, scale);
            } else if (positionX < rightXBoarder) {
                //console.log("should move5　右");
                movableRef.current.setTransform(rightXBoarder, positionY, scale);
            } else if (positionY > 0) {
                //console.log("should move6　上");
                movableRef.current.setTransform(positionX, 0, scale);
            } else if (positionY < bottomYBoarder) {
                //console.log("should move　下");
                movableRef.current.setTransform(positionX, bottomYBoarder, scale);
            } else {
                //console.log("ok");
            }

        }

    }

    return (
        <div
            ref={divRef}
            style={{
                height: screenHookHeight,
                /*border: "10px solid blue",
                boxSizing: "border-box"*/
            }}
        >
            <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={2.5}

                limitToBounds={false}
                onPanningStop={(event) => {
                    handleStop(event);
                }}

                onZoomStop={(event) => {
                    handleStop(event);
                }}


                ref={movableRef}
            >
                <TransformComponent>
                    <div style={{
                        height: screenHookHeight,
                    }}>
                        {/*↑この２つを消したら、うまく横スクロールできる*/}
                        <img
                            ref={imgRef}
                            height={screenHookHeight}
                            src="/img/campusMap.svg"
                            //src="https://cdn.pixabay.com/photo/2015/02/24/15/41/dog-647528__340.jpg"
                            alt="test 2"
                            // style={{border: "10px solid red", boxSizing: "border-box"}}

                        />
                        <div
                            style={{
                                height: screenHookHeight,
                                width: "auto",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                display: "block",
                                margin: "0 auto",
                                pointerEvents: "none",
                            }}
                        >
                            {congestionsInfo.map((value) => {
                                    const point = points.find((temp) => temp.areaNum == value.areaNum)
                                    if (!point) {
                                        return null;
                                    } else {
                                        return (
                                            // Imageタグにすると画質が劣化するので、imgタグで対応
                                            <img src={`/img/marks/congestion${value.congestion}.webp`} alt={"busy"}
                                                 key={value.areaNum}
                                                 onClick={() => {
                                                     const myZeroToThree: 0|1|2|3 = value.congestion as 0|1|2|3;
                                                     handleImgClicked(value.areaNum, myZeroToThree);
                                                 }}
                                                 width={(25 / 1000) * screenHookHeight}
                                                 height={(25 / 1000) * screenHookHeight}

                                                 style={{
                                                     position: "absolute",
                                                     top: `${(screenHookHeight / 1000) * point?.y}px`,
                                                     left: `${(screenHookHeight / 1000) * point?.x}px`,
                                                     zIndex: 1,
                                                     pointerEvents: "auto"
                                                 }}
                                            />
                                        );
                                    }
                                }
                            )}
                        </div>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}

export default PanZoomComponent;