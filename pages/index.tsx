import React, {useEffect, useState} from 'react';
import PanZoomComponent from "../lib/components/PanZoomComponent";
import Header from "../lib/components/Header";
import HEAD from "next/head"
import StorePane from "../lib/components/StorePane";
import Image from "next/image";
import initStoresInfoData from "../public/data/storesInfoData.json";
import StoresInfoType from "../lib/type/StoresInfoType";
import CongestionDataType from "../lib/type/CongestionDataType";


type Position = {
    latitude: number | null,
    longitude: number | null
}

const App = () => {
    const [congestionData, setCongestionData] = useState<CongestionDataType | null>(null);
    const [isStorePaneVisible, setIsStorePaneVisible] = useState<boolean>(false);
    const [position, setPosition] = useState<Position>({latitude: null, longitude: null});
    const [storesInfo, setStoresInfo] = useState<StoresInfoType[]>(initStoresInfoData);

    useEffect(() => {
        document.addEventListener("touchmove", mobile_no_scroll, {passive: false});
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setPosition({latitude, longitude});
        });


    }, []);

    useEffect(() => {
        if (congestionData != null) {
            setIsStorePaneVisible(true);
        }
    }, [congestionData]);

    useEffect(() => {
        setIsStorePaneVisible(false);
    }, [storesInfo]);

    function mobile_no_scroll(event: any) {
        if (event.touches.length >= 2) {
            event.preventDefault();
        }
    }

    return (
        <>
            <HEAD>
                <link rel={"icon"} href={"/favicon.png"}/>
            </HEAD>

            <div style={{msOverflowStyle: "none"}}>
                <Header {...{setStoresInfo}}/>
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <PanZoomComponent congestionDataSetter={setCongestionData} targetStoresInfo={storesInfo}/>
                </div>

                {congestionData != null &&
                    <StorePane visible={isStorePaneVisible}
                               visibleSetter={setIsStorePaneVisible}
                               {...{congestionData}}/>
                }

                <div style={{
                    position: "fixed",
                    right: 0,
                    bottom: 0,
                    width: "50%",
                    height: "15%",
                    zIndex: 300,
                    pointerEvents: "none",
                }}>

                    <Image src={"/img/congestion_list2.webp"} alt={"congestion_list"} fill
                           style={{
                               objectFit: "contain",
                               width: "100%",
                               pointerEvents: "none",
                           }}/>
                </div>
            </div>
        </>
    );
}

export default App;
